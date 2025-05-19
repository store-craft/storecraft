import { useCheckout } from "@storecraft/sdk-react-hooks";
import { CheckoutProps } from ".";
import { Input } from "../common/input";

export const CheckoutContactContact = (
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
          children='Contact' 
          className='w-full text-lg 
            font-medium tracking-wider'
        />

        <Input 
          className='w-full'
          type='email'
          required 
          input={{
            title: 'Email',
            inputClassName: 'border h-12',
            warning: 'Please enter a valid email address',
          }}
        />
      </div>
    </div>
  )
}
