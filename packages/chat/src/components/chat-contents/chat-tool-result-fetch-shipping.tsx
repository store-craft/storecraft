import { 
  type content_tool_result, type InferToolReturnSchema 
} from "@storecraft/core/ai";
import { TOOLS } from "@storecraft/core/ai/agents/store/agent.tools.js";
import { useEffect, useState } from "react";
import { pubsub } from "@/hooks/use-chat";
import { sleep } from "@/hooks/sleep";
import { type withDiv } from "../common.types.js";
import { Card } from "../card.js";
import { FaShippingFast } from "react-icons/fa";
import { LoadingImage } from "../loading-image.js";

type ExtractArrayType<T extends any[]> = T extends (infer H)[] ? H : unknown;
type ToolResult = InferToolReturnSchema<ReturnType<typeof TOOLS>["fetch_shipping_methods"]>;
type ItemType = ExtractArrayType<ToolResult>;

export type Params = withDiv<
  {
    chat: {
      content: content_tool_result<ItemType[]>,
    };
  }
>;

export const ShippingCardView = (
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
    <div 
      className={'flex flex-col gap-3 items-center p-3 w-44 h-fit \
        duration-300 transition-opacity ' + (ready ? 'opacity-100' : 'opacity-0')}>
      <div className='w-full h-32 relative'>
        <div 
          className='absolute inset-0 rounded-md object-cover h-full w-full 
            blur-3xl --opacity-40 dark:bg-pink-500/50 bg-cyan-500/40' />
        <LoadingImage 
          src={item.media?.at(0)}
          className='rounded-md object-contain h-full w-full ' >
          <div className='w-full h-full bg-slate-600/40 animate-pulse rounded-md'>
            <FaShippingFast className='w-full h-full p-10 opacity-50' />
          </div>
        </LoadingImage>
      </div>

      <p 
        children={item.title} 
        className='whitespace-nowrap truncate font-medium capitalize 
          text-base  w-full --max-w-20' />
      <p 
        children={item.price + '$'} 
        className='whitespace-nowrap font-bold text-2xl 
        text-green-600 font-mono' />
      <button 
        children='use' 
        className='uppercase tracking-widest font-bold w-full 
        dark:bg-pink-500 bg-black text-white
          p-2 chat-card border rounded-md text-xs' />
    </div>
  )
}

export const ToolResultContent_ShippingMethods = (
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
    <div 
      className='flex flex-row w-full gap-2 --overflow-x-hidden 
        overflow-x-auto h-fit pr-40 pb-5'
      style={{'maskImage': 'linear-gradient(to right, rgba(0, 0, 0, 1.0) 80%, transparent 100%)'}}>
      {
        items.map(
          (item, ix) => (
            <Card 
              key={ix} 
              card={{loading: loading, border: true}} 
              className='w-fit' 
            >
              <ShippingCardView 
                key={ix} 
                item={item} 
                index={ix} 
              />
            </Card>
          )
        )
      }
    </div>
  )
}


