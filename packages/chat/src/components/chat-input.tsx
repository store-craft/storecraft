import { useCallback, useRef, useState } from "react"
import { Card } from "./card"
import { BsSend } from "react-icons/bs";
import  { createKeyboardMatchHook } from '@/hooks/use-keyboard-match'
import { withDiv } from "./common.types";
import { DarkModeSwitch } from "./dark-mode-switch";
import type { content } from "@storecraft/core/ai";

const hook_shift_enter = createKeyboardMatchHook(['Shift', 'Enter']);

export type ChatInputParams = withDiv<
  {
    chat: {
      maxLines?: number,
      loading?: boolean,
      onSend?: (contents: content[]) => void
    }
  }
>;

export const ChatInputView = (
  {
    chat = {loading: false, maxLines: 3},
    ...rest
  }: ChatInputParams
) => {
  const [hasText, setHasText] = useState(false);
  const ref_ta = useRef<HTMLTextAreaElement>(undefined);

  const onChange = useCallback(
    () => {
      const num_lines = ref_ta.current?.value.split('\n').length ?? 0;
      ref_ta.current && (ref_ta.current.rows = Math.min(num_lines, chat.maxLines ?? 3));

      // console.log(ref_ta.current.value);

      setHasText(Boolean(ref_ta.current?.value));

    }, [chat.maxLines]
  );

  const internal_onSend = useCallback(
    async () => {
      const value = ref_ta.current?.value;

      ref_ta.current && (ref_ta.current.value = '');

      onChange();

      // await test(value);
      // console.log('ENDS')
      chat.onSend && chat.onSend(
        [
          {
            type: 'text',
            content: value ?? ''
          }
        ]
      );


    }, [onChange, chat]
  );

  hook_shift_enter(
    internal_onSend
  );

  return (
    <div {...rest}>
      <Card className='w-full h-fit overflow-clip shadow-2xl'>
        <div className='w-full h-fit flex flex-col gap-4 relative py-3'>
          <textarea rows={1}
            ref={ref_ta} onChange={onChange}
            className='resize-none text-sm w-full outline-none pl-3 h-fit min-h-8 
                  -bg-red-100 font-light' 
            placeholder='Ask me anything' />

          <button onClick={internal_onSend} 
              className={`rounded-md h-8 w-8 p-2  absolute right-3 
                        cursor-pointer bg-blue-500 shadow-lg  shadow-blue-500/50
                        ease-in-out top-3 transition-all duration-300 ` + 
                        (hasText ? `-translate-y-0` : '-translate-y-10') }>
            <BsSend className='w-full h-full text-white' />
          </button>

          <div className='flex flex-row justify-between w-full h-fit px-3'>
            <DarkModeSwitch/>
            <Tip/>
          </div>


        </div>
      </Card>

    </div>
  )
}

const Tip = () => {

  return (
    <div className='w-fit h-fit text-xs self-end px-3 -hidden 
        tracking-wider font-light'>
      <span children='Shift' 
        className='border chat-border-overlay chat-bg-overlay p-0.5 
              rounded-md text-[11px] font-mono font-bold'/>
      <span children=' + ' className='opacity-60'/>
      <span children='Enter' 
        className='border chat-border-overlay chat-bg-overlay p-0.5 
                rounded-md text-[11px] font-mono font-bold'/>
      <span children=' to send' className='opacity-50'/>
    </div>    
  )
}