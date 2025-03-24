import { content_tool_result, InferToolReturnSchema } from "@storecraft/core/ai";
import { TOOLS } from "@storecraft/core/ai/agents/store/agent.tools.js";
import { useEffect, useState } from "react";
import { pubsub } from "@/hooks/use-chat";
import { sleep } from "@/hooks/sleep";
import { withDiv } from "../common.types.js";
import { Card } from "../card.js";
import { LoadingImage } from "../loading-image.js";
import type { ProductType } from "@storecraft/core/api";
import { useCollection } from "@storecraft/sdk-react-hooks";
import { MdNavigateNext } from "react-icons/md";
import { FiltersView } from "./products-filter-view.js";

type ToolResult = InferToolReturnSchema<ReturnType<typeof TOOLS>["browse_collection"]>;

export type Params = withDiv<
  {
    chat: {
      content: content_tool_result<ToolResult>,
    };
  }
>;

export const ProductCardView = (
  {
    item, index
  }: withDiv<{item: ProductType, index: number}>
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
        <LoadingImage 
          src={item.media?.at(0) ?? 'placeholder'}
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
  const collection_handle = chat.content.content.data?.result.params.handle;
  const [loading, setLoading] = useState(true);
  const {
    sdk, loading: page_loading, error, page, 
    queryCount,
    actions: {
      next, prev, query
    }
  } = useCollection(
    `collections/${collection_handle}/products`
  );

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

  return (
    <div className='w-full h-fit flex flex-col gap-3'>

      {/* Navigator */}
      <div className='w-full h-fit justify-between flex flex-row 
              gap-2 items-center opacity-50'>
        <MdNavigateNext 
          onClick={prev} title='previous' 
          className='text-3xl rotate-180 cursor-pointer' />
        {
          queryCount && 
          <span 
            children={`(${queryCount} products)`} 
            className='font-mono text-sm ' />
        }
        <MdNavigateNext 
          onClick={next} title='next' 
          className='text-3xl cursor-pointer' />
      </div>

      
      {/* Carousel */}
      <div className='flex flex-row w-full gap-2 --overflow-x-hidden 
                    overflow-x-auto h-fit pr-40 --pb-5'
        style={{'maskImage': 'linear-gradient(to right, rgba(0, 0, 0, 1.0) 80%, transparent 100%)'}}>
        {
          page.map(
            (item, ix) => (
              <Card key={item.handle} card={{loading: loading}} className='w-fit' >
                <ProductCardView key={ix} item={item} index={ix} />
              </Card>
            )
          )
        }
      </div>

      {/* Filter view */}
      <FiltersView 
        chat={
          {
            handle: collection_handle,
            onSelection: (_, vql) => {
              query({ vql });
            }
          }
        } 
      />

    </div>
  )
}
