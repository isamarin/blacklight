import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { trpc } from '../trpc';
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC, RouterOutputs } from "../utils/trpc";

interface AuthContextType {
  startAuth: () => Promise<RouterOutputs["auth_msal_start"] | undefined>;
  verifyCode: (code: string) => Promise<RouterOutputs["auth_msal_verify"] | undefined>;
  logout: () => void;
  getWebToken: () => { uhs: string; token: string };
  getxHomeToken: () => { market: string; language: string; token: string };
  getxCloudToken: () => { market: string; language: string; token: string };
  getUserRefreshToken: () => string | undefined;
  authState?: {
    userToken: RouterOutputs["auth_msal_verify"] | null;
    webToken: RouterOutputs["auth_get_webtoken"] | null;
    streamingTokens: RouterOutputs["auth_get_streamingtokens"] | null;
  };
  isAuthenticated: boolean;
  isAuthenticating: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type UserTokenPayload = RouterOutputs['auth_msal_verify'];

const normalizeUserToken = (
  token: UserTokenPayload | RouterOutputs['auth_msal_refresh'],
): UserTokenPayload => {
  if ('data' in token) {
    const { data } = token;
    return {
      token_type: data.token_type,
      scope: data.scope,
      expires_in: data.expires_in,
      ext_expires_in: data.ext_expires_in ?? data.expires_in,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      id_token: data.id_token ?? '',
    };
  }

  return token;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [authState, setAuthState] = useState<{
    userToken: RouterOutputs["auth_msal_verify"] | null;
    webToken: RouterOutputs["auth_get_webtoken"] | null;
    streamingTokens: RouterOutputs["auth_get_streamingtokens"] | null;
  }>({
    userToken: null,
    webToken: null,
    streamingTokens: null,
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState<boolean>(false);

  const fetchTokensForUser = async (userToken: UserTokenPayload) => {
    const [webToken, streamingTokens] = await Promise.all([
      queryClient.fetchQuery(trpc.auth_get_webtoken.queryOptions(userToken)),
      queryClient.fetchQuery(trpc.auth_get_streamingtokens.queryOptions(userToken)),
    ]);

    setAuthState({
      userToken,
      webToken,
      streamingTokens,
    });
    setIsAuthenticated(true);
  };

  const clearAuth = () => {
    setAuthState({
      userToken: null,
      webToken: null,
      streamingTokens: null,
    });
    setIsAuthenticated(false);
    localStorage.removeItem('userToken');
  };

  // Load saved auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      setIsAuthenticating(true);
      const savedUserToken = localStorage.getItem('userToken');
      if (savedUserToken) {
        try {
          const userToken = normalizeUserToken(
            JSON.parse(savedUserToken) as UserTokenPayload | RouterOutputs['auth_msal_refresh'],
          );

          try {
            await fetchTokensForUser(userToken);
          } catch (error) {
            console.error('Failed to fetch tokens, attempting refresh:', error);

            try {
              const refreshedToken = normalizeUserToken(
                await queryClient.fetchQuery(trpc.auth_msal_refresh.queryOptions(userToken)),
              );
              localStorage.setItem('userToken', JSON.stringify(refreshedToken));
              await fetchTokensForUser(refreshedToken);
            } catch (refreshError) {
              console.error('Failed to refresh tokens:', refreshError);
              clearAuth();
            }
          }
        } catch (e) {
          console.error('Failed to parse saved user token', e);
          clearAuth();
        }
      }
      setHasLoadedFromStorage(true);
      setIsAuthenticating(false);
    };

    loadAuthState();
  }, []);

  // Save only userToken to localStorage (not web/streaming tokens)
  // Only save after we've loaded from storage to avoid removing on initial render
  useEffect(() => {
    if (!hasLoadedFromStorage) return;
    
    if (authState.userToken) {
      localStorage.setItem('userToken', JSON.stringify(authState.userToken));
    }
  }, [authState.userToken, hasLoadedFromStorage]);

  const startAuth = async () => {
    const result = await queryClient.fetchQuery(trpc.auth_msal_start.queryOptions());
    return result;
  };

  const verifyCode = async (code: string) => {
    // setIsAuthenticating(true);
    try {
      const userToken = await queryClient.fetchQuery(trpc.auth_msal_verify.queryOptions(code));
      console.log('User token obtained:', userToken);
      
      // Save userToken immediately to localStorage
      localStorage.setItem('userToken', JSON.stringify(userToken));
      
      await fetchTokensForUser(userToken);

      return userToken;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    clearAuth();
  };

  const getBrowserLanguage = () => {
    const primaryLang = navigator.languages?.[0]?.split('-')[0] || 'en';
    const regionalVariant = navigator.languages?.find(lang => 
      lang.toLowerCase().startsWith(primaryLang + '-')
    )?.toLowerCase() || `${primaryLang}-us`;

    return regionalVariant
  }

  const getWebToken = () => {
    return {
      uhs: authState?.webToken?.data.DisplayClaims?.xui[0]?.uhs || '', // @TODO: Fix typing
      token: authState?.webToken?.data.Token || '',
    }
  }

  const getxHomeToken = () => {
    return {
      market: authState.streamingTokens?.xHomeToken?.data.market || '',
      language: getBrowserLanguage() || 'en-us',
      token: authState.streamingTokens?.xHomeToken?.data.gsToken || '',
    }
  }

  const getxCloudToken = () => {
    return {
      market: authState.streamingTokens?.xCloudToken?.data.market || '',
      language: getBrowserLanguage() || 'en-us',
      token: authState.streamingTokens?.xCloudToken?.data.gsToken || '',
    }
  }

  const getUserRefreshToken = () => {
    return authState.userToken?.refresh_token;
  }

  return (
    <AuthContext.Provider
      value={{
        startAuth,
        verifyCode,
        logout,
        authState,
        isAuthenticated,
        isAuthenticating,
        getWebToken,
        getxHomeToken,
        getxCloudToken,
        getUserRefreshToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
