import { useCheckout } from "@storecraft/sdk-react-hooks";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react"
import { CheckoutProps } from ".";
import { Input } from "../common/input";
import { CountrySelect } from "../common/country-select";
import { AddressType } from "@storecraft/core/api";

export type CheckoutAddressimperativeInterface = {
  getAddress: () => {
    address: AddressType,
    isValid: boolean
  }
}

export const CheckoutContactAddress = forwardRef((
  {
    checkout, ...rest
  } : CheckoutProps, ref: React.ForwardedRef<unknown>
) => {
  const {
    suggested: {
      suggestedCheckout,
    }
  } = useCheckout();
  const [address, setAddress] = useState(suggestedCheckout?.address);
  const [warnings, setWarnings] = useState<Record<keyof AddressType, string>>();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const name = e.currentTarget.name;
      const value = e.currentTarget.value;
      setAddress(
        (prev) => ({
          ...(prev ?? {}),
          [name]: value
        })
      );
    }, [setAddress]
  );

  useImperativeHandle(
    ref, 
    () => ({
      getAddress: () => {
        
        const entries = ([
          'country', 'firstname', 'lastname', 
          'street1', 'postal_code', 'city',
          'phone_number'
        ] as (keyof AddressType)[])
        .map(
          (key) => [key, !address?.[key] ? 'Required Field' : undefined]
        ).filter(
          ([_, v]) => Boolean(v)
        );

        // console.log({entries})
        const isValid = entries.length === 0;
        if(entries.length > 0) {
          setWarnings(
            Object.fromEntries(entries)
          );
        }

        return {
          address,
          isValid
        }
      }
    }),
    [address]
  );

  // console.log({warnings, address})

  return(
    <div {...rest}>
      <div 
        className='w-full h-full flex flex-col 
          chat-text chat-bg gap-3'>
        
        <p 
          children='Shipping Address' 
          className='w-full text-lg 
            font-medium font-inter tracking-wide'
        />

        <div className='w-full flex flex-col gap-2'>

          <CountrySelect 
            name={'country' as keyof typeof suggestedCheckout.address}
            value={address?.country}
            onChange={onChange}
            className='w-full'
            input={{
              warning: warnings?.country,
              title: 'Email',
              inputClassName: 'border h-12'
            }}
          />

          <div className='w-full flex flex-row gap-2'>
            <Input 
              name={'firstname' as keyof typeof suggestedCheckout.address}
              value={address?.firstname}
              onChange={onChange}
              className='flex-1'
              input={{
                // warning: warnings?.firstname,
                title: 'Firstname',
                inputClassName: 'border h-12',
              }}
            />
            <Input 
              name={'lastname' as keyof typeof suggestedCheckout.address}
              value={address?.lastname}
              onChange={onChange}
              className='flex-1'
              input={{
                warning: warnings?.lastname,
                title: 'Lastname',
                inputClassName: 'border h-12',
              }}
            />
          </div>

          <Input 
            name={'street1' as keyof typeof suggestedCheckout.address}
            value={address?.street1}
            onChange={onChange}
            className='flex-1'
            input={{
              warning: warnings?.street1,
              title: 'Address',
              inputClassName: 'border h-12',
            }}
          />

          <Input 
            name={'street2' as keyof typeof suggestedCheckout.address}
            value={address?.street2}
            onChange={onChange}
            className='flex-1'
            input={{
              warning: warnings?.street2,
              title: 'Appartment, suite, etc.',
              inputClassName: 'border h-12',
            }}
          />

          <div className='w-full flex flex-row gap-2'>
            <Input 
              name={'postal_code' as keyof typeof suggestedCheckout.address}
              onChange={onChange}
              value={address?.postal_code}
              className='flex-1'
              input={{
                warning: warnings?.postal_code,
                title: 'Postal code',
                inputClassName: 'border h-12',
              }}
            />
            <Input 
              name={'city' as keyof typeof suggestedCheckout.address}
              value={address?.city}
              onChange={onChange}
              className='flex-1'
              input={{
                warning: warnings?.city,
                title: 'City',
                inputClassName: 'border h-12',
              }}
            />
          </div>

          <Input 
            type='tel'
            name={'phone_number' as keyof typeof suggestedCheckout.address}
            value={address?.phone_number}
            onChange={onChange}
            className='flex-1'
            input={{
              warning: warnings?.phone_number,
              title: 'Phone',
              inputClassName: 'border h-12',
            }}
          />

        </div>

      </div>
    </div>
  )
})
