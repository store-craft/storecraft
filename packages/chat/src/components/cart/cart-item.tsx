import { type ProductType } from "@storecraft/core/api";
import React from "react"

export type CartProps = {
  cart?: {
    item: ProductType
  }
} & React.ComponentProps<'div'>;

export const Cart = (
  {
    cart, ...rest
  } : CartProps
) => {

  return(
    <div {...rest}>
      cart
    </div>
  )
}