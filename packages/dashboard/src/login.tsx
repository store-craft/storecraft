import { ComponentProps, useCallback, useEffect, useState } from 'react'
import LoginConnect from './comps/login-connect'
import LoginMarquee from './comps/login-marquee'
import LoginForm, { LoginFormFieldsType } from './comps/login-form'
import LoginCopyright from './comps/login-copyright'
import { useStorecraft } from '@storecraft/sdk-react-hooks'
import useDarkMode from '@/hooks/use-dark-mode'
import LoginLatestUpdates from './comps/login-latest-updates'
import { ApiAuthResult } from '@storecraft/core/api'
import { format_storecraft_errors } from './comps/error-message'

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

  const [credentials, setCredentials] = useState<LoginFormFieldsType>(
    {
      email: (config?.auth as ApiAuthResult)?.access_token?.claims?.email,
      endpoint: config?.endpoint
    }
  );
  const [error, setError] = useState(undefined);
  const { darkMode, toggle } = useDarkMode();

  // console.log('credentials ', credentials)

  useEffect(
    () => {
      const searchParams = new URLSearchParams(location.search);
      const params = Object.fromEntries(searchParams.entries());

      setCredentials(c => ({...c, ...params}));
    }, [location.search]
  );
  
  const onChange: ComponentProps<typeof LoginForm>["dash"]["onChange"] = useCallback(
    (id, val) => {
      setCredentials({ 
        ...credentials, 
        [id] : val 
      });
    },
    [credentials],
  );

  const signinWithErrorHandling = useCallback(
    async () => {
      try {
        updateConfig({
          endpoint: credentials.endpoint,
        });
        const auth = await sdk.auth.signin(
          credentials.email,    
          credentials.password
        );
      } catch (e) {
        console.error('error ', e)
        setError(
          format_storecraft_errors(e)?.join('\n') ??
          'Unknown Error'
        )
      }
    },
    [sdk, updateConfig, credentials],
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
          dash={
            {
              is_backend_endpoint_editable,
              signinWithErrorHandling, 
              credentials,
              onChange,
              error
            }
          }
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