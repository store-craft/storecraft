import { useCallback, useRef, useState } from "react"
import { Card } from "./card"
import { BsSend } from "react-icons/bs";
import  { createKeyboardMatchHook } from '@/hooks/use-keyboard-match'

const hook_shift_enter = createKeyboardMatchHook(['Shift', 'Enter']);

export const ChatInput = (
  {
    maxLines = 3
  }
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
    () => {
      ref_ta.current && (ref_ta.current.value = '');
      onChange()
    }, [onChange]
  );

  hook_shift_enter(
    onSend
  )

  return (
    <div className='w-full h-full'>
      <Card className='w-full h-fit overflow-clip'>
        <div className='w-full h-fit flex flex-col gap-4 relative py-3'>
          <textarea rows={1}
            ref={ref_ta} onChange={onChange}
            className='resize-none text-sm w-full outline-none pl-3 h-fit min-h-8 
                  -bg-red-100 font-light' 
            placeholder='Ask me anything' />

          <button onClick={onSend} 
              className={`rounded-md h-8 w-8 p-2 bg-blue-400 absolute right-3 
                        cursor-pointer 
                        ease-in-out top-3 transition-all duration-300 ` + 
                        (hasText ? `-translate-y-0` : '-translate-y-10') }>
            <BsSend className='w-full h-full text-white' />
          </button>

          <div className='w-fit h-fit text-xs self-end px-3 -hidden tracking-wider'>
            <span children='Shift' 
                className='border chat-border-overlay chat-bg-overlay p-0.5 rounded-md text-[11px] font-mono font-bold'/>
            <span children=' + ' className='opacity-60'/>
            <span children='Enter' 
                className='border chat-border-overlay chat-bg-overlay p-0.5 rounded-md text-[11px] font-mono font-bold'/>
            <span children=' to send' className='opacity-50'/>
          </div>

        </div>
      </Card>

    </div>
  )
}