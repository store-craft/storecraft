import { useCallback, useRef, useState } from "react"
import { Card } from "./card"
import { BsSend } from "react-icons/bs";
import  { createKeyboardMatchHook } from '@/hooks/use-keyboard-match'
import { withDiv } from "./common.types";
import { DarkModeSwitch } from "./dark-mode-switch";
import { StorecraftSDK } from "@storecraft/sdk";

const hook_shift_enter = createKeyboardMatchHook(['Shift', 'Enter']);

const test_sync = async (text: string = '') => {
  const sdk = new StorecraftSDK({endpoint: 'http://localhost:8000'});

  const sync = await sdk.ai.speak(
    {
      prompt: [
        {
          type: "text",
          content: "What is the price of Super Mario for the NES console ?"
        }
      ]
    } 
  );

  console.log(sync)
}

const test = async (text: string = '') => {
  const sdk = new StorecraftSDK({endpoint: 'http://localhost:8000'});

  const gen = await sdk.ai.streamSpeak(
    {
      prompt: [
        {
          type: "text",
          content: "What is the price of Super Mario for the NES console ?"
        }
      ]
    } 
  );

  for await (const chunk of gen) {
    console.log(chunk)
  }
}


const test2 = async (text: string = '') => {

  const response = await fetch(
    'http://localhost:8000/api/ai/agent/stream',
    {
      method: 'post',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        {
          prompt: [
            {
              type: "text",
              content: "What is the price of Super Mario for the NES console ?"
            }
          ]
        } 
      )
    }
  );

  for await (const chunk of response.body) {
    console.log('chunk, ', new TextDecoder().decode(chunk))
  }

}


export type ChatInputParams = withDiv<
  {
    maxLines?: number
  }
>;

export const ChatInputView = (
  {
    maxLines = 3,
    ...rest
  }: ChatInputParams
) => {
  const [hasText, setHasText] = useState(false);
  const ref_ta = useRef<HTMLTextAreaElement>(undefined);

  const onChange = useCallback(
    () => {
      const num_lines = ref_ta.current?.value.split('\n').length ?? 0;
      ref_ta.current && (ref_ta.current.rows = Math.min(num_lines, maxLines));

      // console.log(ref_ta.current.value);

      setHasText(Boolean(ref_ta.current?.value));

    }, [maxLines]
  );

  const onSend = useCallback(
    async () => {
      const value = ref_ta.current?.value;

      ref_ta.current && (ref_ta.current.value = '');

      onChange();

      await test(value);
      console.log('ENDS')


    }, [onChange]
  );

  hook_shift_enter(
    onSend
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

          <button onClick={onSend} 
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