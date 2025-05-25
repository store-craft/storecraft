import { useCheckout } from "@storecraft/sdk-react-hooks";
import { useEffect, useState } from "react"
import { type CheckoutProps } from ".";
import { type PricingData } from "@storecraft/core/api";
import { FaAngleDown } from "react-icons/fa6";
import { AddCoupons } from "./add-coupons";

type LabelProps = {
  label: {
    key: string,
    value: string | number,
  }
} & React.ComponentProps<'div'>;

const Label = (
  {
    label, ...rest
  } : LabelProps
) => {

  const value = label.value;
  const formatted_value = typeof value === 'number' ?
    value.toFixed(2) : label.value;

  return (
    <div 
      className='flex flex-row justify-between
        items-center gap-5'>
      <span 
        className='font-normal text-sm font-inter
          tracking-wider overflow-hidden flex-1
          whitespace-nowrap text-ellipsis --w-10
          opacity-60'
        children={label.key}
      />
      <span 
        className='font-thin font-mono 
          italic tracking-wide text-sm'
        children={formatted_value}
      />
    </div>
  )
}

export type HookedOrderSummaryProps = {
  summary?: {
    open?: boolean,
  }
} & React.ComponentProps<'div'>;

export const HookedOrderSummary = (
  {
    summary, ...rest
  } : HookedOrderSummaryProps
) => {
  const [open, setOpen] = useState(summary?.open ?? false);
  const [pricing, setPricing] = useState<Partial<PricingData>>(null);

  // console.log({pricing})

  const {
    suggested: {
      suggestedCheckout
    },
    actions: {
      pricing: backend_pricing
    },
    events: {
      subscribe
    },
    checkout
  } = useCheckout();

  useEffect(
    () => {
      backend_pricing().then(
        (validation_or_pricing) => setPricing(
          validation_or_pricing?.pricing ?? null
        )
      );
    }, [suggestedCheckout, backend_pricing]
  );

  useEffect(
    () => {
      return subscribe(
        (event) => {
          if(event) {
            setOpen(true);
          }
        }
      )
    }
  );

  return(
    <OrderSummary
      {...rest}
      summary={{
        open: open,
        pricing: pricing,
        orderId: checkout?.latest_checkout_attempt?.id,
        onToggle: () => setOpen(!open),
        onCouponsFocus: () => setOpen(true),
        showCoupons: true
      }}
    />
  )
}

export type OrderSummaryProps = {
  summary?: {
    open?: boolean,
    showCoupons?: boolean,
    pricing?: Partial<PricingData>,
    orderId?: string,
    onToggle?: () => void,
    onCouponsFocus?: () => void,
  }
} & React.ComponentProps<'div'>;

export const OrderSummary = (
  {
    summary, ...rest
  } : OrderSummaryProps
) => {

  return(
    <div {...rest}>

      {/* button */}
      <div 
        className={`w-full h-12 flex flex-row 
          justify-between items-center 
          --border-b cursor-pointer px-4
          hover:bg-black/10 dark:hover:bg-white/10 ` +
          (open ? 'bg-black/10 dark:bg-white/10' : '') 
        }
        onClick={(_) => summary?.onToggle?.()}>
        
        <div 
          className='w-fit flex flex-row 
            gap-1 items-center opacity-70 '>
          <span 
            className='text-xs 
              underline underline-offset-4 
              whitespace-nowrap text-ellipsis
              decoration-dashed tracking-wide'
            children={
              summary?.orderId ? 
              `Order ${summary?.orderId?.replace('order_', '')}` : 
              'Order Summary'
            }
          />
          <FaAngleDown 
            className={
              'text-sm transition-all duration-300 ' + 
              (open ? 'rotate-180' : 'rotate-0')
            }   
          />
        </div>  
        <span 
          className={'text-sm font-mono ' + 
            (open ? 'opacity-0' : 'opacity-70')}
          children={summary?.pricing?.total ?? '--'}
        />
      </div>

      <div
        className='w-full h-fit flex flex-col gap-3 px-3 pb-3'>

        {/* drawer */}
        <Drawer
          className={'w-full h-fit --p-3 border-b'}
          drawer={{open: summary?.open}}>

          <div 
            className='w-full h-full flex flex-col 
              gap-3 chat-text chat-bg --border-l p-2 '>
            <Label 
              className='w-full' 
              label={{
                key: 'Subtotal', 
                value: `${summary?.pricing?.subtotal_undiscounted ?? 0}`
              }} 
            />
            <Label 
              className='w-full' 
              label={{
                key: 'Shipping', 
                value: `${summary?.pricing?.shipping_method?.price ?? '--'}`
              }} 
            />
            { // discounts
              summary?.pricing?.evo?.slice(1)
              .filter(e => e.total_discount>0).map(
                e => (
                  <Label 
                    className='w-full' 
                    key={e.discount_code}
                    label={{
                      key: `discount: ${e.discount_code}`, 
                      value: `${-e.total_discount}`
                    }}
                  />
                )
              )
            }
            { // taxes
              summary?.pricing?.taxes.map(
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
            <Label 
              className='w-full' 
              label={{
                key: 'Total', 
                value: `${summary?.pricing?.total ?? '--'}`
              }} 
            />

          </div>
        </Drawer>

        {/* add coupons */}
        {
          summary?.showCoupons && (
            <AddCoupons
              onFocus={(_) => summary?.onCouponsFocus?.()}
              className='w-full h-fit --p-1' 
            />
          )
        }

      </div>

    </div>
  )
}

type DrawerProps = {
  drawer: {
    open: boolean
  }
} & React.ComponentProps<'div'>;

const Drawer = (
  {
    drawer, children, ...rest
  } : DrawerProps
) => {

  return (
    <div 
      {...rest}
    >
      <div
        className={
          'w-full h-full transition-all duration-500 \
          overflow-hidden ' + (
            drawer.open ? 'max-h-[1000px]' : 'max-h-0'
          )
        }>
        {
          children
        }
      </div>
    </div>
  )
}