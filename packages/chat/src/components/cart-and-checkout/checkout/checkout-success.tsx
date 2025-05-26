import { useCart, useCheckout } from "@storecraft/sdk-react-hooks";
import React, { useCallback, useEffect, useState } from "react"
import { 
  MdClose,
  MdOutlineArrowBack, 
} from "react-icons/md";
import { CheckoutProps } from ".";
import { HookedOrderSummary, OrderSummary } from "./order-summary";
import confetti from "./confetti";
import { IoBagCheckOutline } from "react-icons/io5";
import { CheckoutType } from "@storecraft/sdk-react-hooks/src/use-checkout.types";
import { ErrorsView } from "@/components/common/error-view";

export const CheckoutSuccess = (
  {
    checkout: checkout_props, ...rest
  } : CheckoutProps
) => {
  const {
    actions: {
      reset: resetCheckout,
    },
    checkout,
  } = useCheckout();

  const {
    actions: {
      clearCart
    }
  } = useCart();

  const [checkoutSnapshot, setCheckoutSnapshot] = useState<CheckoutType>(null);
  const [error, setError] = useState<string>();

  const ref_canvas = React.useRef<HTMLCanvasElement & {confetti: any}>(null);

  useEffect(
    () => {
      if(!checkoutSnapshot) {
        return;
      }

      ref_canvas.current.confetti = 
        ref_canvas.current.confetti || 
        confetti.create(ref_canvas.current, { resize: true });

      ref_canvas.current.confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 1 }
      });
    }, [checkoutSnapshot]
  );

  useEffect(
    () => {
      if(!checkout) {
        setError('Checkout not found');
        return;
      }
      clearCart();
      resetCheckout();
      setCheckoutSnapshot({...checkout});
    }, []
  );

  if(!checkoutSnapshot)
    return null;

  return(
    <div {...rest}>
      <div 
        className='w-full h-full flex flex-col 
          chat-text chat-bg border-l relative'>

        <canvas 
          ref={ref_canvas}
          className='absolute h-full w-full 
            pointer-events-none'
          id='confetti-canvas'
        />

        {/* Cart Header */}
        <Header 
          className='w-full' 
          checkout={checkout_props} 
        />

        {/* content */}
        <div 
          className='w-full flex-1 flex flex-col 
            gap-2 overflow-y-auto relative p-3 '
        >
          {
            error && (
              <ErrorsView errors={[error]} />
            )
          }
          {
            checkoutSnapshot && (
              <>
                <IoBagCheckOutline
                  className='text-6xl text-green-500 mx-auto my-5'
                />
                <div 
                  className='w-full flex flex-col gap-7 p-2 '>
                  <h1 
                    className='text-2xl font-semibold text-center'
                    children='Thank You for Your Order!'
                  />
                  <p 
                    className='text-center text-lg'
                    children='Your order has been successfully placed.'
                  />
                  <div
                    className='flex flex-col gap-0 items-center'>
                    <p 
                      className='text-center text-sm text-gray-500'
                      children={
                        'You will receive an email confirmation shortly at '
                      }
                    />
                    <p 
                      className='text-center text-sm opacity-80 
                        underline decoration-dashed underline-offset-4'
                      children={
                        (checkoutSnapshot?.latest_checkout_attempt?.contact?.email ?? '')
                      }
                    />
                  </div>
                </div>
              </>
            )
          }
        </div>


        {/* Footer */}
        <OrderSummary
          className='w-full h-fit'
          summary={{
            open: true,
            pricing: checkoutSnapshot?.latest_checkout_attempt?.pricing,
            orderId: checkoutSnapshot?.latest_checkout_attempt?.id,
            showCoupons: false
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
        <MdClose 
          className='text-xl cursor-pointer' 
          onClick={checkout?.exit}
        />    
        <div className="flex flex-row gap-2 items-center">
          <span 
            className='font-thin text-xl uppercase 
              italic tracking-wide'
            children='Thank You'/>
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

type IframeProps = {
  iframe: {
    src: string,
  }
} & React.ComponentProps<'div'>;

const Iframe = (
  {
    iframe, ...rest
  } : IframeProps
) => {
  const [wasLoaded, setWasLoaded] = useState(false);
  const onLoad: React.ReactEventHandler<HTMLIFrameElement> = useCallback(
    (e) => {
      console.log({e})
      setWasLoaded(true);
      // alert('Iframe loaded');
    }, []
  );

  return (
    <div {...rest}>
      <div 
        className={
          'overflow-y-scroll w-full h-full bg-black/10 dark:bg-white/10 \
            animate-pulse ' + (
            wasLoaded ? 'hidden' : 'hidden'
          )
        }
      />
      <iframe
        scrolling="yes"
        src={iframe.src}
        className={
          'w-full h-full border-0 overflow-y-scroll ' + (
            wasLoaded ? 'visible' : 'visible'
          )
        }
        title='Payment Gateway'
        loading='lazy'
        allowFullScreen
        allow="payment"
        sandbox="allow-forms allow-modals allow-popups 
          allow-presentation allow-same-origin allow-scripts"
        referrerPolicy="no-referrer-when-downgrade"
        frameBorder="0"
        onLoad={onLoad}
        style={{  
          'colorScheme': 'light',
          width: '100%',
          height: '100%',
          border: 'none',
          // overflow: 'hidden'
        }}
      />
    </div>
  )
}