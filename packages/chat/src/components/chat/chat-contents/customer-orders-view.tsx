import { useEffect, useMemo, useState } from "react";
import { pubsub } from "../use-chat";
import { sleep } from "../../../hooks/sleep";
import { type withDiv } from "../common.types";
import { LoadingImage } from "@/components/common/loading-image";
import type { ProductType } from "@storecraft/core/api";
import { useAuth, useCollection } from "@storecraft/sdk-react-hooks";
import { MdNavigateNext } from "react-icons/md";
import { PriceTag } from "@/components/common/price-tag";
import { Table, type TableParams } from "./table";
import { Login } from "@/components/common/login-form";
import { Card } from "@/components/common/card";

export type Params = withDiv<
  {
    chat?: {}
  }
>;

export const CardSomething = (
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
          className='absolute inset-0 rounded-md object-cover 
            h-full w-full blur-3xl --opacity-40 
            dark:bg-pink-500/50 bg-cyan-500/50' />
        <LoadingImage 
          src={item.media?.at(0) ?? 'placeholder'}
          className=' rounded-md object-contain h-full w-full' />
      </div>

      <p 
        children={item.title} 
        className='whitespace-nowrap truncate 
          font-medium capitalize text-base w-full' />
      <p 
        children={item.price + '$'} 
        className='whitespace-nowrap font-bold text-2xl 
        text-green-600 font-mono' />
      <button 
        children='add to cart (coming soon)' 
        className='uppercase tracking-widest font-bold w-full 
        dark:bg-pink-500 bg-black text-white
          p-2 chat-card border rounded-md text-xs' />
    </div>
  )
}

export const CustomerOrdersView = (
  {
    chat,
  }: Params
) => {
  const { auth, actions, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const {
    loading: page_loading, error, page, 
    hasLoaded,
    queryCount,
    actions: {
      next, prev, query, 
    }
  } = useCollection('orders', {limit: 5});

  // console.log({auth, page, isAuthenticated})

  useEffect(
    () => {
      if(isAuthenticated) {
        query({limit: 5})
      }
    }, [isAuthenticated, query]
  );

  console.log({page, isAuthenticated})

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

  const table_renderers = useMemo(
    () => [
      ({item}) => <div 
        children={item} 
        className='font-mono w-42 overflow-hidden text-ellipsis 
          underline-offset-4 offse underline decoration-dotted
          cursor-pointer pl-3 text-sm opacity-80' 
        onClick={() => {
          pubsub.dispatch(
            {
              event:'request-retry',
              payload: {
                prompt: [
                  {
                    type: 'text',
                    content: `I would like to know more about order ${item}`
                  }
                ] 
              }
            }
          )
        }}
      />,
      ({item}) => (
        <div 
          children={new Date(item).toLocaleDateString()} 
          className='w-42 flex flex-row justify-center opacity-80' 
        />
      ),
      ({item}) => <div children={item} className='w-42' />,
      ({item}) => <PriceTag children={item} />,
    ] as TableParams['chat']['renderers'], []
  );

  if(!isAuthenticated) {
    return (
      <Card className='max-w-3/4 sm:max-w-1/2 --p-3'>
        <Login 
          chat={
            {header:'Please login to perform this action '}
          }
          className='w-full h-fit p-3'
        />
      </Card>
    );
  }

  if(page_loading && !page?.length) {
    return (
      <div 
        className='w-full h-fit flex flex-col gap-3 
          items-center justify-center'>
        <p 
          children='Loading your orders...' 
          className='text-lg font-bold' />
        <LoadingImage 
          className='w-full h-40' />
      </div>
    )
  }

  return (
    <div className='w-full h-fit flex flex-col gap-0'>
      {/* Table */}
      <Table chat={
        {
          content: [
            ['Order ID', 'updated', 'status', 'total'],
            ...page.map(
              (item) => [
                item.id, item.updated_at ,
                item.status.fulfillment.name, 
                item.pricing.total
              ]
            )
          ],
          renderers: table_renderers
        }
      } />

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
            children={`(${queryCount} orders)`} 
            className='font-mono text-sm ' />
        }
        <MdNavigateNext 
          onClick={next} title='next' 
          className='text-3xl cursor-pointer' />
      </div>
    </div>
  )
}

