import { BiErrorCircle } from "react-icons/bi/index.js"
import { Bling, HR } from "./common-ui.jsx"
import ShowIf from "./show-if.jsx"
import { useStorecraft } from "@storecraft/sdk-react-hooks"
import { useCallback, useEffect, useState } from "react"
import { withDash, withDashDiv } from "./types.js"
import { OAuthProvider } from "@storecraft/core/api"

export type LoginFormFieldsType = {
  email?: string
  password?: string
  endpoint?: string
}

type FieldParams = withDashDiv<{
  value: object,
  desc?: string
  id: string,
  label: string
  onChange: (id: string, value: string) => void,
  input_params?: React.ComponentProps<"input">
}>

const Field = (
  {
    dash: {
      value, desc, id, label, onChange, 
      input_params
    },
    ...rest 
  }: FieldParams
) => {

 return (
<div className='--text-pink-600 font-semibold' {...rest}>
  <p children={label} className='tracking-widest text-pink-500' />
  { 
    desc && 
    <p children={desc} 
      className='tracking-normal font-inter my-3 
                  font-normal --text-gray-500' />
  }
  <Bling className='mt-2'>
    <input 
      className={`rounded-md h-10 px-3
                  w-full block 
                  shelf-input-color
                  hover:ring-pink-400 hover:ring-2
                  font-normal transition-none `} 
      value={value[id] ?? ''} 
      onChange={e => onChange(id, e.currentTarget.value)} 
      {...input_params}
    />    
  </Bling>      

</div>    
 )
}


const format_error = (e: any) => {
  if(typeof e === 'string')
    return e;

  let payload = e?.messages?.[0]?.message ?? 'unknown error';

  return payload;
}

export type LoginFormProps = withDashDiv<
  {
    onChange: (id: string, value: string) => void
    onSubmit: React.FormEventHandler<HTMLFormElement>
    error: object
    credentials: LoginFormFieldsType
    is_backend_endpoint_editable?: boolean 
  }
>


const LoginForm = (
  {
    dash: {
      onChange, onSubmit, error, 
      credentials, is_backend_endpoint_editable=true,
    },
    ...rest
 }: LoginFormProps
) => {

 return (
<div {...rest}>
  <Bling 
    className='shadow-xl --shadow-gray-300/10 w-full font-mono'
    stroke='border-4' 
    to='to-kf-400 dark:to-kf-500 '>
  <form 
    className='w-full p-5 shelf-login-form-bg flex flex-col text-sm 
        tracking-wider font-medium gap-5 rounded-md'
    onSubmit={onSubmit}>
    <Field 
      dash={
        {
          id:'email', label: 'Email', 
          input_params: {
            type: 'email',
            autoComplete: 'on',
            name: 'email' 
          },
          desc: 'Email of admin user',
          value: credentials,
          onChange: onChange  
        }
      }
    />
    <Field 
      dash={
        {
          id:'password', label: 'Password', 
          input_params: {
            type: 'password',
            autoComplete: 'on',
            name: 'password' 
          },
          desc: `Password of admin user. Initial password is 'admin'`,
          value: credentials,
          onChange: onChange  
        }
      }
    />
    <HR />
      <Bling 
        stroke='border-4 w-full' rounded='rounded-lg' 
        from='from-kf-500' to='to-pink-500'>
        <input 
          type='submit' value='LOGIN' 
          title='Login' alt='Login'
          className='h-10 rounded-md --bg-white tracking-widest 
            w-full shelf-input-color text-sm hover:ring-pink-400 hover:ring-2 
            cursor-pointer'
        />
      </Bling>
      {
        error &&
        (
          <div className='flex flex-row flex-nowrap items-center text-sm w-full
                         text-red-600 border-red-600 
                         dark:text-red-500 
                         dark:bg-red-400/10 
                         bg-red-400/20 
                         border
                         rounded-md p-3 gap-3 '>
            <BiErrorCircle 
               className='flex-inline text-2xl flex-shrink-0 opacity-70' /> 
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
              id:'endpoint', label: 'Backend Endpoint', 
              input_params: {
                type: 'text',
                autoComplete: 'on',
                name: 'endpoint' 
              },
              desc: `The Storecraft Backend Endpoint`,
              value: credentials,
              onChange: onChange  
            }
          }
        />
      </ShowIf>
      <SocialLogin/>
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

  // console.log(
  //   {redirect}
  // );

  return redirect.toString();
}

export const SocialLogin = (
  {
  }
) => {
  const { sdk } = useStorecraft();
  const [providers, setProviders] = useState<OAuthProvider[]>([]);

  useEffect(
    () => {
      async function init() {
        sdk.auth.identity_providers_list().then(setProviders);

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
    }, [sdk]
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

  return (
    <div className='flex flex-row items-center gap-3'>
      {
        providers?.map(
          (provider, ix) => (
            <img 
              onClick={() => onClick(provider)}
              className='h-7 cursor-pointer'
              key={provider.provider} 
              src={img_with_src_data(provider.logo_url)} 
              alt={provider.description ?? provider.name} />
          )
        )
      }
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