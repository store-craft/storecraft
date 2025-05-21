import { useCheckout } from "@storecraft/sdk-react-hooks";
import { useEffect, useState } from "react"
import { type CheckoutProps } from ".";
import { type PricingData } from "@storecraft/core/api";

type LabelProps = {
  label: {
    key: string,
    value: string,
  }
} & React.ComponentProps<'div'>;

const Label = (
  {
    label, ...rest
  } : LabelProps
) => {
  return (
    <div 
      className='flex flex-row justify-between
        items-center'>
      <span 
        className='font-thin text-xl uppercase 
          italic tracking-wide text-ellipsis'
        children={label.key}
      />
      <span 
        className='font-thin text-xl uppercase 
          italic tracking-wide'
        children={label.value}
      />
    </div>
  )
}

export const OrderSummary = (
  {
    checkout, ...rest
  } : CheckoutProps
) => {
  const [pricing, setPricing] = useState<Partial<PricingData>>(null);

  const {
    suggested: {
      suggestedCheckout
    },
    actions: {
      pricing: backend_pricing
    }
  } = useCheckout();

  useEffect(
    () => {
      backend_pricing().then(setPricing)
    }, [suggestedCheckout, pricing]
  );

  return(
    <div {...rest}>
      <div 
        className='w-full h-full flex flex-col 
          chat-text  chat-bg border-l '>
        <Label 
          className='w-full' 
          label={{
            key: 'Subtotal', 
            value: `${pricing?.subtotal ?? 0}`
          }} 
        />
        <Label 
          className='w-full' 
          label={{
            key: 'Shipping', 
            value: `${pricing?.shipping_method?.price ?? '--'}`
          }} 
        />
        { // discounts
          pricing?.evo?.slice(1)
          .filter(e => e.total_discount>0).map(
            e => (
              <Label 
                className='w-full' 
                key={e.discount_code}
                label={{
                  key: `${e.discount_code} (discount)`, 
                  value: `${-e.total_discount}`
                }}
              />
            )
          )
        }
        { // taxes
          pricing?.taxes.map(
            (tax) => (
              <Label 
                className='w-full' 
                key={tax.name}
                label={{
                  key: `${tax.name} (tax)`, 
                  value: `${-Math.abs(tax.value)}`
                }}
              />
            )
          )
        }
      </div>
    </div>
  )
}

