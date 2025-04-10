import { useAuth } from "@storecraft/sdk-react-hooks"
import { BlingInput, Card, HR } from "./common-ui"
import { useCallback, useRef, useState } from "react";
import { 
  PromisableLoadingBlingButton 
} from "./common-button";
import { IoCheckmarkCircle } from "react-icons/io5";
import { ShowBinarySwitch } from "./show-if";
import { RiLockPasswordLine } from "react-icons/ri";

export const SettingsChangePassword = (
  {
    ...rest
  }: React.ComponentProps<'div'>
) => {

  const {
    auth,
    actions: {
      changePassword: _changePassword
    }
  } = useAuth();

  const ref_current_pass = useRef<HTMLInputElement>(undefined);
  const ref_new_pass = useRef<HTMLInputElement>(undefined);
  const ref_confirm_new_pass = useRef<HTMLInputElement>(undefined);
  const [error, setError] = useState<import("@storecraft/core/api").error>();
  const [success, setSuccess] = useState(false);


  const changePassword = useCallback(
    async () => {

      try {
        setSuccess(false);
        await _changePassword(
          {
            user_id_or_email: auth.user_id,
            current_password: String(ref_current_pass.current.value),
            new_password: String(ref_new_pass.current.value),
            confirm_new_password: String(ref_confirm_new_pass.current.value),
          }
        );
        setSuccess(true);
      } catch(e) {
        console.log('ee ', e)
        setError(e)
      }
      // setError({messages: [ {message: 'tomer'}]})

    }, [_changePassword]
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
    <BlingInput stroke='border-none' ref={ref_current_pass} />
    <p children='New Password' />
    <BlingInput stroke='border-none' ref={ref_new_pass} />
    <p children='Confirm New Password' />
    <BlingInput stroke='border-none' ref={ref_confirm_new_pass} />
    <div className='w-full flex flex-row justify-between mt-3'>
      <ShowBinarySwitch toggle={success}>
        <div className='w-full flex flex-row items-center gap-2 text-xl text-green-500 dark:text-green-400'>
          <IoCheckmarkCircle/>
          <span children={'All done'} className='text-base font-normal' />
        </div>
        <span />
      </ShowBinarySwitch>
      <PromisableLoadingBlingButton 
          Icon={<RiLockPasswordLine/>} 
          text='update' 
          show={true} 
          onClick={changePassword}
          keep_text_on_load={true}
          classNameLoading='text-xs'
          rounded='rounded-md'
          className='w-fit text-base shelf-text-label-color  self-end '/>

    </div>

  </div>

</Card>   
  )


}