import { useCheckout } from "@storecraft/sdk-react-hooks";
import { useEffect, useState } from "react"
import { type CheckoutProps } from ".";
import { type PricingData } from "@storecraft/core/api";
import { FaAngleDown } from "react-icons/fa6";
import { AddCoupons } from "./add-coupons";

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
  const [open, setOpen] = useState(false);
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
      backend_pricing().then(setPricing);
    }, [suggestedCheckout, backend_pricing]
  );

  return(
    <div {...rest}>
      <div 
        className='w-full h-12 flex flex-row 
          justify-between items-center gap-3
          --border-b cursor-pointer p-3
          hover:bg-black/10 dark:hover:bg-white/10'
        onClick={(_) => setOpen(!open)}>
        <div 
          className='w-fit flex flex-row 
            gap-1 items-center opacity-70 '>
          <span 
            className='text-sm 
              underline underline-offset-4 
              decoration-dashed tracking-wide'
            children='Order Summary'
          />
          <FaAngleDown />
        </div>  
        <span 
          className={'text-sm font-mono ' + 
            (open ? 'opacity-0' : 'opacity-70')}
          children={pricing?.total ?? '--'}
        />
      </div>
      <Drawer
        className='w-full h-fit'
        drawer={{open}}>

        <div 
          className='w-full h-full flex flex-col 
            gap-3 chat-text chat-bg --border-l p-3 '>
          <Label 
            className='w-full' 
            label={{
              key: 'Subtotal', 
              value: `${pricing?.subtotal_undiscounted ?? 0}`
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
          <Label 
            className='w-full' 
            label={{
              key: 'Total', 
              value: `${pricing?.total ?? '--'}`
            }} 
          />

        </div>
      </Drawer>
      <AddCoupons
        className='w-full h-fit p-1' 
      />
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