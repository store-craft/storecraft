import { content_tool_result, InferToolReturnSchema } from "@storecraft/core/ai";
import { TOOLS } from "@storecraft/core/ai/agents/agent.tools.js";
import { useEffect, useState } from "react";
import { pubsub } from "@/hooks/use-chat";
import { sleep } from "@/hooks/sleep";
import { withDiv } from "../common.types";
import { Card } from "../card";

type ExtractArrayType<T extends any[]> = T extends (infer H)[] ? H : unknown;
type ToolResult = InferToolReturnSchema<typeof TOOLS["search_products"]>;
type ProductType = ExtractArrayType<ToolResult>;

export type Params = withDiv<
  {
    chat: {
      content: content_tool_result<ProductType[]>,
    };
  }
>;

export const ProductView = (
  {
    product
  }: withDiv<{product: ProductType}>
) => {

  return (
    <div className='flex flex-col gap-3 items-center p-3 w-44 h-fit'>
      <div className='w-full h-32 relative'>
        <div className='absolute inset-0 rounded-md object-cover h-full w-full 
                  blur-3xl --opacity-40 dark:bg-pink-500/50 bg-cyan-500/50' />
        <img src={product.media?.at(0) ?? 'placeholder'}
            className='absolute inset-0 rounded-md object-cover h-full w-full 
                  --blur-xs opacity-40' />
        <img src={product.media?.at(0) ?? 'placeholder'}
          className='absolute inset-0 rounded-md object-contain h-full w-full' />
      </div>

      <p children={product.title} 
        className='whitespace-nowrap truncate font-medium capitalize 
            text-base w-full --max-w-20' />
      <p children={product.price + '$'} 
        className='whitespace-nowrap font-bold text-2xl 
              text-green-600 font-mono' />
      <button children='add to cart' 
        className='uppercase tracking-widest font-bold w-full 
            dark:bg-pink-500 bg-black text-white
                  p-2 chat-card border rounded-md text-xs' />
    </div>
  )
}

export const ToolResultContent_Products = (
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

  const products = data.result;

  return (
    <div className='flex flex-row w-full gap-2 --overflow-x-hidden 
                  overflow-x-auto h-fit pr-40 pb-5'
      style={{'mask-image': 'linear-gradient(to right, rgba(0, 0, 0, 1.0) 80%, transparent 100%)'}}>
      {
        products.slice(0,4).map(
          (p, ix) => (
            <Card key={ix} card={{loading: loading}} className='w-fit' >
              <ProductView key={ix} product={p} />
            </Card>
          )
        )
      }
    </div>
  )
}


{/* <MDView 
        value={c.title} 
        className='max-w-full flex-1 prose dark:prose-invert px-2
                  prose-headings:mt-0 prose-headings:mb-0 
                  prose-p:mt-0 prose-p:mb-0 prose-ul:my-0
                  prose-ol:my-0' /> */}
