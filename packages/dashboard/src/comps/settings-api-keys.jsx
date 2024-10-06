import { useAuth } from "@storecraft/sdk-react-hooks"
import { Card, HR } from "./common-ui.jsx"
import { useCallback, useEffect, useState } from "react";
import { 
  PromisableLoadingBlingButton, PromisableLoadingButton 
} from "./common-button.jsx";
import { CopyableView } from "./copyable-view.jsx";
import ShowIf from "./show-if.jsx";
import { CiBookmarkRemove } from "react-icons/ci/index.js";

/**
 * 
 * @param {object} params
 * @param {import("@storecraft/core/api").AuthUserType} params.user
 * @param {(user: import("@storecraft/core/api").AuthUserType) => Promise<void>} params.removePromise
 */
const ApikeyUser = (
  {
    user, removePromise
  }
) => {



  return (
<div 
    className='flex flex-row justify-between items-center 
                w-full shelf-input-color p-2 rounded-md '>
  <div className='w-3/4 overflow-x-scroll '>
    <p 
        children={'email: ' + user.email} 
        className='font-mono whitespace-nowrap' />
    <p 
        children={`created at ${new Date(user.created_at).toLocaleDateString()}`} 
        className='font-mono' />
  </div>                  

  <PromisableLoadingBlingButton 
      text="revoke"
      Icon={<CiBookmarkRemove/>}
      className='h-6'
      rounded='rounded-md'
      keep_text_on_load={true}
      onClick={() => removePromise(user)}
      />      
</div>
  )
}

/**
 * 
 * 
 * @typedef {object} SettingsApiKeysParams
 * 
 * 
 * @param {SettingsApiKeysParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 * 
 */
export const SettingsApiKeys = (
  {
    ...rest
  }
) => {

  const {
    actions: {
      apikeys: {
        create, list
      },
      users: {
        remove
      }
    }
  } = useAuth();

  /** @type {ReturnType<typeof useState<import("@storecraft/core/api").AuthUserType[]>>} */
  const [apikeyUsers, setApikeysUsers] = useState([]);
  const [latestApiKey, setLatestApiKey] = useState('');
  /** @type {ReturnType<typeof useState<import("@storecraft/core/api").error>>} */
  const [error, setError] = useState();

  useEffect(
    () => {
      fetchApiKeyUsers();
    }, []
  );

  const fetchApiKeyUsers = useCallback(
    () => {
      list().then(setApikeysUsers).catch(setError);
    }, []
  );

  const removePromise = useCallback(
    /**
     * 
     * @param {import("@storecraft/core/api").AuthUserType} user 
     */
    (user) => {
      return remove(user.id).then(fetchApiKeyUsers).catch(setError);
    }, []
  );

  const createPromise = useCallback(
    () => {
      return create().then(
        apikey => {
          setLatestApiKey(apikey);
          fetchApiKeyUsers();
        }
      ).catch(setError);
    }, []
  );

  return (
<Card 
   name='🔑 API Keys'
   desc='Manage your API keys'
   border={true} 
   error={error?.messages?.[0]?.message}
   setError={setError}
   {...rest}>

  <div className='flex flex-col gap-3 w-full max-h-56 overflow-y-scroll'>
    {
      apikeyUsers.map(
        user => (
          <ApikeyUser 
              user={user} 
              key={user.email} 
              removePromise={removePromise} />
        )
      )
    }

  </div>
  <div className='flex flex-col gap-3 mt-3 w-full'>
    <PromisableLoadingButton 
        Icon={undefined} 
        text='+ create new api key' 
        show={true} 
        onClick={createPromise}
        keep_text_on_load={true}
        classNameLoading='text-xs'
        className='w-fit text-base shelf-text-label-color underline self-end '/>

    <ShowIf show={latestApiKey}>
      <HR className='my-2' />
      <span children='latest api key (only visible to you)' />
      <CopyableView 
          value={`\`${latestApiKey}\``} 
          process_before_copy={value => value.slice(1, -1)} />
    </ShowIf>
  </div>

</Card>   
  )


}