// import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

import { RouterOutputs } from "../utils/trpc";
import { useState } from "react";

export function AuthPage() {
    const { isAuthenticated, isAuthenticating, startAuth, verifyCode, logout, authState } = useAuth();
    const [authFlow, setAuthFlow] = useState<RouterOutputs["auth_msal_start"] | undefined>(undefined);

    // // const authState = useQuery(trpc.auth_msal_start.queryOptions());
    // // console.log('Authentication flow started2:', authState);

    async function startAuthenticationFlow() {
        // const authState = useQuery(trpc.auth_msal_start.queryOptions());
        // const authState = await queryClient.fetchQuery(trpc.auth_msal_start.queryOptions());
        const authState = await startAuth();
        console.log('Authentication flow started:', authState);
        setAuthFlow(authState)

        if(authState) {
            const tokens = await verifyCode(authState.device_code);
            console.log('Device code verified, tokens:', tokens);

        } else {
            console.error('Failed to start authentication flow');
        }
    }

    return (
        <>
            <div className="card">
                <h2>Auth</h2>
                <p>Authentication status: <span className={`${isAuthenticating ? 'loading' : isAuthenticated ? 'success' : 'error'}`}>{ isAuthenticating ? 'Authenticating...' : isAuthenticated ? 'Logged in' : 'Not logged in'}</span></p>

                <button onClick={isAuthenticated ? logout : startAuthenticationFlow}>
                    {isAuthenticated ? 'Logout' : 'Start Auth'}
                </button>
            </div>

            { authFlow &&<div className="card">
                <h2>Authentication Flow Status</h2>

                <div id="auth-flow-status">
                    { authFlow.message }


                </div>
            </div> }
            
            {isAuthenticated && (<div className="card">
                <h2>Token Information</h2>

                
                    <div className="tokens-section">
                        <div>
                            <strong>User Token:</strong>
                            <div className="result-section">
                                <pre>{authState?.userToken && JSON.stringify(authState.userToken, null, 2)}</pre>
                            </div>
                        </div>
                        <div>
                            <strong>Web Token:</strong>
                            <div className="result-section">
                                <pre>{authState?.webToken && JSON.stringify(authState.webToken, null, 2)}</pre>
                            </div>
                        </div>
                        <div>
                            <strong>Streaming Tokens:</strong>
                            <div className="result-section">
                                <pre>{authState?.streamingTokens && JSON.stringify(authState.streamingTokens, null, 2)}</pre>
                            </div>
                        </div>
                    </div>
                
            </div>)}
        </>
    );
}
