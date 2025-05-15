import { useEffect, useState } from "react";
import { pubsub } from "@/hooks/use-chat";
import { sleep } from "@/hooks/sleep";
import { type withDiv } from "../common.types";
import { Card } from "@/components/common/card";
import { LoadingImage } from "@/components/common/loading-image";
import type { ProductType } from "@storecraft/core/api";
import { useCollection } from "@storecraft/sdk-react-hooks";
import { MdNavigateNext } from "react-icons/md";
import { FiltersView } from "./products-filter-view";

export type Params = withDiv<
  {
    chat: {
      /**
       * @description The resource endpoint for product
       * - 'products' for all products
       * - 'collections/:handle/products' for products in a collection
       * - 'discounts/:handle/products' for products in a discount
       */
      products_resource_endpoint: `${string}/products` | 'products',
      /**
       * @description Products tags fetcher for a products resource
       */
      tags_fetcher: () => Promise<string[]>,
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
    <div 
      className={'flex flex-col gap-3 items-center p-3 w-44 h-fit duration-300 \
        transition-opacity ' + (ready ? 'opacity-100' : 'opacity-0')}>
      <div className='w-full h-32 relative'>
        <div 
          className='absolute inset-0 rounded-md object-cover h-full w-full 
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
      <button children='add to cart (coming soon)' 
        className='uppercase tracking-widest font-bold w-full 
        dark:bg-pink-500 bg-black text-white
          p-2 chat-card border rounded-md text-xs' />
    </div>
  )
}

export const ProductsBrowserView = (
  {
    chat: {
      products_resource_endpoint, 
      tags_fetcher
    },
  }: Params
) => {
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const {
    loading: page_loading, error, page, 
    queryCount,
    actions: {
      next, prev, query
    }
  } = useCollection(
    products_resource_endpoint
  );

  useEffect(
    () => {
      tags_fetcher().then(setTags);
    }, []
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

  // const data = chat.content.content.data;
  // // console.log(data)
  // // return;
  // if('error' in data) 
  //   return null;

  return (
    <div className='w-full h-fit flex flex-col gap-3'>

      {/* Navigator */}
      <div 
        className='w-full h-fit justify-between flex flex-row 
          gap-2 items-center opacity-50'>
        <MdNavigateNext 
          onClick={prev} title='previous' 
          className='text-3xl rotate-180 cursor-pointer' />
        {
          queryCount>=0 && 
          <span 
            children={`(${queryCount} products)`} 
            className='font-mono text-sm ' />
        }
        <MdNavigateNext 
          onClick={next} title='next' 
          className='text-3xl cursor-pointer' />
      </div>


      {/* Carousel */}
      <div 
        className='flex flex-row w-full gap-2
          overflow-x-auto h-fit pr-40'
        style={{'maskImage': 'linear-gradient(to right, rgba(0, 0, 0, 1.0) 80%, transparent 100%)'}}>
        {
          page.map(
            (item, ix) => (
              <Card 
                key={item.handle} 
                card={{loading: loading, border: true}} 
                className='w-fit' >
                <ProductCardView 
                  key={ix} 
                  item={item} 
                  index={ix} />
              </Card>
            )
          )
        }
      </div>

      {/* Filter view */}
      <FiltersView 
        chat={
          {
            tags,
            onSelection: (_, vql) => {
              query({ vql });
            }
          }
        } 
      />

    </div>
  )
}
