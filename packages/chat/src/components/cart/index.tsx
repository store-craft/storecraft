import { useCart } from "@storecraft/sdk-react-hooks";
import React from "react"

export type CartProps = {
  dash?: {}
} & React.ComponentProps<'div'>;

export const Cart = (
  {
    dash, ...rest
  } : CartProps
) => {

  const {
    cart
  } = useCart();

  return(
    <div {...rest}>
      cart
    </div>
  )
}