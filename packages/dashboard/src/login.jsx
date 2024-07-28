import React, { useCallback, useEffect, useState } from 'react'
import LoginContent from './comps/login-content.jsx'
import LoginConnect from './comps/login-connect.jsx'
import LoginMarquee from './comps/login-marquee.jsx'
import LoginForm from './comps/login-form.jsx'
import LoginCopyright from './comps/login-copyright.jsx'
import { useStorecraft } from '@storecraft/sdk-react-hooks'
import useDarkMode from './hooks/useDarkMode.js'
import LoginLatestUpdates from './comps/login-latest-updates.jsx'

const createConfig = c => {
  
  return {
    email: c.email,
    endpoint: c.endpoint
  }
}

/**
 * 
 * @typedef {object} LoginParams
 * @prop {() => void} trigger
 * @prop {boolean} [is_backend_endpoint_editable=true]
 * 
 * 
 * @param {LoginParams} params
 * 
 */
const Login = (
  { 
    is_backend_endpoint_editable=true
  }
) => {

  const {
    config, sdk,
    actions: {
      updateConfig
    }
  } = useStorecraft();

  const [credentials, setCredentials] = useState(config ?? {});
  const [error, setError] = useState(undefined);
  const { darkMode, toggle } = useDarkMode();

  // console.log('credentials ', credentials)

  useEffect(
    () => {
      const searchParams = new URLSearchParams(location.search)
      const params = Object.fromEntries(searchParams.entries())
      setCredentials(c => ({...c, ...params}))
    }, [location.search]
  );
  
  /** @type {import('./comps/login-form.jsx').InnerLoginFormParams["onChange"]} */
  const onChange = useCallback(
    (id, val) => {
      setCredentials(
        { 
          ...credentials, 
          [id] : val 
        } 
      );
    },
    [credentials],
  );

  /** @type {React.FormEventHandler<HTMLFormElement>} */
  const onSubmit = useCallback(
    async (e) => {

      e.preventDefault();

      console.log('submit');

      try {
        // console.log('credentials ', credentials);
        updateConfig(createConfig(credentials));
      } catch (e) {
        const msg = e ? String(e) : 'check your project ID or API Key';

        setError(`Error initializing Shelf, code : ${msg}`)
      }
  
      try {
        await sdk.auth.signin(
          credentials.email,    
          credentials.password
        );

      } catch (e) {
        const code = e ? String(e) : 'Auth error'
        setError(`Error signing, code : ${code}`)
      }
    },
    [sdk, updateConfig, credentials],
  );

  return (
<div className={`relative w-full h-screen ` + (darkMode ? 'dark' : '')}>
  <div className='relative w-full h-full overflow-auto shelf-body-bg'>

    <LoginMarquee className='w-full h-12 --bg-green-400' />
    <LoginConnect className='absolute w-full --bg-green-300 left-0 top-12 h-fit 
            z-30  --bg-green-300/30 ' />
    <div className='w-full h-fit md:h-[calc(100%-3rem)] 
                    flex flex-col p-10
                    --md:overflow-auto
                    items-center justify-start 
                    md:justify-start md:items-start 
                     md:flex-row 
                    --bg-green-500'>

      <div className='flex-shrink-0 order-first md:order-first
                      scale-[0.8] origin-top
                      md:scale-[0.8] md:origin-top-left 
                      w-full max-w-[22rem] h-fit 
                      rounded-md 
                      '
          sstyle={{transformOrigin: 'top center'}}>
        <LoginForm 
            is_backend_endpoint_editable={is_backend_endpoint_editable}
            className='w-full ' 
            onSubmit={onSubmit} 
            credentials={credentials}
            onChange={onChange} 
            error={error} />
      </div>

      <LoginLatestUpdates className='flex-1 h-fit md:h-full ' />
    </div>
    <LoginCopyright 
      className='relative md:fixed md:left-10 md:bottom-0'  />
  </div>
</div>    
  )
}

export default Login