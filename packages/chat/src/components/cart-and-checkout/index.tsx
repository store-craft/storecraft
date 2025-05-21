import { useCart, useCheckout } from "@storecraft/sdk-react-hooks";
import React, { useCallback, useState } from "react"
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
  const {
    suggested: {
      setLineItems: setSuggestedLineItems,
    }
  } = useCheckout();

  const [showCheckout, setShowCheckout] = useState(false);
  const onCheckoutClicked = useCallback(
    () => {
      setShowCheckout(true);
      setSuggestedLineItems(
        [...(cart?.line_items ?? [])]
      );
    }, [cart, cart?.line_items]
  );

  return(
    <div {...rest}>
      <Cart 
        cart={{
          ...cart_prop,
          onCheckoutClicked,
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
