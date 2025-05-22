import { useCheckout, useCollection } from "@storecraft/sdk-react-hooks";
import React, { useCallback, useState } from "react"
import { MdOutlineArrowBack, MdOutlinePayment } from "react-icons/md";
import { CheckoutProps } from ".";
import { OrderSummary } from "./order-summary";
import { LoadingSingleImage } from "@/components/common/loading-image";
import { ErrorsView } from "@/components/common/error-view";
import { CgSpinner } from "react-icons/cg";
import { sleep } from "@/hooks/sleep";

export const CheckoutPaymentGateway = (
  {
    checkout: checkout_props, ...rest
  } : CheckoutProps
) => {
  const {
    creatingCheckout, 
    suggested: {
      suggestedCheckout
    },
    actions: {
      createCheckout
    },
    checkout,
    errors
  } = useCheckout();

  return(
    <div {...rest}>
      <div 
        className='w-full h-full flex flex-col 
          chat-text chat-bg border-l'>

        {/* Cart Header */}
        <Header 
          className='w-full' 
          checkout={checkout_props} 
        />

        <div 
          className='w-full flex-1 overflow-y-auto 
            flex flex-col gap-3 p-3'>

        </div>

        {/* Footer */}
        <OrderSummary
          className='w-full h-fit'
          summary={{
            open: true
          }}
        />

      </div>
    </div>
  )
}

const Header = (
  {
    checkout, ...rest
  } : CheckoutProps
) => {

  return (
    <div {...rest}>
      <div 
        className='flex flex-row w-full justify-between 
          items-center border-b p-2 font-semibold'>
        <MdOutlineArrowBack 
          className='text-xl cursor-pointer' 
          onClick={checkout?.back}
        />    
        <div className="flex flex-row gap-2 items-center">
          <MdOutlinePayment className='text-2xl' />
          <span 
            className='font-thin text-xl uppercase 
              italic tracking-wide'
            children='Payment'/>
        </div>
        <span 
          className='font-medium text-base 
            font-mono' 
          children={``} 
        />
      </div>    
    </div>
  )
}
