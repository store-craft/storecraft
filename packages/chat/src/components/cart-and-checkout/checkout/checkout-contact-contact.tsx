import { useAuth, useCheckout } from "@storecraft/sdk-react-hooks";
import { CheckoutProps } from ".";
import { Input } from "@/components/common/input";
import { OrderContact } from "@storecraft/core/api";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { Login } from "@/components/common/login-form";

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
    contact: auth_contact,
    actions: {
      signout
    }
  } = useAuth();

  const [contact, setContact] = useState({
    ...(suggestedCheckout?.contact ?? {}),
    ...(isAuthenticated ? auth_contact : {}),
  });
  const [warning, setWarning] = useState<string>();
  const [showSignIn, setShowSignin] = useState(false);

  useEffect(
    () => {
      // override everything with auth contact
      setContact(
        (prev) => ({
          ...(prev ?? {}),
          ...(auth_contact ?? {}),
        })
      );
    }, [isAuthenticated]
  );

  // console.log({contact, auth_contact, suggestedCheckout})

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
        {
          isAuthenticated && (
            <div className='w-full flex flex-row 
              justify-between items-center'>
              <span 
                children={contact?.email} 
                className='font-mono text-sm
                  opacity-70'
              />
              <span 
                children='(signout)' 
                className='--underline text-sm 
                  cursor-pointer opacity-70 tracking-wider
                  underline decoration-dashed
                  underline-offset-4'
                onClick={signout}
              />
            </div>
          )
        }
        {
          !isAuthenticated && (
            <NonAuthContactLogin
              className='w-full'
              contact={contact}
              onChange={onChange}
              warning={warning}
            />
          )
        }
      </div>
    </div>
  )
})

type NonAuthContactLoginProps = {
  contact?: Partial<OrderContact>,
  warning?: string,
  onChange: React.ChangeEventHandler<HTMLInputElement>,
} & React.ComponentProps<'div'>;

const NonAuthContactLogin = (
  {
    contact,
    onChange,
    warning,
    ...rest
  }: NonAuthContactLoginProps
) => {
  const [showSignIn, setShowSignin] = useState(false);

  return (
    <div {...rest}>
      <Input 
        className='w-full'
        type='email'
        name={'email' satisfies 'email'}
        value={contact?.email}
        onChange={onChange}
        required 
        input={{
          title: 'Email',
          inputClassName: 'border h-12',
          warning,
        }}
      />
      <div className='w-full flex flex-col gap-2 mt-2'>
        <span 
          children='signin' 
          className='self-end text-sm 
            cursor-pointer tracking-wider opacity-70
            underline decoration-dashed
            underline-offset-4'
          onClick={() => setShowSignin((prev) => !prev)} 
        />
      </div>
      {
        showSignIn && (
          <Login className='w-full mt-3' />
        )
      }
    </div>
  )
}

