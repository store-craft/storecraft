import { useCheckout } from "@storecraft/sdk-react-hooks";
import React, { useState } from "react"
import { CheckoutContact } from "./checkout-contact";
import { CheckoutShipping } from "./checkout-shipping";
import { CheckoutPaymentSelect } from "./checkout-payment-select";
import { CheckoutPaymentGateway } from "./checkout-payment-gateway";

export type CheckoutProps = {
  checkout?: {
    close?: () => void,
    back?: () => void,
    next?: () => void,
  }
} & React.ComponentProps<'div'>;

const flow = [
  {
    stage: 'contact',
    component: (checkout_props: CheckoutProps["checkout"]) => (
      <CheckoutContact 
        className='w-full h-full' 
        checkout={checkout_props}
      />
    )
  },
  {
    stage: 'shipping',
    component: (checkout_props: CheckoutProps["checkout"]) => (
      <CheckoutShipping 
        className='w-full h-full' 
        checkout={checkout_props}
      />
    )
  },
  {
    stage: 'payment',
    component: (checkout_props: CheckoutProps["checkout"]) => (
      <CheckoutPaymentSelect 
        className='w-full h-full' 
        checkout={checkout_props}
      />
    )
  },
  {
    stage: 'payment-gateway',
    component: (checkout_props: CheckoutProps["checkout"]) => (
      <CheckoutPaymentGateway
        className='w-full h-full' 
        checkout={checkout_props}
      />
    )
  }  
];

export const Checkout = (
  {
    checkout: $checkout, ...rest
  } : CheckoutProps
) => {
  const {
    checkout
  } = useCheckout();
  const [flowIndex, setFlowIndex] = useState(3);

  return(
    <div {...rest}>
      <div 
        className='w-full h-full flex flex-col 
          chat-text  chat-bg --border-l'>
        {/* Flow */}
        {
          flow[flowIndex].component({
            ...$checkout,
            next: () => {
              if(flowIndex < flow.length - 1) {
                setFlowIndex(flowIndex + 1);
              }
            },
            back: () => {
              if(flowIndex > 0) {
                setFlowIndex(flowIndex - 1);
              }
            }
          })
        }

      </div>
    </div>
  )
}

