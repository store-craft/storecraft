import React, { useMemo, useState } from "react"
import { CheckoutContact } from "./checkout-contact";
import { CheckoutShipping } from "./checkout-shipping";
import { CheckoutPaymentSelect } from "./checkout-payment-select";
import { CheckoutPaymentGateway } from "./checkout-payment-gateway";
import { CheckoutSuccess } from "./checkout-success";

export type CheckoutProps = {
  checkout?: {
    exit?: () => void,
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
    stage: 'choose-payment-gateway',
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
  },
  {
    stage: 'success',
    component: (checkout_props: CheckoutProps["checkout"]) => (
      <CheckoutSuccess
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
  // const {
  //   checkout
  // } = useCheckout();
  const [flowIndex, setFlowIndex] = useState(0);

  const callbacks = useMemo(
    () => ({
      next: () => {
        setFlowIndex(
          prev => Math.min(prev + 1, flow.length - 1)
        );
      },
      back: () => {
        setFlowIndex(
          prev => Math.max(prev - 1, 0)
        );
      },
      exit: () => {
        $checkout?.exit?.();
      }
    }), [$checkout]
  );

  return(
    <div {...rest}>
      <div 
        className='w-full h-full flex flex-col 
          chat-text  chat-bg --border-l'>
        { /* Flow */
          flow[flowIndex].component({
            ...$checkout,
            ...callbacks,
          })
        }
      </div>
    </div>
  )
}

