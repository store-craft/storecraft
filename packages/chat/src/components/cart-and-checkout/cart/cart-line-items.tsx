import { type LineItem } from "@storecraft/core/api";
import { useCart } from "@storecraft/sdk-react-hooks";
import React from "react"
import { CartLineItem } from "./cart-line-item";

export type CartLineItemsProps = {
  storecraft?: {
    item: LineItem
  }
} & React.ComponentProps<'div'>;


export const CartLineItems = (
  {
    storecraft, ...rest
  } : CartLineItemsProps
) => {

  const {
    cart
  } = useCart();

  return(
    <div {...rest}>
      <div 
        className='flex flex-col justify-between 
          w-full h-full'>
          
        <div 
          className='--bg-green-400 w-full h-full overflow-y-auto
            scrollbar scrollbar-thumb-kf-400'>
          {
            cart.line_items.map(
              item => (
                <CartLineItem 
                  className='w-full h-24'
                  key={item.id} 
                  storecraft={{item}} 
                />
              )
            )  
          }
        </div>
        

      </div>
    </div>
  )
}