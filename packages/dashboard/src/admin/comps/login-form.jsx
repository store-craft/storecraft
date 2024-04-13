import { BiErrorCircle } from "react-icons/bi/index.js"
import { Bling } from "./common-ui.jsx"

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
*  Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'value'>
* } params
* 
*/
const Field = (
 { 
   value, desc, id, label, onChange, ...rest 
 }
) => {

 return (
<div className='text-pink-600 font-semibold'>
 <p children={label} className='tracking-widest' />
 { desc && 
   <p children={desc} 
      className='tracking-normal font-inter my-3 
                 font-normal text-gray-500' />
 }
 <Bling className='mt-2'>
   <input 
       className={`rounded-md h-10 px-3
                   w-full block text-base text-gray-800
                 placeholder-gray-400 bg-slate-100 rounded-xs
                 focus:outline-kf-300 
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
* @typedef {object} InnerLoginFormParams
* @prop {(id: string, value: string) => void} onChange 
* @prop {React.FormEventHandler<HTMLFormElement>} onSubmit 
* @prop {object} error 
* @prop {string} className 
* @prop {LoginFormFieldsType} credentials
* 
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
   onChange, onSubmit, error, className, credentials, ...rest
 }
) => {
 return (
<div className={className}>
 <Bling className='shadow-lg shadow-gray-300'
        stroke='p-1' to='to-kf-400'>
   <form className='w-full p-5 bg-white flex flex-col text-sm 
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
         onChange={onChange}  autoComplete='on' 
         name='password' />
     <Bling stroke='p-1 w-full' from='from-kf-500' to='to-pink-400'>
       <input 
           type='submit' value='LOGIN' 
           title='Login' alt='Login'
           className='h-10 rounded-md bg-white tracking-widest 
                       w-full text-gray-500 text-base 
                       cursor-pointer'/>
     </Bling>
     {
       error &&
       (
         <div className='flex flex-row flex-nowrap items-center text-base 
                         text-red-700 bg-red-100 border border-red-400 
                         rounded-md p-3 mt-0 '>
           <BiErrorCircle 
               className='flex-inline text-xl flex-shrink-0 opacity-70' /> 
           <div children={error} className='ml-3' />
         </div>
       )
     }

     <Field 
         id='endpoint' label='Backend Endpoint' type='text' 
         desc={`The Storecraft Backend Endpoint`} 
         value={credentials} 
         onChange={onChange} autoComplete='on' 
         name='endpoint' />
   </form>
 </Bling>    
</div>    
 )
}

export default LoginForm;