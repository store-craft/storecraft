import { useCart } from "@storecraft/sdk-react-hooks";
import React from "react"
import { CartLineItems } from "./cart-line-items";

export type CartProps = {
  cart?: {}
} & React.ComponentProps<'div'>;

export const Cart = (
  {
    cart: cart_prop, ...rest
  } : CartProps
) => {
  const {
    cart
  } = useCart();

  return(
    <div {...rest}>
      <div 
        className='w-full h-full flex flex-col 
          chat-text chat-bg border-l'>

        {/* Cart Header */}
        <CartHeader className='w-full' />

        {/* Line Items   */}
        <CartLineItems className='flex-1 overflow-scroll' />

        {/* Footer */}
        <CartFooter className='w-full' />

      </div>
    </div>
  )
}

const CartHeader = (
  {
    ...rest
  } : CartProps
) => {
  const { cart } = useCart();

  return (
    <div {...rest}>
      <div 
        className='flex flex-row w-full justify-between 
          items-center border-b p-2 font-semibold'>
        <span 
          className='font-semibold text-xl'
          children='Cart'/>
        <span 
          className='font-medium text-base 
            font-mono' 
          children={`(${cart.line_items.length})`} 
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
  return (
    <div {...rest}>
      <div 
        className='w-full p-2 border-t'>
        <div 
          className='flex flex-row w-full justify-between 
            items-center --border-b py-2 font-semibold'>
          <span 
            className='font-medium text-xl tracking-wider'
            children='SubTotal'/>
          <span 
            children={500} 
            className='font-normal font-mono
              text-base' 
          />
        </div>
      </div>
    </div>
  )
}