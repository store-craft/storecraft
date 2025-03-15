import { BiErrorCircle } from "react-icons/bi/index.js"
import { Bling, HR } from "./common-ui.jsx"
import ShowIf from "./show-if.jsx"
import { useStorecraft } from "@storecraft/sdk-react-hooks"
import { useCallback, useEffect, useState } from "react"

/**
 * 
 * @typedef {object} LoginFormFieldsType
 * @prop {string} [email]
 * @prop {string} [password]
 * @prop {string} [endpoint]
 * 
 */

/**
 * 
 * @typedef {object} InnerFieldParams
 * @prop {object} value 
 * @prop {string} desc 
 * @prop {string} id key in value
 * @prop {string} label 
 * @prop {(id: string, value: string) => void} onChange 
 * 
 * 
 * @param {InnerFieldParams & 
 *  Omit<
 *    React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 
 *    'value' | 'onChange'
 *  >
 * } params
 * 
 */
const Field = (
 { 
   value, desc, id, label, onChange, ...rest 
 }
) => {

 return (
<div className='--text-pink-600 font-semibold'>
 <p children={label} className='tracking-widest text-pink-500' />
 { desc && 
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
                {...rest}/>    
 </Bling>      

</div>    
 )
}


/**
 * 
 * @param {any} e 
 */
const format_error = e => {
  if(typeof e === 'string')
    return e;

  let payload = e?.messages?.[0]?.message ?? 'unknown error';

  return payload;
}

/**
* 
* @typedef {object} InnerLoginFormParams
* @prop {(id: string, value: string) => void} onChange 
* @prop {React.FormEventHandler<HTMLFormElement>} onSubmit 
* @prop {object} error 
* @prop {string} className 
* @prop {LoginFormFieldsType} credentials
* @prop {boolean} [is_backend_endpoint_editable=true]

* 
* @param {InnerLoginFormParams & 
*  Omit<
*   React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 
*   'value' | 'onChange' | 'onSubmit'
*  > 
* } params
* 
*/
const LoginForm = (
 {
   onChange, onSubmit, error, className, 
   credentials, is_backend_endpoint_editable=true,
   ...rest
 }
) => {

 return (
<div className={className}>
 <Bling className='shadow-xl --shadow-gray-300/10 w-full font-mono'
        stroke='border-4' 
        to='to-kf-400 dark:to-kf-500 '>
   <form className='w-full p-5 bg-white dark:shelf-body-bg flex flex-col text-sm 
                     tracking-wider font-medium gap-5 rounded-md'
         onSubmit={onSubmit}>
     <Field 
         id='email' label='Email' type='email' 
         desc={`Email of admin user`} 
         value={credentials} 
         onChange={onChange} autoComplete='on' 
         name='email' />
     <Field 
         id='password' label='Password' type='password' 
         desc={`Password of admin user. Initial password is 'admin'`} 
         value={credentials} 
         onChange={onChange}  
         autoComplete='on' 
         name='password' />
      <HR />
     <Bling 
        stroke='border-4 w-full' rounded='rounded-lg' 
        from='from-kf-500' to='to-pink-500'>
       <input 
           type='submit' value='LOGIN' 
           title='Login' alt='Login'
           className='h-10 rounded-md bg-white tracking-widest 
                       w-full shelf-input-color text-sm hover:ring-pink-400 hover:ring-2 
                       cursor-pointer'/>
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
           <div children={format_error(error)} className='flex-1 whitespace-pre-wrap overflow-x-auto' />
         </div>
       )
     }

     <ShowIf show={is_backend_endpoint_editable}>
      <Field 
          id='endpoint' label='Backend Endpoint' type='text' 
          desc={`The Storecraft Backend Endpoint`} 
          value={credentials} 
          onChange={onChange} autoComplete='on' 
          name='endpoint' />
     </ShowIf>
     <SocialLogin/>
   </form>
 </Bling>    
</div>    
 )
}

const redirects = {
  google: 'http://localhost:5174/?provider=google',
  facebook: 'http://localhost:5174/?provider=facebook',
  github: 'http://localhost:5174/?provider=github',
  x: 'http://localhost:5174?provider=x',
  // x: 'http://127.0.0.1:5174?provider=x',
  // x: 'https://storecreaft.app',
}

export const SocialLogin = (
  {

  }
) => {
  const { sdk } = useStorecraft();
  const [providers, setProviders] = /** @type {ReturnType<typeof useState<import('@storecraft/core/api').OAuthProvider[]>>} */ (useState([]));

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
              redirect_uri: redirects[auth_response.provider],
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
    /** @param {import("@storecraft/core/api").OAuthProvider} provider */
    async (provider) => {
      const response = await sdk.auth.identity_provider_get_authorization_uri(
        {
          provider: provider.provider,
          redirect_uri: redirects[provider.provider]        
        }
      );
      console.log({response})
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
      console.log({info_part, data_part, type})
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