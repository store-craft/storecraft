import { useCart, useCheckout, useCollection } from "@storecraft/sdk-react-hooks";
import React, { useCallback, useState } from "react"
import { MdOutlineArrowBack, MdOutlineLocalShipping, MdOutlineRadioButtonChecked, MdOutlineRadioButtonUnchecked } from "react-icons/md";
import { CheckoutProps } from ".";
import { Button } from "../../common/button";
import { CheckoutCreateType, ShippingMethodType } from "@storecraft/core/api";
import { OrderSummary } from "./order-summary";

export const CheckoutShipping = (
  {
    checkout, ...rest
  } : CheckoutProps
) => {
  const {
    suggested: {
      setShipping: setSuggestedShipping,
      suggestedCheckout
    }
  } = useCheckout();

  const {
    page
  } = useCollection(
    'shipping', { limit: 10, vql: 'active=true' }
  );

  const [shipping, setShipping] = useState<
    CheckoutCreateType["shipping_method"]>(
    suggestedCheckout?.shipping_method
  );

  // console.log({suggestedCheckout: suggestedCheckout.shipping_method, shipping});

  const onSelect: ShippingItemProps["shipping"]["onSelect"] = useCallback(
    (item) => {
      // perform validation
      if(item) {
        setShipping(item);
        setSuggestedShipping(
          item
        );

        // checkout?.setShippingMethod(item);
      }
    }, [checkout, setSuggestedShipping]
  );

  const onNext = useCallback(
    () => {
      // perform validation
      if(shipping) {
        setSuggestedShipping(
          shipping
        );
        checkout?.next();
      }
    }, [checkout, shipping]
  );

  return(
    <div {...rest}>
      <div 
        className='w-full h-full flex flex-col 
          --gap-5 chat-text chat-bg border-l'>

        {/* Cart Header */}
        <Header 
          className='w-full' 
          checkout={checkout} 
        />

        <div className='w-full flex-1 overflow-y-auto'>
          <div 
            className='w-full h-fit flex 
              flex-col gap-3 p-3'>
            {
              page?.map(
                (item) => (
                  <ShippingItem
                    key={item.id}
                    shipping={{
                      onSelect: onSelect,
                      item,
                      selected: item.id === shipping?.id
                    }}
                    className='w-full h-fit '
                  />
                )
              )  
            }
          </div>
        </div>

        {/* Footer */}
        <Button 
          children='Payment'
          className='w-full h-fit cursor-pointer ' 
          onClick={onNext}
        />

        <OrderSummary
          className='w-full h-fit --p-1'
        />

      </div>
    </div>
  )
}

type ShippingItemProps = {
  shipping: {
    item: ShippingMethodType,
    selected: boolean,
    onSelect?: (item: ShippingMethodType) => void,
  },
} & React.ComponentProps<'div'>;

const ShippingItem = (
  {
    shipping, 
    ...rest
  }: ShippingItemProps
) => {
  return (
    <div {...rest}>
      <div 
        className='w-full h-fit flex flex-col 
          gap-0 rounded-lg border p-2 
          dark:hover:bg-white/10
          hover:bg-black/10
          cursor-pointer'
        onClick={() => shipping?.onSelect?.(shipping?.item)}>
        {/* header */}
        <div 
          className='w-full flex flex-row 
            justify-between gap-2 items-center'>
          <div className='w-fit flex flex-row gap-2 items-center'>
            {
              shipping?.selected && 
              <MdOutlineRadioButtonChecked className='text-pink-500'/>
            }
            {
              !shipping?.selected && 
              <MdOutlineRadioButtonUnchecked className='text-gray-500'/>
            }
            {/* <MdOutlineRadioButtonUnchecked className='opacity-50'/> */}
            <span 
              children={shipping?.item?.title} 
              className='font-semibold text-lg text-ellipsis'
            />
          </div>
          <span 
            children={shipping?.item?.price} 
            className='font-normal font-mono text-base'
          />
        </div>

        {/* description */}
        <div className='w-full flex flex-row gap-2 items-center'>
          <span
            className='font-light text-sm text-gray-500'
            children={shipping?.item?.description}
          />
        </div>
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
          <MdOutlineLocalShipping className='text-2xl' />
          <span 
            className='font-thin text-xl uppercase 
              italic tracking-wide'
            children='Shipping'/>
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

const Footer = (
  {
    checkout, ...rest
  } : CheckoutProps
) => {
  const { quickSubTotal } = useCart();

  return (
    <div {...rest}>
      <div 
        className='w-full p-2 border-t'>
        <div 
          className='flex flex-row w-full justify-between 
            items-center --border-b py-2 font-semibold'>
          <span 
            className='font-bold text-xl --tracking-wide uppercase italic'
            children='Sub-Total'/>
          <span 
            children={quickSubTotal ?? 0} 
            className='font-normal font-mono
              text-base' 
          />
        </div>
      </div>
    </div>
  )
}