import { useEffect, useState, Fragment } from 'react'
import { Button, CircularProgress, Card, CardBody } from '@heroui/react'

import Head from 'next/head'

import { getLocalStorage, getSessionStorage, setSessionStorage } from '../utils/localstorage'
import { trpcReact } from '../providers/trpc';

import MsalAuthentication from './authentication/msal'

/*
 The authentication component is responsible for handling the authentication flow for the application. It checks if the user is signed in,
 and if not, it displays the available authentication methods (XAL and MSAL).
 If the user is signed in, it retrieves the necessary tokens and displays the main application content.

 Tokens are shared via a session storage, and the authentication method is stored in local storage.
 The component uses the `trpcReact` library to fetch the tokens from the server.
*/

interface AuthenticationProps {
  children: React.ReactNode;
}

export default function Authentication({ children }:AuthenticationProps) {
  const [authMethod, setAuthMethod] = useState('none')
  const [signedInMethod] = useState(getLocalStorage('auth_method') ?? 'none')

  // Check if we have local tokens
  const [webToken] = useState(getSessionStorage('auth_web_token') ?? undefined)
  const [xCloudToken] = useState(getSessionStorage('auth_xcloud_token') ?? undefined)
  const [xHomeToken] = useState(getSessionStorage('auth_xhome_token') ?? undefined)

  console.log('Loaded tokens:')
  console.log(webToken)
  console.log(xCloudToken)
  console.log(xHomeToken)
  
  const [userToken] = useState(getLocalStorage('auth_data_msal') ?? '{}')
  const { data: streamingTokens, isLoading: loadingStreamingTokens } = trpcReact.auth_get_streamingtokens.useQuery(
    (userToken),
    { enabled: (signedInMethod !== 'none' && webToken === undefined) }
  );
  const { data: webTokens, isLoading: loadingWebTokens } = trpcReact.auth_get_webtoken.useQuery(
    (userToken),
    { enabled: (signedInMethod !== 'none' && (xCloudToken === undefined || xHomeToken === undefined )) }
  );

  // Workaround for server-side rendering issues
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Render nothing on the server to avoid mismatched HTML
    return null;
  }

  if(signedInMethod !== 'none'){

    if(webTokens !== undefined){
      setSessionStorage('auth_web_token', JSON.stringify(webTokens.data))
    }
    if(streamingTokens !== undefined){
      setSessionStorage('auth_xcloud_token', JSON.stringify(streamingTokens.xCloudToken.data))
      setSessionStorage('auth_xhome_token', JSON.stringify(streamingTokens.xHomeToken.data))
    }
  }

  return (
    <>
      <Head>
        <title>Authentication</title>
      </Head>
      {
        signedInMethod !== 'none' ? 
          // We are signed in, but we dont have tokens yet..
          (loadingStreamingTokens || loadingWebTokens) ?
            <main className="container mx-auto max-w-screen px-6 flex-grow pt-16">
              <Card><CardBody>
                <center>
                  <CircularProgress label="Authenticating..." />
                  <br />
                  {(loadingWebTokens === true) ? <p className="text-center">Retrieving web token...</p> : ''}
                  {(loadingStreamingTokens === true) ? <p className="text-center">Retrieving streaming tokens...</p> : ''}
                </center>
              </CardBody></Card>
            </main> :
          // We are signed in, and we have the session tokens in the sessionStorage so lets show the UI
            <div>{ children }</div> :
        // We are not signed in, so we need to show the authentication methods & subpages
        <main className="container mx-auto max-w-screen px-6 flex-grow pt-16">
          { authMethod === "msal" ? 
            <MsalAuthentication /> :
            <Fragment>
              <center>
                <Button tabIndex={0} key='1'data-nav data-nav-group="default" color="primary" onPress={() => { setAuthMethod('xal') }}>Start XAL</Button>
                <Button tabIndex={0} key='2' data-nav data-nav-group="default" color="primary" onPress={() => { setAuthMethod('msal') }}>Start MSAL</Button>
              </center>
            </Fragment>
          }
        </main>
      }
    </>
  );
}
