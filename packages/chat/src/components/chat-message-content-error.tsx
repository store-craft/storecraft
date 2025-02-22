import { content_error } from "@storecraft/core/ai";
import type { withDiv } from "./common.types";
import { MDView } from "./md-view";
import { HiDuplicate, HiOutlineDuplicate } from "react-icons/hi";
import { useCallback, useState } from "react";
import { sleep } from "@/hooks/sleep";
import { MdDone } from "react-icons/md";
import { ShowBinarySwitch } from "./show-if";

export type Params = withDiv<
  {
    chat: {
      content: content_error
    };
  }
>;

export const ChatMessageErrorContent = (
  {
    chat,
  }: Params
) => {
  const content = chat.content.content;
  const text = (typeof content === 'string') ? content : (content.message ?? 'Something went wrong');
  const [wasCopied, setWasCopied] = useState(false);
  const onClick = useCallback(
    async() => {
      if(!text)
        return;
      await navigator.clipboard.writeText(text);
      setWasCopied(true);
      await sleep(1500);
      setWasCopied(false);
    }, [text]
  );


  return (
    <div className='relative p-0 border bg-red-500/10 border-red-500/30 rounded-md'>
      <MDView 
        value={"\`\`\`json \n" + text + " \n\`\`\`"} 
        className='max-w-full flex-1 prose dark:prose-invert
                    prose-headings:mt-0 prose-headings:mb-0 
                    prose-p:mt-0 prose-p:mb-0 prose-ul:my-0
                    prose-ol:my-0 prose-pre:m-0
                    text-red-600 prose-pre:bg-transparent
                  prose-pre:text-red-600 dark:prose-pre:text-gray-300
                  prose-code:text-red-600 dark:prose-code:text-gray-300
                    ' />
      <ShowBinarySwitch index={wasCopied ? 1 : 0}>
        <HiOutlineDuplicate 
          className='absolute text-xl top-3 right-3 opacity-80 
                  hover:opacity-100 cursor-pointer'
          onClick={onClick}/>

        <MdDone className='absolute text-xl top-3 right-3 opacity-80 
                  hover:opacity-100 cursor-pointer text-green-600'/>
      </ShowBinarySwitch>                    

    </div>
  )
}
