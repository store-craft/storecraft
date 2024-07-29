import { useAuth } from "@storecraft/sdk-react-hooks"
import { BlingInput, Card, HR } from "./common-ui.jsx"
import { useCallback, useEffect, useState } from "react";
import { 
  PromisableLoadingBlingButton, PromisableLoadingButton 
} from "./common-button.jsx";
import { CopyableView } from "./copyable-view.jsx";
import ShowIf from "./show-if.jsx";


/**
 * 
 * 
 * @typedef {object} SettingsChangePasswordParams
 * 
 * 
 * @param {SettingsChangePassword & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 * 
 */
export const SettingsChangePassword = (
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

  /** @type {ReturnType<typeof useState<import("@storecraft/core/v-api").AuthUserType[]>>} */
  const [apikeyUsers, setApikeysUsers] = useState([]);
  const [latestApiKey, setLatestApiKey] = useState('');
  /** @type {ReturnType<typeof useState<import("@storecraft/core/v-api").error>>} */
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
     * @param {import("@storecraft/core/v-api").AuthUserType} user 
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
   name='🔑 Change Password'
   desc='Change Your Password'
   border={true} 
   error={error?.messages?.[0]?.message}
   setError={setError}
   {...rest}>

  <div className='flex flex-col gap-3 w-full max-h-56 overflow-y-scroll'>

  </div>
  <div className='flex flex-col gap-3 --mt-3 w-full'>
    <p children='Current Password' />
    <BlingInput stroke='border-none' />
    <p children='New Password' />
    <BlingInput stroke='border-none' />
    <p children='Confirm New Password' />
    <BlingInput stroke='border-none' />
    <PromisableLoadingBlingButton 
        Icon={undefined} 
        text='update' 
        show={true} 
        onClick={createPromise}
        keep_text_on_load={true}
        classNameLoading='text-xs'
        rounded='rounded-md'
        className='w-fit text-base shelf-text-label-color  self-end '/>

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