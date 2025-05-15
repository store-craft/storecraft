import { type content_error } from "@storecraft/core/ai";
import { type withDiv } from "./common.types";
import { MDView } from "./md-view";
import { useState } from "react";
import ShowIf from "../common/show-if";
import { CopyClipboard } from "./copy-clipboard";
import { LuExpand } from "react-icons/lu";

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
  const text = (typeof content === 'string') ? 
    content : (
      content ? JSON.stringify(content, null, 2) : 'Something went wrong'
    );
  const [open, setOpen] = useState(false);

  return (
    <div 
      className={`relative py-1 px-2 w-fit max-w-full border bg-red-500/10 
      border-red-400/30 rounded-md text-red-400 ` + (open ? '' : '-skew-x-6')}
    >
      <button 
        onClick={() => {setOpen(x => !x)}}
        className={'h-fit cursor-pointer flex flex-row justify-between \
            gap-10 items-center ' + (open ? 'w-full' : 'w-fit')}>
        <p children='🤖 something went wrong' className='--p-3' />
        <LuExpand 
          className='cursor-pointer' />
      </button>

      <ShowIf show={open}>
        <div className='relative w-full max-w-full mt-3'>
          <MDView 
            value={"\`\`\`json \n" + text + " \n\`\`\`"} 
            className='max-w-full flex-1 prose dark:prose-invert
              prose-headings:mt-0 prose-headings:mb-0 
              prose-p:mt-0 prose-p:mb-0 prose-ul:my-0
              prose-ol:my-0 prose-pre:m-0 prose-pre:p-0
              text-red-600 prose-pre:bg-transparent
            prose-pre:text-red-600 dark:prose-pre:text-gray-300
            prose-code:text-red-600 dark:prose-code:text-gray-300' 
          />
          <CopyClipboard copy_text={text} 
            className='absolute top-0 right-0 
              dark:text-white text-gray-700' 
          />
        </div>    
      </ShowIf>

    </div>
  )
}

