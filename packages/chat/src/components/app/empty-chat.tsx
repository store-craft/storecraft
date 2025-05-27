import { LoadingSingleImage } from "../common/loading-image"
import { pubsub } from "../chat/use-chat";
import React, { useEffect, useState } from "react";
import { useStorecraft } from "@storecraft/sdk-react-hooks";
import { type StorecraftAppPublicInfo } from "@storecraft/core/api";
import favicon from '@/components/favicon.svg';

const triggers = [
  {
    message: '🏷️ What\'s on Sale ?',
    prompt: 'What\'s on sale ?',
  },
  {
    message: '🛍️ What collections do you have ?',
    prompt: 'What collections do you have ?',
  },
  {
    message: 'What\'s new ?',
  },
  {
    message: '🧾 Ask about your order',
    prompt: 'Can you tell me about my order ?',
  },
  {
    message: '🚚 Shipping information',
    prompt: 'Can you please tell me your shipping options ?',
  },
  {
    message: 'Need help? Just ask!',
    prompt: 'I need some help',
  }
];

const defaultStorecraftAppInfo: Partial<StorecraftAppPublicInfo> = {
  store_name: 'Welcome to our store',
  store_description: 'We sell cool things and we are excited to have you. ',
  store_logo_url: 'favicon.svg',
}

export const EmptyChat = (
  {
    ...rest
  }: React.ComponentProps<'div'>
) => {

  const { sdk } = useStorecraft();
  const [info, setInfo] = useState<Partial<StorecraftAppPublicInfo>>(
    defaultStorecraftAppInfo);

  useEffect(
    () => {
      sdk.reference.info().then(setInfo).catch(
        (error) => {
          console.error('Error fetching app info:', error);
        }
      );
    }, []
  );

  // pubsub

  // console.log({favicon})

  return (
    <div {...rest}>
      <div 
        className='w-fit h-full -translate-y-[80px] bg-red-200/0 flex flex-col 
          justify-center items-center gap-5 p-5 overflow-y-auto' >
        <div
          className='w-full flex flex-row justify-center 
            items-center gap-2'>
          <LoadingSingleImage
            className='w-6 h-6 rounded-full'
            src={info?.store_logo_url ?? favicon} />
          <h1 className='text-3xl capitalize font-bold italic'>
            {info?.store_name}
          </h1>
        </div>
        <p 
          className='text-base opacity-80 font-thin 
            whitespace-pre-line line-clamp-3'
        >
          {
            info?.store_description
          }
        </p>
        <div
          className='w-full h-fit flex flex-row flex-wrap 
            gap-3 justify-center items-center'>
          {
            triggers.map(
              (trigger, index) => (
                <TriggerMessage 
                  key={index}
                  trigger={trigger}
                  onClick={() => {
                    pubsub.dispatch(
                      {
                        event: 'request-retry',
                        payload: {
                          prompt: [
                            {
                              type: 'text',
                              content: trigger.prompt ?? trigger.message
                            }
                          ]
                        }
                      }
                    )
                  }}
                />
              )
            )
          }
        </div>
      </div>
    </div>
  )
}


type TriggerMessageProps = {
  trigger?: {
    message?: string;
  };
} & React.ComponentProps<'div'>;

const TriggerMessage = (
  {
    trigger,
    ...rest
  }: TriggerMessageProps
) => {

  return (
    <div {...rest}>
      <div 
        className='w-fit flex flex-row items-center 
          border -skew-x-6 p-2 rounded-lg hover:bg-black/10 
          dark:hover:bg-white/10 cursor-pointer
          text-sm sm:text-base'>
        <p 
          children={trigger?.message || 'Click to start chatting!'}
        />
      </div>
    </div>
  )
}