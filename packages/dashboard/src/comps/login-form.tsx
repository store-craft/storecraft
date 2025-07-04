import { BiErrorCircle } from "react-icons/bi"
import { Bling, HR } from "./common-ui"
import ShowIf from "./show-if"
import { useStorecraft } from "@storecraft/sdk-react-hooks"
import { useCallback, useEffect, useState } from "react"
import { withDashDiv } from "./types"
import { OAuthProvider } from "@storecraft/core/api"
import { format_storecraft_errors } from "./error-message"
import { CgSpinnerTwoAlt } from "react-icons/cg"

export type LoginFormFieldsType = {
  email?: string
  password?: string
  endpoint?: string
}

type FieldParams = withDashDiv<{
  value: string | number,
  desc?: string
  label: string
  onChange: (value: string) => void,
  input_params?: React.ComponentProps<"input">
}>

const Field = (
  {
    dash: {
      value, desc, label, onChange, 
      input_params
    },
    ...rest 
  }: FieldParams
) => {

 return (
<div 
  className='--text-pink-600 font-semibold' 
  {...rest}>
  <p 
    children={label} 
    className='tracking-widest text-pink-500' 
  />
  { 
    desc && 
    <p children={desc} 
      className='tracking-normal font-inter my-3 
        font-normal --text-gray-500' />
  }
  <Bling className='mt-2'>
    <input 
      className='rounded-md h-10 px-3
        w-full block shelf-input-color
      hover:ring-pink-400 hover:ring-2
        font-normal transition-none' 
      value={value ?? ''} 
      onChange={e => onChange(e.currentTarget.value)} 
      {...input_params}
    />    
  </Bling>      

</div>    
 )
}


const format_error = (e: any) => {
  if(typeof e === 'string')
    return e;

  let payload = e?.messages?.[0]?.message 
    ?? 'unknown error';

  return payload;
}

export type LoginFormProps = withDashDiv<
  {
    // onChange: (id: string, value: string) => void,
    defaultCredentials: LoginFormFieldsType,
    signinWithErrorHandling: (
      email: string, password: string, endpoint?: string
    ) => Promise<void>,
    // error: object,
    // credentials: LoginFormFieldsType,
    is_backend_endpoint_editable?: boolean 
  }
>


const LoginForm = (
  {
    dash: {
      signinWithErrorHandling, 
      is_backend_endpoint_editable=true,
      defaultCredentials,
    },
    ...rest
 }: LoginFormProps
) => {

  const [credentials, setCredentials] = useState(defaultCredentials);
  const [error, setError] = useState(undefined);
  const { sdk, actions: { updateConfig } } = useStorecraft();
  const [isLoadingSignin, setIsLoadingSignin] = useState(false);

  const onEndpointChange = useCallback(
    (value: string) => {
      setCredentials(
        c => ({...c, endpoint: value})
      );
      updateConfig({
        ...sdk.config,
        endpoint: value,
      });
    }, [updateConfig]
  );

  useEffect(
    () => {
      setCredentials(
        c => ({...defaultCredentials, ...c})
      );
    }, [defaultCredentials]
  );

  const onSubmit_internal: React.FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();

      setIsLoadingSignin(true);
      // setError(undefined);
      setIsLoadingSignin(true);

      try {
        await signinWithErrorHandling(
          credentials.email, 
          credentials.password, 
          credentials.endpoint
        );
      } catch (e) {
        console.error('error ', e)
        setError(
          format_storecraft_errors(e)?.join('\n') ??
          'Unknown Error'
        )
      } finally {
        setIsLoadingSignin(false);
      }
    }, [signinWithErrorHandling, credentials]
  );

 return (
<div {...rest}>
  <Bling 
    className='shadow-xl w-full font-mono'
    stroke='border-4' 
    to='to-kf-400 dark:to-kf-500 '>
    <form 
      className='w-full p-5 shelf-login-form-bg flex flex-col text-sm 
        tracking-wider font-medium gap-5 rounded-md'
      onSubmit={onSubmit_internal}
      >
      <Field 
        dash={
          {
            label: 'Email', 
            input_params: {
              type: 'email',
              autoComplete: 'on',
              name: 'email' 
            },
            desc: 'Email of admin user',
            value: credentials.email,
            onChange: (value) => {setCredentials({ ...credentials, email: value })}  
          }
        }
      />
      <Field 
        dash={
          {
            label: 'Password', 
            input_params: {
              type: 'password',
              autoComplete: 'on',
              name: 'password' 
            },
            desc: `Password of admin user. Initial password is 'admin'`,
            value: credentials.password,
            onChange: (value) => {setCredentials({ ...credentials, password: value })}  
          }
        }
      />
      <HR />
      <Bling 
        stroke='border-4 w-full' rounded='rounded-lg' 
        from='from-kf-500' to='to-pink-500'>
        <button 
          type='submit' 
          children={
            (
              <div className='flex flex-row items-center gap-2'>
                LOGIN
                {
                  isLoadingSignin && 
                  <CgSpinnerTwoAlt 
                    className='animate-spin w-5 h-5 text-pink-400' />
                }
              </div>
            ) 
          }
          title='Login' 
          className='h-10 rounded-md tracking-widest 
            w-full shelf-input-color text-sm 
            hover:ring-pink-400 hover:ring-2 
            cursor-pointer text-center
            flex flex-row items-center justify-center'
        />
      </Bling>
      {
        error &&
        (
          <div className='flex flex-row flex-nowrap 
            items-center text-sm w-full
            text-red-600 border-red-600 
            dark:text-red-500 
            dark:bg-red-400/10 
            bg-red-400/20 
            border rounded-md p-3 gap-3 '>
            <BiErrorCircle 
              className='flex-inline text-2xl 
                flex-shrink-0 opacity-70' /> 
            <div 
              children={format_error(error)} 
              className='flex-1 whitespace-pre-wrap overflow-x-auto' />
          </div>
        )
      }

      <ShowIf show={is_backend_endpoint_editable}>
        <Field 
          dash={
            {
              label: 'Backend Endpoint', 
              input_params: {
                type: 'text',
                autoComplete: 'on',
                name: 'endpoint' 
              },
              desc: `The Storecraft Backend Endpoint`,
              value: credentials.endpoint,
              onChange: onEndpointChange  
            }
          }
        />
      </ShowIf>
      {
        (
          !is_backend_endpoint_editable || 
          (is_backend_endpoint_editable && credentials.endpoint)
        ) &&
        <SocialLogin/>
      }
    </form>
  </Bling>    
</div>    
 )
}

