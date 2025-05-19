import { useCart } from "@storecraft/sdk-react-hooks";
import React from "react"
import { CartLineItems } from "./cart-line-items";
import { CiShoppingCart } from "react-icons/ci";
import { MdClose } from "react-icons/md";

export type CheckoutProps = {
  checkout?: {
  }
} & React.ComponentProps<'div'>;

export const Checkout = (
  {
    checkout: undefined, ...rest
  } : CheckoutProps
) => {
  const {
    cart
  } = useCart();

  return(
    <div {...rest}>
      <div 
        className='w-full h-full flex flex-col 
          chat-text  chat-bg border-l'>
        {/* <div children='tomer ' className="h-20 w-full bg-green-200"/> */}
        {/* Cart Header */}
        <CartHeader className='w-full' cart={cart_prop} />

        {/* Line Items   */}
        <CartLineItems className='flex-1 overflow-scroll' />

        {/* Footer */}
        <CartFooter className='w-full h-fit' />

      </div>
    </div>
  )
}

const CartHeader = (
  {
    cart, ...rest
  } : CartProps
) => {
  const { itemsCount } = useCart();

  return (
    <div {...rest}>
      <div 
        className='flex flex-row w-full justify-between 
          items-center border-b p-2 font-semibold'>
        <MdClose 
          className='text-xl cursor-pointer' 
          onClick={cart?.onClose}
        />    
        <div className="flex flex-row gap-2 items-center">
          <CiShoppingCart className='text-2xl' />
          <span 
            className='font-semibold text-xl uppercase 
              italic tracking-tight'
            children='Cart'/>
        </div>
        <span 
          className='font-medium text-base 
            font-mono' 
          children={`(${itemsCount ?? 0})`} 
        />
      </div>    
    </div>
  )
}

const CartFooter = (
  {
    cart, ...rest
  } : CartProps
) => {
  const { quickSubTotal } = useCart();

  return (
    <div {...rest}>
      <div 
        className='w-full p-2 border-t'>
        <div 
          className='flex flex-row w-full justify-between 
            items-center --border-b py-2 font-semibold'>
          <span 
            className='font-bold text-xl --tracking-wide uppercase italic'
            children='Sub-Total'/>
          <span 
            children={quickSubTotal ?? 0} 
            className='font-normal font-mono
              text-base' 
          />
        </div>
      </div>
    </div>
  )
}