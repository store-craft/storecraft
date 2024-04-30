import { useRef } from 'react'
import { useDocument } from '@storecraft/sdk-react-hooks'
import ShowIf from '@/admin/comps/show-if.jsx'
import DocumentTitle from '@/admin/comps/document-title.jsx'
import ErrorMessage from '@/admin/comps/error-message.jsx'
import { JsonViewCard } from '@/admin/comps/json.jsx'
import { 
  Bling, BlingInput, Card, Div, HR, withBling 
} from '@/admin/comps/common-ui.jsx'
import MDView from '../comps/md-view.jsx'


/**
 * @typedef {object} GeneralSettingsParams
 * @prop {import('@storecraft/core').StorecraftConfig} value
 * 
 * 
 * @param {GeneralSettingsParams & 
 *  Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'value'>
 * } params
 * 
 */
const GeneralSettings = (
   { 
     value, ...rest
   }
) => {

  const name = value?.general_store_name ?? 'unknown right now';
  const website = value?.general_store_website ?? 'unknown right now';
  const email = value?.general_store_support_email ?? 'unknown right now';
  const description = value?.general_store_description ?? 'You still have not written one';

  let text = `Hi 👋, **your** store name is \`${name}\`, your store's 
  website is ${website} and the support email is ${email} .\n\n
  <br/>

  The following is the description of your store 
  > ${description}
  `

 return (
<Card 
    name='🛍️ Your General Store information'
    border={true} 
    {...rest}>
  <Bling stroke='pb-px' rounded='rounded-lg' >
    <MDView
        className='rounded-md p-3 
          w-full text-base min-h-8 align-middle
          shelf-input-color flex flex-row items-center' 
        value={text} />
  </Bling>
</Card>    
 )
}


/**
 * @typedef {object} AuthSettingsParams
 * @prop {import('@storecraft/core').StorecraftConfig} value
 * 
 * 
 * @param {AuthSettingsParams & 
 *  Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'value'>
 * } params
 * 
 */
const AuthSettings = (
  { 
    value, ...rest
  }
) => {

  let text = 'Here is what you need to know: \n\n';

  if(value?.auth_admins_emails) {
    text = `- The following are the **admin** emails: \n` + 
    value?.auth_admins_emails.map(mail => `  - ${mail}`).join('\n');
  }

  if(value?.auth_password_hash_rounds) {
    text += `\n- Passwords are hashed with **${value?.auth_password_hash_rounds}** rounds`
  }

  if(value?.auth_secret_access_token) {
    text += `\n- **JWT** access token \`secret\` is **${value?.auth_secret_access_token}**`
  }

  if(value?.auth_secret_refresh_token) {
    text += `\n- **JWT** refresh token \`secret\` is **${value?.auth_secret_refresh_token}**`
  }

  return (
  <Card 
    name='🔑 Auth information'
    border={true} 
    {...rest}>
  <Bling stroke='pb-px' rounded='rounded-lg' >
    <MDView
        className='rounded-md p-3 
          w-full text-base min-h-8 align-middle
          shelf-input-color flex flex-row items-center' 
        value={text} />
  </Bling>
  </Card>    
  )
}


/**
 * @typedef {object} AuthSettingsParams
 * @prop {import('@storecraft/core').StorecraftConfig} value
 * 
 * 
 * @param {AuthSettingsParams & 
*  Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'value'>
* } params
* 
*/
const CheckoutSettings = (
 { 
   value, ...rest
 }
) => {

 let text = 'Here is what you need to know: \n\n';

 if(value?.auth_admins_emails) {
   text = `- The following are the **admin** emails: \n` + 
   value?.checkout_reserve_stock_on.map(mail => `  - ${mail}`).join('\n');
 }

 if(value?.auth_password_hash_rounds) {
   text += `\n- Passwords are hashed with **${value?.auth_password_hash_rounds}** rounds`
 }

 if(value?.auth_secret_access_token) {
   text += `\n- **JWT** access token \`secret\` is **${value?.auth_secret_access_token}**`
 }

 if(value?.auth_secret_refresh_token) {
   text += `\n- **JWT** refresh token \`secret\` is **${value?.auth_secret_refresh_token}**`
 }

 return (
 <Card 
   name='🔑 Auth information'
   border={true} 
   {...rest}>
 <Bling stroke='pb-px' rounded='rounded-lg' >
   <MDView
       className='rounded-md p-3 
         w-full text-base min-h-8 align-middle
         shelf-input-color flex flex-row items-center' 
       value={text} />
 </Bling>
 </Card>    
 )
}


export default ({ ...rest }) => {

  const ref_root = useRef();

  /**
   * 
   * @type {import('@storecraft/sdk-react-hooks').useDocumentHookReturnType<
   *  import('@storecraft/core').StorecraftConfig>
   * }
   */
  const { 
    doc, loading, hasLoaded, error,
  } = useDocument('info', 'settings', true, true);

  console.log('doc', doc);
  

  return (
<div className='w-full mx-auto'>
  <DocumentTitle 
      major={['settings', 'main']} 
      className='' />  
  <HR  className='my-5' />
  <ShowIf show={hasLoaded}>
    <div className='w-full max-w-[40rem] --lg:w-fit --lg:max-w-none mx-auto flex flex-col gap-5'>
      <ErrorMessage  
          error={error} 
          className='w-full' />
      <GeneralSettings value={doc}/>  
      <AuthSettings value={doc}/>  
      <JsonViewCard value={doc} />        
      {/* <FieldsView 
          key={'key'} 
          ref={ref_root} 
          field={root_schema} 
          value={ doc ?? {} } 
          isViewMode={false} 
          className='mt-8' />       */}
    </div>                
  </ShowIf>
</div>
  )
}