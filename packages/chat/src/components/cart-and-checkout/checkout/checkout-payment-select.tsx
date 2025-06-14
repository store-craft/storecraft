import { useCheckout, useCollection } from "@storecraft/sdk-react-hooks";
import React, { useCallback, useState } from "react"
import { MdOutlineArrowBack, MdOutlinePayment } from "react-icons/md";
import { CheckoutProps } from ".";
import { PaymentGatewayItemGet } from "@storecraft/core/api";
import { HookedOrderSummary } from "./order-summary";
import { LoadingSingleImage } from "@/components/common/loading-image";
import { ErrorsView } from "@/components/common/error-view";
import { CgSpinner } from "react-icons/cg";
import { sleep } from "@/hooks/sleep";

export const CheckoutPaymentSelect = (
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
    errors
  } = useCheckout();

  let {
    page
  } = useCollection(
    'payments/gateways'
  );

  const onSelect: PaymentItemViewProps["payment"]["onSelect"] = useCallback(
    async (item) => {
      await sleep(1000);

      try {
        const checkout_result = await createCheckout(
          suggestedCheckout,
          item.handle
        );

        // if we didn't error, we can go to the next step
        if(checkout_result) {
          checkout_props?.next();
        }
      } catch (error_messages) {
      }
    }, [createCheckout, suggestedCheckout]
  );

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

          <ErrorsView
            className='w-full h-fit'
            errors={errors}
          />

          {
            !page?.length && (
              <div className='w-full h-fit flex flex-col gap-2'>
                <span 
                  className='text-lg font-semibold text-gray-500'
                  children='No payment gateways available.' 
                />
                <span 
                  className='text-sm font-light text-gray-400'
                  children='Please contact support if you think this is an error.' 
                />
              </div>
            )
          }

          {
            page?.map(
              (item, ix) => (
                <PaymentItemView
                  key={ix}
                  payment={{
                    item,
                    onSelect
                  }}
                  className={
                    'w-full h-fit ' + (
                      creatingCheckout ? 
                        'pointer-events-none' : 
                        ''
                    )
                  }
                />
              )
            )
          }
        </div>

        {/* Footer */}
        <HookedOrderSummary
          className='w-full h-fit'
          summary={{
            open: true
          }}
        />

      </div>
    </div>
  )
}

type PaymentItemViewProps = {
  payment: {
    item: PaymentGatewayItemGet,
    selected?: boolean,
    onSelect?: (item: PaymentGatewayItemGet) => Promise<void>,
  },
} & React.ComponentProps<'div'>;

const PaymentItemView = (
  {
    payment, 
    ...rest
  }: PaymentItemViewProps
) => {
  const [loading, setLoading] = useState(false);

  const onSelect = useCallback(
    () => {
      setLoading(true);
      payment
      .onSelect(payment.item)
      .finally(() => setLoading(false));
    }, 
    [payment]
  );

  return (
    <div {...rest}>
      <div 
        className='w-full h-fit flex flex-col 
          gap-0 rounded-lg border p-2 
          dark:hover:bg-white/10
          hover:bg-black/10
          cursor-pointer'
        onClick={onSelect}>

        {/* header */}
        <div 
          className='w-full flex flex-row 
            justify-between gap-2 items-center'>

          <div className='w-fit flex flex-row gap-2 items-center'>
            <LoadingSingleImage 
              src={payment?.item?.info?.logo_url}
              className='w-6 h-6 rounded-full'
              alt={payment?.item?.info?.name}
            />
            <span 
              children={payment?.item?.info?.name} 
              className='font-semibold text-lg text-ellipsis'
            />
          </div>

          { // Spinner
            loading && (
              <CgSpinner
                className='animate-spin text-xl'
              />
            )
          }
        </div>

        {/* description */}
        <div className='w-full flex flex-row gap-2 items-center'>
          <span
            className='font-light text-sm text-gray-500'
            children={payment?.item?.info?.description}
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
