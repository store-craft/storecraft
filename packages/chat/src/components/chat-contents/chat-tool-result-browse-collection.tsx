import { content_tool_result, InferToolReturnSchema } from "@storecraft/core/ai";
import { TOOLS } from "@storecraft/core/ai/agents/store/agent.tools.js";
import { useEffect, useState } from "react";
import { pubsub } from "@/hooks/use-chat";
import { sleep } from "@/hooks/sleep";
import { withDiv } from "../common.types.js";
import { Card } from "../card.js";
import { LoadingImage } from "../loading-image.js";

type ExtractArrayType<T extends any[]> = T extends (infer H)[] ? H : unknown;
type ToolResult = InferToolReturnSchema<ReturnType<typeof TOOLS>["browse_collection"]>;
type ItemType = ExtractArrayType<ToolResult>;

export type Params = withDiv<
  {
    chat: {
      content: content_tool_result<ItemType[]>,
    };
  }
>;

export const ProductCardView = (
  {
    item, index
  }: withDiv<{item: ItemType, index: number}>
) => {
  const [ready, setReady] = useState(false);
  useEffect(
    () => {
      sleep((index + 1) * 300).then(() => {setReady(true)})
    }, []
  );

  return (
    <div className={'flex flex-col gap-3 items-center p-3 w-44 h-fit duration-300 \
          transition-opacity ' + (ready ? 'opacity-100' : 'opacity-0')}>
      <div className='w-full h-32 relative'>
        <div className='absolute inset-0 rounded-md object-cover h-full w-full 
                  blur-3xl --opacity-40 dark:bg-pink-500/50 bg-cyan-500/50' />
        <LoadingImage src={item.media?.at(0) ?? 'placeholder'}
            className=' rounded-md object-contain h-full w-full' />
      </div>

      <p children={item.title} 
        className='whitespace-nowrap truncate font-medium capitalize 
            text-base w-full --max-w-20' />
      <p children={item.price + '$'} 
        className='whitespace-nowrap font-bold text-2xl 
              text-green-600 font-mono' />
      <button children='add to cart' 
        className='uppercase tracking-widest font-bold w-full 
            dark:bg-pink-500 bg-black text-white
                  p-2 chat-card border rounded-md text-xs' />
    </div>
  )
}

export const ToolResultContent_BrowseCollection = (
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

  const data = chat.content.content.data;
  // console.log(data)
  // return;
  if('error' in data) 
    return null;

  const items = data.result;

  return (
    <div className='flex flex-row w-full gap-2 --overflow-x-hidden 
                  overflow-x-auto h-fit pr-40 pb-5'
      style={{'maskImage': 'linear-gradient(to right, rgba(0, 0, 0, 1.0) 80%, transparent 100%)'}}>
      {
        items.slice(0,4).map(
          (item, ix) => (
            <Card key={ix} card={{loading: loading}} className='w-fit' >
              <ProductCardView key={ix} item={item} index={ix} />
            </Card>
          )
        )
      }
    </div>
  )
}


