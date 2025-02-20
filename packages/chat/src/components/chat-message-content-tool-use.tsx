import { content_tool_use } from "@storecraft/core/ai";
import type { withDiv } from "./common.types";
import { MDView } from "./md-view";
import { Card } from "./card";
import { useEffect, useState } from "react";
import { pubsub } from "@/hooks/use-chat";

export type Params = withDiv<
  {
    chat: {
      content: content_tool_use,
    };
  }
>;

const sleep = (ms=100) => {
  return new Promise(
    (resolve, reject) => {
      setTimeout(
        resolve, ms
      )
    }
  )
}

export const ChatMessageToolUseContent = (
  {
    chat,
  }: Params
) => {
  const [loading, setLoading] = useState(true);

  useEffect(
    () => {
      return pubsub.add(
        async () => {
          await sleep(1000);
          setLoading(false);
        }
      );
    }, []
  );

  return (
    <div className='flex flex-col gap-3 w-fit'>
      {
        chat.content.content.map(
          (c) => (
            <Card card={{loading}} >
              <MDView value={c.title} 
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

