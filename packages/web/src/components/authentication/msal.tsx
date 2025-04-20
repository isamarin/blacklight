import { useEffect, useState } from 'react'

import Head from 'next/head'
// import styles from '@/styles/Home.module.css'

import { getLocalStorage, setLocalStorage } from '../../utils/localstorage'
import { query } from '../../utils/trpcquery'

export default function MsalAuthentication() {
  const [data2, isLoading, error] = query('auth_msal_start')

  function getAuthenticationdetails() {
    const auth_method = getLocalStorage('auth_method') ?? 'none'
    const auth_token = getLocalStorage('auth_token') ?? ''

    return [auth_method, auth_token]
  }

  const [auth_method, auth_token] = getAuthenticationdetails();
  console.log('Auth method:', auth_method);
  console.log('Auth token:', auth_token);

  useEffect(() => {
    

  }, [auth_method, auth_token]);

  return (
    <>
      <Head>
        <title>Authentication</title>
      </Head>
      MSAL Auth
    </>
  );
}
