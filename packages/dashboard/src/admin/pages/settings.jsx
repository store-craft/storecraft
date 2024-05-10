import { useDocument } from '@storecraft/sdk-react-hooks'
import ShowIf from '@/admin/comps/show-if.jsx'
import DocumentTitle from '@/admin/comps/document-title.jsx'
import ErrorMessage from '@/admin/comps/error-message.jsx'
import { JsonViewCard } from '@/admin/comps/json.jsx'
import { 
  HR
} from '@/admin/comps/common-ui.jsx'
import { MarkdownViewCard } from '../comps/markdown-card.jsx'
import { SettingsApiKeys } from '../comps/settings-api-keys.jsx'
import { ResourceTitle } from '../comps/resource-title.jsx'


/**
 * 
 * @param {import('@storecraft/core').StorecraftConfig} value 
 */
const info_auth = value => {
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

  return text;
}

/**
 * 
 * @param {import('@storecraft/core').StorecraftConfig} value 
 */
const info_general = value => {
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
  return text;
}

/**
 * 
 * @param {import('@storecraft/core').StorecraftConfig} value 
 */
const info_more = value => {
  let text = '**Checkout** info \n\n';

  switch(value?.checkout_reserve_stock_on) {
    case 'checkout_create':
      text += '> Stock is **automatically** reserved upon \`checkout creation\`'
    case 'checkout_complete':
      text += '> Stock is **automatically** reserved upon \`checkout completion\`'
    default:
      text += '> Stock is **manually** reserved'
  }

  text += '\n\n **Storage** info\n\n \n\n';

  {
    if(value?.storage_rewrite_urls) {
      text += `> Media urls stored at \`storage\` will be rewritten to ${value.storage_rewrite_urls} **CDN**`
    } else {
      text += `> Media urls stored at \`storage\` will **not** be rewritten for **CDN**`
    }
  }

  return text;
}

export default ({ ...rest }) => {

  /**
   * 
   * @type {import('@storecraft/sdk-react-hooks').useDocumentHookReturnType<
   *  import('@storecraft/core').StorecraftConfig>
   * }
   */
  const { 
    doc, loading, hasLoaded, error, resource,
  } = useDocument('info', 'settings', true, true);

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  {/* <DocumentTitle 
      major={['settings', 'main']} 
      className='' />   */}
  <ResourceTitle 
      count={undefined} 
      hasLoaded={hasLoaded} 
      resource={'settings'}/>
      
  <HR  className='my-5' />
  <ShowIf show={hasLoaded}>
    <div className='w-full max-w-[40rem] lg:w-fit lg:max-w-none mx-auto'>
      <ErrorMessage  
          error={error} 
          className='w-full' />
      <div 
          className='w-full items-center lg:max-w-max lg:items-start \
                    lg:w-fit flex flex-col lg:flex-row gap-5 mx-auto'>
        <div className='w-full lg:w-[35rem] flex flex-col gap-5'>
          <SettingsApiKeys />
          <MarkdownViewCard 
              value={info_general(doc)} 
              title='🛍️ Your General Store information'/>  
          <MarkdownViewCard 
              value={info_auth(doc)} 
              title='🔑 Auth information'/>  
          <JsonViewCard value={doc} />        
        </div>
        <div className='w-full lg:w-[19rem] flex flex-col gap-5'>
          <MarkdownViewCard 
              value={info_more(doc)} 
              title='🛒 More information'/>  
        </div>
      </div>                
    </div>                
  </ShowIf>
</div>
  )
}