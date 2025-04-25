'use client';

import { useEffect, useState } from 'react'
import Head from 'next/head'
import { setLocalStorage } from '../../utils/localstorage'
import { trpcReact } from '../../providers/trpc';

export default function MsalAuthentication() {
    const msal_data = trpcReact.auth_msal_start.useQuery()
    const [msalLogin, setMsalLogin] = useState(msal_data.data)

    const { data: verifyData } = trpcReact.auth_msal_verify.useQuery(
        (msalLogin?.device_code as string),
        {
          enabled: !!msalLogin?.device_code,
        }
    );

  useEffect(() => {
    if(msal_data.data === undefined)
        return;

    setMsalLogin(msal_data.data)
  }, [msal_data.data]);

  useEffect(() => {
    if(msalLogin === undefined)
        return;
    
  }, [msalLogin]);

  useEffect(() => {
    if(verifyData === undefined)
        return;

    setLocalStorage('auth_data_msal', JSON.stringify(verifyData));
    setLocalStorage('auth_method', 'msal');

    // Reload page
    window.location.reload();

  }, [verifyData]);

  return (
    <>
      <Head>
        <title>Authentication</title>
      </Head>
        { msalLogin === undefined ?
         <p>Requesting login url...</p> :
        msalLogin?.message
      }
    </>
  );
}
