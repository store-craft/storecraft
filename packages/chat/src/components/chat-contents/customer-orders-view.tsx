import React, { useEffect, useMemo, useState } from "react";
import { pubsub } from "@/hooks/use-chat";
import { sleep } from "@/hooks/sleep";
import { type withDiv } from "../common.types.js";
import { Card } from "../card.js";
import { LoadingImage } from "../loading-image.js";
import type { ProductType } from "@storecraft/core/api";
import { useAuth, useCollection, useStorecraft } from "@storecraft/sdk-react-hooks";
import { MdNavigateNext } from "react-icons/md";
import { FiltersView } from "./products-filter-view.js";
import { PriceTag } from "../price-tag.js";

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

export const CustomerOrdersView = (
  {
    chat,
  }: Params
) => {
  const { auth, actions, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const {
    loading: page_loading, error, page, 
    queryCount,
    actions: {
      next, prev, query
    }
  } = useCollection('orders', {limit:5});

  console.log(auth)
  useEffect(
    () => {
      actions.signin(
        'tomer.shalev@gmail.com',
        'admin'
      );
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

  const table_renderers = useMemo(() => [
    ({item}) => <div 
      children={item} 
      className='font-mono w-42 overflow-hidden text-ellipsis 
        underline-offset-4 offse underline decoration-dotted
        cursor-pointer' 
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
    ({item}) => <div children={new Date(item).toLocaleDateString()} className='w-42 flex flex-row justify-center' />,
    ({item}) => <div children={item} className='w-42' />,
    ({item}) => <PriceTag children={item} />,
  ] as TableParams['chat']['renderers']
  , []);

  if(!isAuthenticated) {
    return null;
  }


  // const data = chat.content.content.data;
  // // console.log(data)
  // // return;
  // if('error' in data) 
  //   return null;

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
                item.status.fulfillment.name, item.pricing.total
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

const default_renderer: React.FC<{item:any}> = ({item}) => <span children={item}/>

type TableParams = {
  chat: {
    content: (string | number | boolean)[][],
    renderers?: React.FC<{item: any}>[]
  }
} & React.ComponentProps<'div'>;

export const Table = (
  {
    chat, ...rest
  }: TableParams
) => {

  // console.log({table: 'table'})

  return (
    <div {...rest} className=" overflow-x-scroll">
      <table className='w-full table-auto'>
        <thead>
          <tr className='border-b chat-bg-overlay 
            chat-border-overlay --font-inter rounded-md
              text-gray-400'>
            {
              chat.content[0].map(
                (item, ix) => (
                  <th 
                    className={
                      'text-ellipsis ' +
                      (
                        ix==0 ? 'text-left --px-3' : 
                        ix<chat.content[0].length-1 ? 
                        'text-center px-3' : 
                        'text-right px-0 --sticky right-0 '
                      )
                    }
                    key={ix} 
                    children={
                      <span 
                        className='px-3 text-ellipsis font-light 
                          font-mono text-sm w-32 '>
                        {item}
                      </span>
                    } 
                  /> 
                )
              )
            }
          </tr>
        </thead>
        <tbody>
        {
          chat.content.slice(1).map(
            (item, ix) => (
              <tr key={ix} className='border-b chat-border-overlay'>
                {
                  item.map(
                    (cell, ix) => (
                      <td key={ix} className='relative'>
                        <div 
                          className={
                            'text-ellipsis py-2 overflow-hidden ' +
                            (
                              ix==0 ? 'text-left --px-3' : 
                              ix<item.length-1 ? 
                              'flex flex-row justify-center text-center px-3' : 
                              'text-right px-0 sticky right-0 '
                            )
                          }
                        >
                        {
                          chat.renderers?.[ix] ? 
                            chat.renderers[ix]({item: cell}) : 
                            default_renderer({item: cell}) as any
                        }
                        </div>
                      </td> 
                    )
                  )
                }
              </tr>
            )
          )
        }
        </tbody>
      </table>
    </div>
  )
}