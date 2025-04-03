import { content_tool_result, InferToolReturnSchema } from "@storecraft/core/ai";
import { TOOLS } from "@storecraft/core/ai/agents/store/agent.tools.js";
import { useCallback, useEffect, useState } from "react";
import { pubsub } from "@/hooks/use-chat";
import { sleep } from "@/hooks/sleep";
import { withDiv } from "../common.types.js";
import { Card } from "../card.js";
import { MdDiscount } from "react-icons/md";

type ExtractArrayType<T extends any[]> = T extends (infer H)[] ? H : unknown;
type ToolResult = InferToolReturnSchema<ReturnType<typeof TOOLS>["fetch_discounts"]>;
type ItemType = ExtractArrayType<ToolResult>;

export type Params = withDiv<
  {
    chat: {
      content: content_tool_result<ItemType[]>,
    };
  }
>;

export const DiscountCardView = (
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
  const onClick = useCallback(
    () => {
      pubsub.dispatch(
        {
          event: 'request-retry',
          payload: {
            prompt: [
              {
                content: `I want to browse the products of discount \`${item.title}\``,
                type: 'text'
              }
            ]
          }
        }
      )
    }, []
  );

  return (
    <div className={
      'flex flex-col gap-3 items-center p-1 w-fit h-fit duration-300 \
      transition-opacity ' + (ready ? 'opacity-100' : 'opacity-0')}>
      <div
        className='whitespace-nowrap truncate capitalize 
            text-base font-bold  --bg-red-300 font-mono max-w-xl
             --w-fit --max-w-20 text-teal-600 flex flex-row items-center gap-2' >
        <MdDiscount className='inline-flex w-fit text-teal-400 animate-pulse'/> 
        <span children={item.title} className='--whitespace-nowrap' />
      </div>
      <button children='browse discount products' 
        onClick={onClick}
        className='uppercase tracking-widest font-bold w-fit --hidden
            dark:bg-pink-500 bg-black text-white animate-pulse
              p-2 chat-card border rounded-md text-xs cursor-pointer' />
    </div>
  )

}

export const ToolResultContent_Discounts = (
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
        items.map(
          (item, ix) => (
            <Card key={ix} card={{loading: loading, border: true}} className='w-fit' >
              <DiscountCardView key={ix} item={item} index={ix} />
            </Card>
          )
        )
      }
    </div>
  )
}


