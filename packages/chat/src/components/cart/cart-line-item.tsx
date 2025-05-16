import { type LineItem, type ProductType } from "@storecraft/core/api";
import { useCart } from "@storecraft/sdk-react-hooks";
import React from "react"
import { LoadingImage, LoadingSingleImage } from "../common/loading-image";
import { Counter } from "./counter";
import { IoClose } from "react-icons/io5";

export type CartLineItemProps = {
  storecraft?: {
    item: LineItem
  }
} & React.ComponentProps<'div'>;

export const CartLineItem = (
  {
    storecraft: {item}, ...rest
  } : CartLineItemProps
) => {

  const {
    actions: {
      removeLineItem,
      updateLineItem
    }
  } = useCart();

  return(
    <div {...rest}>
      <div 
        className='--relative flex flex-row justify-between 
          my-auto w-full h-full items-center border-b px-2 py-4'>
        <div className='flex flex-row h-full w-fit  gap-5'>
          <LoadingImage 
            src={item.data.media?.at(0) ?? 'placeholder'}
            className='w-20 rounded-md object-contain 
              h-full border' 
          />
          <div 
            className='w-fit flex flex-col justify-between h-full'>
            <div>
              <span 
                className='line-clamp-2 font-light w-40  
                  text-sm tracking-wider cursor-pointer' 
              children={item?.data?.title}/>
            </div>               
            <Counter 
              className='h-fit' 
              counter={{
                value: item?.qty ?? 0,
                minVal: 0,
                maxVal: item?.data?.qty ?? 0,
                onChange: (v) => { updateLineItem(item?.id, v)}
              }}
            />
          </div>
        </div>                    

        <div 
          className='flex flex-col justify-between 
            items-end w-fit h-full'>
          <IoClose 
            className='h-6 w-6 cursor-pointer top-5 right-5' 
            onClick={(_) => { removeLineItem(item?.id)}}
          />
          <span 
            children={item?.data?.price * item?.qty + '$'} 
            className='font-mono inline whitespace-nowrap
              font-normal text-sm' 
          />
        </div>
      </div>
    </div>        
  )
}

