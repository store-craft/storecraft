import { useCart } from "@storecraft/sdk-react-hooks";
import React, { useState } from "react"
import { Cart } from "./cart";
import { Checkout } from "./checkout";

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

  const [showCheckout, setShowCheckout] = useState(false);

  return(
    <div {...rest}>
      <Cart 
        cart={{
          ...cart_prop,
          onCheckoutClicked: () => setShowCheckout(true),
        }} 
        className={'w-full h-full ' + (showCheckout ? 'hidden' : '')}
      />
      {
        (showCheckout) && ( 
          <Checkout 
            className='w-full h-full' 
            checkout={{
              close: () => setShowCheckout(false),
            }}
          />
        )
      }
    </div>
  )
}
