import { content_tool_use } from "@storecraft/core/ai";
import type { withDiv } from "./common.types";
import { MDView } from "./md-view";
import { Card } from "./card";
import { useEffect, useState } from "react";
import { pubsub } from "@/hooks/use-chat";
import { sleep } from "@/hooks/sleep";

export type Params = withDiv<
  {
    chat: {
      content: content_tool_use,
    };
  }
>;

export const ChatMessageToolUseContent = (
  {
    chat,
  }: Params
) => {
  const [loading, setLoading] = useState(true);

  useEffect(
    () => {
      return pubsub.add(
        async (update) => {
          if(update.event==='state') {
            const filtered = update.payload.messages?.at(-1)?.contents?.filter(
              c => (c.type==='tool_result' || c.type==='error')
            );

            if(filtered?.length) {
              await sleep(1000);
  
              setLoading(false);            
            }
          }
        }
      );
    }, []
  );

  return (
    <div className='flex flex-col gap-3 w-fit -skew-x-6'>
      {
        chat.content.content.map(
          (c, ix) => (
            <Card card={{loading}} key={ix} >
              <MDView 
                value={c.title ?? 'Performing Action'} 
                className='max-w-full flex-1 prose dark:prose-invert px-2
                          prose-headings:mt-0 prose-headings:mb-0 
                          prose-p:mt-0 prose-p:mb-0 prose-ul:my-0
                          prose-ol:my-0' />
            </Card>
          )
        )
      }
    </div>
    
  )
}

