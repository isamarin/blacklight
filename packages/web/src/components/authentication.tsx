import { useEffect, useState } from 'react'

import Head from 'next/head'
// import styles from '@/styles/Home.module.css'

import { getLocalStorage, setLocalStorage } from '../utils/localstorage'
import { query } from '../utils/trpcquery'

import MsalAuthentication from './authentication/msal'

interface AuthenticationProps {
  children: React.ReactNode;
}

export default function Authentication({ children }:AuthenticationProps) {
  const [authMethod, setAuthMethod] = useState('none')

  // const { data, isLoading, error } = trpcReact.auth_msal_start.useQuery()
  const [data2, isLoading, error] = query('auth_msal_start')

  // function getAuthenticationdetails() {
  //   const auth_method = getLocalStorage('auth_method') ?? 'none'
  //   const auth_token = getLocalStorage('auth_token') ?? ''

  //   return [auth_method, auth_token]
  // }

  // const [auth_method, auth_token] = getAuthenticationdetails();
  // console.log('Auth method:', auth_method);
  // console.log('Auth token:', auth_token);

  useEffect(() => {
    

  }, [authMethod]);

  return (
    <>
      <Head>
        <title>Authentication</title>
      </Head>
      {
        authMethod === "none" ? <button onClick={() => { setAuthMethod('msal') }}>Start MSAL</button>
        : authMethod === "msal" ? <MsalAuthentication />
        : children
      }
    </>
  );
}
