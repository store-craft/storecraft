import { useCallback, useEffect, useState } from 'react'
import LoginConnect from './comps/login-connect'
import LoginMarquee from './comps/login-marquee'
import LoginForm, { LoginFormFieldsType } from './comps/login-form'
import LoginCopyright from './comps/login-copyright'
import { useStorecraft } from '@storecraft/sdk-react-hooks'
import useDarkMode from '@/hooks/use-dark-mode'
import LoginLatestUpdates from './comps/login-latest-updates'

export const sleep = (ms=100) => {
  return new Promise(
    (resolve, reject) => {
      setTimeout(
        resolve, ms
      )
    }
  )
}

const Login = (
  { 
    is_backend_endpoint_editable=true
  }: {
    is_backend_endpoint_editable?: boolean
    trigger?: () => void
  }
) => {

  const {
    config, sdk, actions: {
      updateConfig
    }
  } = useStorecraft();

  const [defaultCredentials, setDefaultCredentials] = useState<LoginFormFieldsType>(
    {
      endpoint: config?.endpoint
    }
  );
  // const [error, setError] = useState(undefined);
  const { darkMode } = useDarkMode();

  // console.log('credentials ', credentials)

  useEffect(
    () => {
      const searchParams = new URLSearchParams(location.search);
      const params = Object.fromEntries(searchParams.entries());

      setDefaultCredentials(c => ({...c, ...params}));
    }, [location.search]
  );

  const signinWithErrorHandling = useCallback(
    async (email: string, password: string, endpoint?: string) => {
      updateConfig({
        endpoint,
      });
      await sleep(300)
      const auth = await sdk.auth.signin(
        email,    
        password
      );
    },
    [sdk],
  );

  return (
<div 
  className={`relative w-full h-full ` + (darkMode ? 'dark' : '')}>
  <div 
    className='relative w-full h-full overflow-auto shelf-body-bg '>

    <LoginMarquee 
      className='w-full h-12 --bg-green-400' />
    <LoginConnect 
      className='absolute w-full left-0 top-12 h-fit z-30' />
    <div 
      className='w-full h-fit md:h-[calc(100%-3rem)] 
        flex flex-col p-10 items-center justify-start 
        md:justify-start md:items-start md:flex-row gap-10'>

      <div 
        className='flex-shrink-0 order-first md:order-first
          origin-top md:origin-top-left w-full max-w-[22rem] 
          h-fit rounded-md'
          // @ts-ignore
          sstyle={{transformOrigin: 'top center'}}>
        <LoginForm 
          dash={{
            is_backend_endpoint_editable,
            signinWithErrorHandling, 
            defaultCredentials,
          }}
          className='w-full' 
        />
      </div>

      <LoginLatestUpdates 
        className='flex-1 h-fit md:h-full ' />
    </div>
    <LoginCopyright 
      className='relative md:fixed md:left-10 md:bottom-0'  />
  </div>
</div>    
  )
}

export default Login