import { useCheckout } from "@storecraft/sdk-react-hooks";
import React, { useCallback, useEffect, useState } from "react"
import { MdFullscreen, MdOutlineArrowBack, MdOutlinePayment } from "react-icons/md";
import { CheckoutProps } from ".";
import { OrderSummary } from "./order-summary";
import { SlSizeFullscreen } from "react-icons/sl";

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
    buyUrl,
    errors
  } = useCheckout();

  const [fullscreen, setFullscreen] = useState(false);
  console.log({buyUrl});

  useEffect(
    () => {
      window.addEventListener(
        'message', 
        function(event) {
          if(typeof event==='object') {
            if (event.data?.who === 'storecraft') {
              console.log(
                {
                  storecraft_iframe_event: event.data,
                }
              );
            }
          }
          // console.log({event})
        }
      );
    }, []
  );

  if(creatingCheckout)
    return null;

  return(
    <div {...rest}>
      <div 
        className='w-full h-full flex flex-col 
          chat-text chat-bg border-l relative'>

        {/* Cart Header */}
        <Header 
          className='w-full' 
          checkout={checkout_props} 
        />

        <div 
          className={
            'overflow-y-auto \
            flex flex-col gap-3 ' + (
              fullscreen ? 
                'h-dvh w-screen fixed z-100 left-0 top-0' : 
                'w-full flex-1 relative'
            )
          }>
          <Iframe 
            className='w-full h-full overflow-y-auto 
              rounded-md border 
              -- --w-screen --h-screen'
            iframe={{
              src: buyUrl
              // src: 'https://storecraft.app'
            }}
          />
          <MdFullscreen 
            className='absolute right-2 bottom-2 text-3xl
              border rounded-md p-0.5 text-white cursor-pointer 
              bg-black'
            onClick={() => setFullscreen(!fullscreen)}
          />
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