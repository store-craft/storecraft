import type { content_multiple_text_deltas, withDiv } from "./common.types";
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

  // console.log(chat.content)

  return (
    <MDView value={reduced} 
            className='max-w-full flex-1 prose dark:prose-invert
                       prose-headings:mt-0 prose-headings:mb-0 
                       prose-p:mt-0' />
  )
}

