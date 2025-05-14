import React, { useCallback, useEffect, useMemo, useState } from "react";
import { pubsub } from "@/hooks/use-chat";
import { sleep } from "@/hooks/sleep";
import { type withDiv } from "../common.types.js";
import { Card } from "../card.js";
import { LoadingImage } from "../loading-image.js";
import type { ProductType } from "@storecraft/core/api";
import { useAuth, useCollection, useStorecraft } from "@storecraft/sdk-react-hooks";
import { MdNavigateNext } from "react-icons/md";
import { FiltersView } from "./products-filter-view.js";
import { PriceTag } from "../price-tag.js";
import { Table, type TableParams } from "./table.js";
import { Chat } from "../chat.js";
import { Button } from "./common-ui.js";

/**
 * @description Easily `format` errors coming from the `storecraft` backend
 */
export const format_storecraft_errors = (
  error: import('@storecraft/core/api').error
) => {
  return error?.messages?.map(
    it => {
      let msg = '';
      if(it.path) {
        msg += it.path.join('.') + ' - '
      }
      msg += it.message ?? 'Unknown Error';
      return msg;
    }
  ) ?? ['ouch, unexpected error'];
}

export type Params = withDiv<
  {
    chat?: {
      header?: string
    }
  }
>;

const format_error = (e: any) => {
  if(typeof e === 'string')
    return e;

  let payload = e?.messages?.[0]?.message 
    ?? 'unknown error';

  return payload;
}

export const Login = (
  {
    chat
  }: Params
) => {
  const [error, setError] = useState<string>(undefined);
  const auth = useAuth();
  const ref_email = React.useRef<HTMLInputElement>(null);
  const ref_password = React.useRef<HTMLInputElement>(null);

  // useEffect(
  //   () => {
  //     sleep((index + 1) * 300).then(() => {setReady(true)})
  //   }, []
  // );

  const onSubmit = useCallback(
    async () => {
      try {
        await auth.actions.signin(
          ref_email.current?.value,
          ref_password.current?.value
        );
      } catch (e) {
        console.error(e);
        setError(
          format_storecraft_errors(e).join('\n') ?? 
          'Unknown Error'
        );
      }
    }, [auth]
  );

  return (
    <Card className='w-fit '>
      <div className='flex flex-col gap-3 
        p-3 w-fit h-fit duration-300 text-sm'>
        {
          chat?.header && (
            <p 
              children={chat.header} 
              className='font-medium 
                text-base w-full --max-w-20' />
          )
        }
        <div className='h-fit relative flex flex-col gap-2 font-mono'>
          <input 
            ref={ref_email}
            type='email' 
            placeholder='email' 
            className='px-3 h-8 border chat-border-color 
              rounded-md chat-bg-overlay
              placeholder:font-normal placeholder:text-sm tracking-widest
              dark:placeholder:text-gray-300 placeholder:text-gray-800'
          />
        </div>
        <div className='h-fit relative flex flex-col gap-2'>
          <input 
            ref={ref_password}
            placeholder='password' 
            className='px-3 h-8 border chat-border-color  
              rounded-md chat-bg-overlay
              placeholder:font-normal placeholder:text-sm tracking-widest 
              dark:placeholder:text-gray-300 placeholder:text-gray-800'
          />
        </div>
        {
          error && (
            <div 
              children={error} 
              className='text-sm tracking-wider whitespace-pre-wrap
                text-red-500 bg-red-500/10 border border-red-500 
                rounded-md p-2' />
          )
        }
        <Button 
          children='login' 
          onClick={onSubmit} />
      </div>
    </Card>
  )
}
