import { type LineItem } from "@storecraft/core/api";
import { useCart } from "@storecraft/sdk-react-hooks";
import React from "react"
import { CartLineItem } from "./cart-line-item";
import { CiShoppingCart } from "react-icons/ci";

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
    cart, isEmpty
  } = useCart();



  return(
    <div {...rest}>
      <div 
        className='flex flex-col justify-between 
          w-full h-full'>
        
        {
          isEmpty && (
            <EmptyCart 
              className='w-full h-fit my-auto' 
            />
          )

        }
        {
          !isEmpty && (
            <div 
              className='--bg-green-400 w-full h-full overflow-y-auto
                scrollbar scrollbar-thumb-kf-400'>
              {
                cart?.line_items?.map(
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
          )
        }
      </div>
    </div>
  )
}


const EmptyCart = (
  {
    ...rest
  }: React.ComponentProps<'div'>
) => {
  return (
    <div {...rest}>
      <div 
        className='w-full h-full flex flex-col 
          chat-text chat-bg border-l justify-center 
          items-center'>
        <CiShoppingCart 
          className='text-8xl text-kf-400 mb-4' 
          title='Empty Cart' 
          aria-label='Empty Cart'
        />
        <span 
          className='text-2xl font-semibold 
            opacity-70 italic '
          children='Your cart is empty.' 
        />
      </div>
    </div>
  )
}