// const redirects = {
//   google: 'http://localhost:5174/?provider=google',
//   facebook: 'http://localhost:5174/?provider=facebook',
//   github: 'http://localhost:5174/?provider=github',
//   x: 'http://localhost:5174?provider=x',
//   // x: 'http://127.0.0.1:5174?provider=x',
//   // x: 'https://storecreaft.app',
// }

const to_redirect = (handle: string) => {
  const url = new URL(window.location.href);
  const redirect = new URL(url.pathname, url.origin);
  redirect.searchParams.set('provider', handle);

  console.log(
    {redirect}
  );

  return redirect.toString();
}

export const SocialLogin = (
  {
  }
) => {
  const { sdk, config } = useStorecraft();
  const [providers, setProviders] = useState<OAuthProvider[]>([]);

  useEffect(
    () => {
      async function init() {
        sdk.auth.identity_providers_list().then(
          (ps) => {
            if(Array.isArray(ps)) {
              setProviders(ps);
            }
          }
        )
        .catch(
          (e) => {
            console.log('error', e);
            setProviders([]);
          }
        );

        if(window.location.search) {
          const auth_response = Object.fromEntries(
            new URLSearchParams(window.location.search)
          );

          const response = await sdk.auth.identity_provider_sign(
            {
              provider: auth_response.provider,
              // redirect_uri: redirects[auth_response.provider],
              redirect_uri: to_redirect(auth_response.provider),
              authorization_response: auth_response      
            }
          );
          window.history.pushState(null, '', '/');
          // console.log('auth_response', auth_response)
          // console.log('response', response)
        }
      }
      init();
    }, [sdk, config]
  );

  // https://x.com/i/oauth2/authorize?client_id=ci1sTW5MZXFOX1NWSFZ2YUNJd0Y6MTpjaQ&redirect_uri=https%253A%252F%252Fstorecreaft.app&response_type=code&scope=users.read&code_challenge_method=s256&code_challenge=j1dwnjlO0XxOZGZiG0eaWfn9_yddisrWhZng_ARMgi8&state=f0d4f988-3759-4685-85c5-233d5a5b2f78
  const onClick = useCallback(
    async (provider: OAuthProvider) => {
      const response = await sdk.auth.identity_provider_get_authorization_uri(
        {
          provider: provider.provider,
          redirect_uri: to_redirect(provider.provider)
        }
      );
      // console.log({response})
      if(typeof response.uri === 'string')
        window.location.href = response.uri;
    }, []
  );

  if(providers.length === 0) 
    return null;

  return (
    <div className='flex flex-col gap-5'>
      <div className="flex items-center">
        <div className="flex-grow border shelf-border-color  h-0.5"></div>
        <div className="flex-grow-0 mx-3 font-mono capitalize">social login</div>
        <div className="flex-grow border shelf-border-color h-0.5"></div>
      </div>
      <div className={
        'flex flex-row items-center gap-3 ' + 
        (providers.length > 0 ? 'animate-fadein' : 'animate-fadeout')
        }>
        {
          providers?.map(
            (provider, ix) => (
              <img 
                onClick={() => onClick(provider)}
                className='h-7 cursor-pointer'
                key={provider.provider} 
                src={img_with_src_data(provider.logo_url)} 
                alt={provider.description ?? provider.name} 
              />
            )
          )
        }
      </div>
    </div>
  )
}

const img_with_src_data = (url='') => {
  try {
    if(url.startsWith('data:')) {
      // data:image/svg+xml;charset=utf-8,
      const [info_part, ...data_part] = url.split(',');
      const type = info_part.split(';').at(0).split('data:').at(-1);

      // console.log({info_part, data_part, type})

      return URL.createObjectURL(
        new Blob([data_part.join(',')], { type })
      ); 
    }
  } catch (e) {
    console.log(e);
  }

  return url
}

export default LoginForm;