import React, { useCallback, useState } from "react";
import { sleep } from "@/hooks/sleep";
import { type withDiv } from "../common.types.js";
import { Card } from "../card.js";
import { useAuth } from "@storecraft/sdk-react-hooks";
import { Button } from "./common-ui.js";
import { CgSpinnerTwoAlt } from "react-icons/cg";

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
  const [isLoadingSignin, setIsLoadingSignin] = useState(false);
  const auth = useAuth();
  const ref_email = React.useRef<HTMLInputElement>(null);
  const ref_password = React.useRef<HTMLInputElement>(null);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoadingSignin(true);;
      try {
        await sleep(300);
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
      } finally {
        setIsLoadingSignin(false);
      }
    }, [auth]
  );

  return (
    <Card className='w-1/2 '>
      <form className='flex flex-col gap-3 
        p-3 w-full h-fit duration-300 text-sm'
        onSubmit={onSubmit}>
        {
          chat?.header && (
            <p 
              children={chat.header} 
              className='font-medium 
                text-base w-full --max-w-20' />
          )
        }
        <input 
          ref={ref_email}
          type='email' 
          autoComplete='on'
          id='email' 
          name='email' 
          placeholder='email' 
          className='px-3 h-9 border chat-border-color 
            rounded-md chat-bg-overlay
            placeholder:font-normal placeholder:text-sm tracking-widest
            dark:placeholder:text-gray-300 placeholder:text-gray-800'
        />
        <input 
          ref={ref_password}
          autoComplete='on'
          id='password' 
          name='password' 
          placeholder='password' 
          className='px-3 h-9 border chat-border-color  
            rounded-md chat-bg-overlay placeholder:font-normal 
            placeholder:text-sm tracking-widest 
            dark:placeholder:text-gray-300 placeholder:text-gray-800'
        />
        {
          error && (
            <div 
              children={error} 
              className='text-sm tracking-wider whitespace-pre-wrap
                text-red-500 bg-red-500/10 border border-red-500 
                rounded-md p-2 font-mono' />
          )
        }
        <Button 
          type='submit' 
          value='LOGIN' 
          title='Login' 
          children={
            (
              <div 
                className='flex flex-row justify-center 
                  items-center gap-2 tracking-wider'>
                LOGIN
                {
                  isLoadingSignin && 
                  <CgSpinnerTwoAlt 
                    className='animate-spin w-5 h-5 text-white' />
                }
              </div>
            ) 
          }
        />
      </form>
    </Card>
  )
}
