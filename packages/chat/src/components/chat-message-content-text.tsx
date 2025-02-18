import { content_text } from "@storecraft/core/ai";
import type { withDiv } from "./common.types";
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
    <MDView value={chat.content.content} 
            className='max-w-full flex-1 prose dark:prose-invert
                       prose-headings:mt-0 prose-headings:mb-0 
                       prose-p:mt-0 prose-p:mb-0 prose-ul:my-0' />
  )
}

