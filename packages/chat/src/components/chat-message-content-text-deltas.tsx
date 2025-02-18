import type { content_multiple_text_deltas, withDiv } from "./common.types";
import svg from './favicon.svg';
import { MDView } from "./md-view";
import { useMemo } from "react";

export type Params = withDiv<
  {
    // content: content_delta_text[];
    chat: {
      content: content_multiple_text_deltas
    }
  }
>;

export const ChatMessageTextDeltasContent = (
  {
    chat
  }: Params
) => {

  const reduced = useMemo(
    () => {
      return chat.content.content.reduce(
        (p, c) => (p + c.content),
        ''
      ) ?? ''
    }, [chat.content]
  );

  return (
    <div className='w-full h-fit flex flex-row gap-5 p-5 self-start'>
      <img src={svg} 
        className='w-8 h-8 border-1 chat-border-overlay
          rounded-md object-fill bg-purple-500/50
          shadow-lg shadow-purple-500/50 ' />
      {/* <div className='max-w-full flex-1' 
          children={message?.content} /> */}
      <MDView value={reduced} 
        className='max-w-full flex-1 prose dark:prose-invert
        prose-headings:mt-0 prose-headings:mb-0 prose-p:mt-0' />
    </div>
  )
}

