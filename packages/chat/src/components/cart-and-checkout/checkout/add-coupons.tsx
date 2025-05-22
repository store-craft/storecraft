import { useCheckout } from "@storecraft/sdk-react-hooks";
import { useEffect, useRef, useState } from "react"
import { type CheckoutProps } from ".";
import { type PricingData } from "@storecraft/core/api";
import { FaAngleDown } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

type AddCouponsProps = {
} & React.ComponentProps<'div'>;

export const AddCoupons = (
  {
    ...rest
  } : AddCouponsProps
) => {
  const {
    suggested: {
      suggestedCheckout,
      setCoupons
    },
  } = useCheckout();

  

  const ref_input = useRef<HTMLInputElement>(null);
  // console.log({suggestedCheckout});
  return (
    <div {...rest}>
      <div 
        className='flex flex-col w-full h-fit gap-3 --px-1'>

        {/* input */}
        <div 
          className='flex flex-row w-full h-10
            items-center gap-2 '>
          <input
            ref={ref_input}
            type='text' 
            className='border rounded-md flex-1 
              h-full p-1'
            placeholder='Add coupon code'
          />
          <button 
            className='font-thin font-mono h-full
              italic tracking-wide text-sm uppercase
              cursor-pointer chat-text chat-card p-3
              rounded-md flex flex-row items-center
              border'
            children='Apply'
            onClick={() => {
              ref_input.current?.value &&
                setCoupons([
                  ...(suggestedCheckout?.coupons
                    .filter((c, ix) => c.handle !== ref_input.current?.value)
                    .map((item) => item.handle) ?? []),
                  ref_input.current?.value
                ]);
              ref_input.current.value = '';
            }}
          />
        </div>

        {/* coupons */}
        <div
          className='w-full overflow-y-auto'>
          <div 
            className='flex flex-row items-center 
              w-fit h-fit gap-2'>
            {
              suggestedCheckout?.coupons?.map(
                (item, index) => (
                  <div
                    key={item?.handle}
                    className='flex flex-row items-center gap-2
                      h-fit px-1 rounded-md -skew-x-12 border
                      cursor-pointer'
                    onClick={() => {
                      setCoupons(
                        suggestedCheckout?.coupons
                        .filter((c, ix) => c.handle !== item.handle)
                        .map((item) => item.handle)
                      );
                    }} >
                    <span 
                      children={item.handle}
                      className='text-sm'
                    />
                    <IoMdClose />
                  </div>

                )
              )
            }
          </div>

        </div>

      </div>
    </div>

  )
}
