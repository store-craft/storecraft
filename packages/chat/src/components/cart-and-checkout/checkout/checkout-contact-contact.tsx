import { useAuth, useCheckout } from "@storecraft/sdk-react-hooks";
import { CheckoutProps } from ".";
import { Input } from "../common/input";
import { OrderContact } from "@storecraft/core/api";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";

const validateEmail = (email='') => {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

export type CheckoutContactImperativeInterface = {
  getContact: () => {
    contact?: Partial<OrderContact>,
    isValid: boolean
  }
}


export const CheckoutContactContact = forwardRef((
  {
    checkout, ...rest
  } : CheckoutProps, 
  ref: React.ForwardedRef<CheckoutContactImperativeInterface>
) => {
  const {
  } = useCheckout();

  const {
    suggested: {
      suggestedCheckout,
    }
  } = useCheckout();
  const {
    isAuthenticated,
    contact: auth_contact
  } = useAuth();

  const [contact, setContact] = useState({
    ...(suggestedCheckout?.contact ?? {}),
    ...(auth_contact ?? {}),
  });
  const [warning, setWarning] = useState<string>();

  console.log({contact, auth_contact, suggestedCheckout})
  const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const name = e.currentTarget.name;
      const value = e.currentTarget.value;
      setContact(
        (prev) => ({
          ...(prev ?? {}),
          [name]: value
        })
      );
    }, []
  );

  useImperativeHandle(
    ref, 
    () => ({
      getContact: () => {
        const isValid = validateEmail(contact?.email);
        console.log({isValid, contact})
        setWarning(
          isValid ? undefined : 'Invalid Email'
        );

        return {
          contact,
          isValid
        }
      }
    }),
    [contact]
  );  

  return(
    <div {...rest}>
      <div 
        className='w-full h-full flex flex-col 
          chat-text chat-bg gap-3'>
        
        <p 
          children='Contact' 
          className='w-full text-lg 
            font-medium tracking-wider'
        />

        <Input 
          className='w-full autofill:bg-green-400'
          type='email'
          name={'email' satisfies 'email'}
          value={contact?.email}
          onChange={onChange}
          required 
          input={{
            title: 'Email',
            inputClassName: 'border h-12 --bg-green-400 autofill:bg-green-400',
            warning,
          }}
        />
      </div>
    </div>
  )
})
