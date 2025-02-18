import { content_text } from "@storecraft/core/ai";
import type { withDiv } from "./common.types";
import svg from './favicon.svg';
import { MDView } from "./md-view";

export type Params = withDiv<
  {
    chat: {
      content: content_text
    };
  }
>;

export const ChatMessageTextContent = (
  {
    chat,
  }: Params
) => {

  return (
    <div className='w-full h-fit flex flex-row gap-5 p-5 self-start'>
      <img src={svg} 
        className='w-8 h-8 border-1 chat-border-overlay
          rounded-md object-fill bg-purple-500/50
          shadow-lg shadow-purple-500/50 ' />
      {/* <div className='max-w-full flex-1' 
          children={message?.content} /> */}
      <MDView value={chat.content.content} 
        className='max-w-full flex-1 prose dark:prose-invert
        prose-headings:mt-0 prose-headings:mb-0 prose-p:mt-0' />
    </div>
  )
}

