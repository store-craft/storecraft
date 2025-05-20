import React, { useCallback, useState } from "react";
import { sleep } from "@/hooks/sleep";
import { useAuth } from "@storecraft/sdk-react-hooks";
import { Button } from "./button";
import { CgSpinnerTwoAlt } from "react-icons/cg";
import { Input } from "./input";

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

export type Params = React.ComponentProps<'div'> & {
  chat?: {
    header?: string
  }
}

export const Login = (
  {
    chat, ...rest
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
    <div {...rest}>
      <form className='flex flex-col gap-3 
        w-full h-fit duration-300 text-sm'
        onSubmit={onSubmit}>
        {
          chat?.header && (
            <p 
              children={chat.header} 
              className='font-medium 
                text-base w-full --max-w-20' />
          )
        }

        <Input 
          className='w-full autofill:bg-green-400'
          autoComplete="on"
          ref={ref_email}
          type='email'
          name={'email' satisfies 'email'}
          required 
          input={{
            title: 'Email',
            inputClassName: 'border h-12',
          }}
        />

        <Input 
          className='w-full'
          autoComplete="on"
          ref={ref_password}
          type='password'
          name={'password' satisfies 'password'}
          required 
          input={{
            title: 'Password',
            inputClassName: 'border h-12',
          }}
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
          onClick={onSubmit}
          type='submit' 
          // value='LOGIN' 
          title='Login'>
          <div 
            className='w-full h-full flex flex-row justify-center 
              items-center gap-2 tracking-wider'>
            LOGIN
            {
              isLoadingSignin && 
              <CgSpinnerTwoAlt 
                className='animate-spin w-5 h-5 
                  text-white' />
            }
          </div>

        </Button>
      </form>
    </div>
  )
}
