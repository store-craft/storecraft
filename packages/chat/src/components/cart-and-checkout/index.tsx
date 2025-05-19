import { useCart } from "@storecraft/sdk-react-hooks";
import React from "react"
import { Cart } from "./cart";

export type CartProps = {
  cart?: {
    onClose?: () => void,
  }
} & React.ComponentProps<'div'>;

export const CartAndCheckout = (
  {
    cart: cart_prop, ...rest
  } : CartProps
) => {
  const {
    cart
  } = useCart();

  return(
    <div {...rest}>
      <Cart 
        cart={cart_prop} 
        className='w-full h-full'
      />
    </div>
  )
}
