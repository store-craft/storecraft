import { useCart, useCheckout } from "@storecraft/sdk-react-hooks";
import { useCallback } from "react"
import { MdClose } from "react-icons/md";
import { CheckoutProps } from ".";
import { IoMdContact } from "react-icons/io";
import { Button } from "../common/button";
import { Input } from "../common/input";
import { CountrySelect } from "../common/country-select";

export const CheckoutContactAddress = (
  {
    checkout, ...rest
  } : CheckoutProps
) => {
  const {
  } = useCheckout();


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

        <form className='w-full flex flex-col gap-2'>

          <CountrySelect 
            className='w-full'
            input={{
              title: 'Email',
              inputClassName: 'border h-12'
            }}
          />

          <div className='w-full flex flex-row gap-2'>
            <Input 
              className='flex-1'
              input={{
                title: 'Firstname',
                inputClassName: 'border h-12'
              }}
            />
            <Input 
              className='flex-1'
              input={{
                title: 'Lastname',
                inputClassName: 'border h-12'
              }}
            />
          </div>

          <Input 
              className='flex-1'
              input={{
                title: 'Address',
                inputClassName: 'border h-12'
              }}
            />

          <Input 
            className='flex-1'
            input={{
              title: 'Appartment, suite, etc.',
              inputClassName: 'border h-12'
            }}
          />

          <div className='w-full flex flex-row gap-2'>
            <Input 
              className='flex-1'
              input={{
                title: 'Postal code',
                inputClassName: 'border h-12'
              }}
            />
            <Input 
              className='flex-1'
              input={{
                title: 'City',
                inputClassName: 'border h-12'
              }}
            />
          </div>

          <Input 
            className='flex-1'
            input={{
              warning: 'Please enter a valid phone number',
              title: 'Phone',
              inputClassName: 'border h-12'
            }}
          />

        </form>

        
        
      </div>
    </div>
  )
}
