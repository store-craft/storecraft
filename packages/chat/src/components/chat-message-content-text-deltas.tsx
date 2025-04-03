import type { content_multiple_text_deltas, withDiv } from "./common.types";
import { MDView } from "./md-view";
import { useMemo, useState } from "react";

export type Params = withDiv<
  {
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

  const [x, set_x] = useState(false);

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
    <>
      <MDView 
        value={reduced} 
        className='max-w-full flex-1 prose dark:prose-invert
                    prose-headings:mt-0 prose-headings:mb-0 
                    prose-p:mt-0 prose-p:mb-0 prose-ul:my-0
                    prose-ol:m-0 prose-li:my-1 prose-img:m-0' />
      {/* <button onClick={
        () => { 
          chat.content = {
            content: chat.content.content.map(
              c => ({...c, content: c.content + ' more '})
            )
          }
          set_x(x => !x);
        }
      } children="tomer"/> */}
    </>
  )

  return (
    <MDView 
      value={reduced} 
      className='max-w-full flex-1 prose dark:prose-invert
                  prose-headings:mt-0 prose-headings:mb-0 
                  prose-p:mt-0 prose-p:mb-0 prose-ul:my-0
                  prose-ol:m-0 prose-li:my-1 prose-img:m-0' />
  )
}

