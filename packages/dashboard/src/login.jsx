import React, { useCallback, useEffect, useState } from 'react'
import LoginContent from './comps/login-content.jsx'
import LoginConnect from './comps/login-connect.jsx'
import LoginMarquee from './comps/login-marquee.jsx'
import LoginForm from './comps/login-form.jsx'
import LoginCopyright from './comps/login-copyright.jsx'
import { useStorecraft } from '@storecraft/sdk-react-hooks'

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
 * 
 * 
 * @param {LoginParams} params
 * 
 */
const Login = ({ }) => {
  const {
    config, sdk,
    actions: {
      updateConfig
    }
  } = useStorecraft();

  const [credentials, setCredentials] = useState(config ?? {});
  const [error, setError] = useState(undefined);

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
        const msg = e ? String(e) : 'check your project ID or API Key'
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
<div className='relative w-full h-full overflow-auto bg-slate-100'>

  <LoginMarquee className='w-full h-12' />
  <LoginConnect className='absolute w-full left-0 top-12 h-fit 
          z-30  --bg-green-300/30 ' />
  <div className='w-full h-fit md:h-screen 
                  flex flex-col 
                  md:overflow-auto
                  items-center justify-start 
                  md:justify-center md:items-start 
                  md:flex md:flex-row 
                  --bg-green-500'>

    <div className='flex-shrink-0 order-1 md:order-1
                    scale-[0.8] -translate-y-6 md:translate-y-0 origin-center
                    w-full max-w-[22rem] --sm:w-[22rem] h-fit 
                    rounded-md md:scale-[0.80] 
                    m-3 --pb-52 md:m-10 md:origin-top-left'
        sstyle={{transformOrigin: 'top center'}}>
      <LoginForm 
          className='w-full ' 
          onSubmit={onSubmit} 
          credentials={credentials}
          onChange={onChange} 
          error={error} />
    </div>

    <LoginContent />
  </div>
  <LoginCopyright 
    className='relative md:fixed md:left-10 md:bottom-0'  />
</div>
  )
}

export default Login