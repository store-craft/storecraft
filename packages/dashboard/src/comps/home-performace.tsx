import { 
  useCallback, useEffect, useMemo, 
  useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bling, HR } from './common-ui'
import SalesChart from './home-sales-chart'
import TimeFrame, { TimeFrameParams } from './home-time-frame'
import ShowIf from './show-if'
import { BiTrendingUp } from 'react-icons/bi'
import { useStorecraft } from '@storecraft/sdk-react-hooks'
import { useMiscCache } from '@storecraft/sdk-react-hooks'
import { OrdersStatisticsEntity, OrdersStatisticsType } from '@storecraft/core/api'
// import dummy_stats from  './home-performace-stats.json';

const DAY = 86400000;

export type HomeInfoCapsuleParams = {
  label: string;
  value: string;
} & React.ComponentProps<'div'>;

export type stat_entity_fn<V> = (
  k: string, 
  v: OrdersStatisticsEntity
) => V;

export type HomeTopSoldCardParams = {
  data: [string, OrdersStatisticsEntity][];
  label_prefix?: string;
  label?: string;
  linkFn: stat_entity_fn<string>;
  valFn?: stat_entity_fn<number>;
  labelFn?: stat_entity_fn<string>;
} & React.ComponentProps<'div'>;

export type HomePerformanceParams = {
  nada?: object;
} & React.ComponentProps<'div'>;


/**
 * Compute top-K over latest span of time from the server stats
 * @param data server stats
 */
const compute_top_k_stats = (data: OrdersStatisticsType) => {

  if(data===undefined) 
    return undefined;

  type result_type = {
    tags: Record<string, OrdersStatisticsEntity>,
    products: Record<string, OrdersStatisticsEntity>,
    collections: Record<string, OrdersStatisticsEntity>,
    discounts: Record<string, OrdersStatisticsEntity>
  }

  const result: result_type = {
    tags: {},
    products: {},
    collections: {},
    discounts: {},
  };

  // console.log('data.days', data.days);
  const reduced = Object
    .entries(data.days)
    .reduce(
    (p, c) => {
      const [
        day, 
        { 
          products, tags, collections, discounts
        }
      ] = c;
      
      Object.entries(tags).forEach(
        ([k, v]) => {
          p.tags[k] = (p.tags[k] ?? {...v, count: 0});
          p.tags[k].count += (v.count ? v.count : 0);
        }
      );

      Object.entries(collections).forEach(
        ([k, v]) => {
          p.collections[k] = (p.collections[k] ?? {...v, count: 0});
          p.collections[k].count += (v.count ? v.count : 0);
        }
      );

      Object.entries(discounts).forEach(
        ([k, v]) => {
          p.discounts[k] = (p.discounts[k] ?? {...v, count: 0});
          p.discounts[k].count += (v.count ? v.count : 0);
        }
      );

      Object.entries(products).forEach(
        ([k, v]) => {
          p.products[k] = (p.products[k] ?? {...v, count: 0});
          p.products[k].count += (v.count ? v.count : 0);
        }
      );

      return p
    }, result
  );

  type StatisticsEntityTuple = [
    k1: string,
    v1: OrdersStatisticsEntity
  ];
  const sortFn = (
    [k1, v1]: StatisticsEntityTuple, 
    [k2, v2]: StatisticsEntityTuple
  ) => -v1.count+v2.count

  const pickK = (o: OrdersStatisticsEntity, sort: typeof sortFn) => {
    // convert o to array of kv tuples ->sort ->pick first K
    return Object
    .entries(o)
    .sort(sort)
    // .slice(0, 10);
  }

  return {
    collections: pickK(reduced.collections, sortFn),
    tags: pickK(reduced.tags, sortFn),
    discounts: pickK(reduced.discounts, sortFn),
    products: pickK(reduced.products, sortFn)
  };
}

const InfoCapsule = (
  {
    label, value, ...rest
  }: HomeInfoCapsuleParams
) => {

  return (
<div 
  className={
    `p-1 pl-2 px-1 rounded-full border shelf-border-color
    cursor-pointer 
    bg-kf-400 text-white 
    dark:bg-kf-800/20 
    w-fit max-w-full h-fit 
    flex flex-row justify-between gap-3 text-sm shadow-lg
    hover:scale-[1.04] duration-75 transition-transform`
  } {...rest}>

  <span 
    children={label} 
    className='whitespace-nowrap --flex-0 max-w-[80%] 
      overflow-x-hidden hover:overflow-x-auto' />        
  <span 
    children={value} 
    className='rounded-full bg-white --flex-shrink-0
    text-pink-500 px-2 font-semibold'/>

</div>        
  )
}


const TopSoldCard = (
  { 
    data, label_prefix='', label='Top Sold', 
    linkFn, valFn=(k, v)=>v.count ?? 0, 
    labelFn=(k,v)=>v.title ?? k, ...rest 
  }: HomeTopSoldCardParams
) => {

  return (
<Bling 
  rounded='rounded-xl' 
  stroke='border-2'
  className='shadow-md dark:shadow-xl'>
  <div 
    className='w-56 h-52 
      shelf-plain-card-fill
      rounded-xl px-3 pt-2
      flex flex-col'>
    <div className='text-gray-500 text-base border-b shelf-border-color pb-2'>
      {/* <SpaceShip/> */}
      {/* <WhiteSpace n={2}/> */}
      {/* <span children={label_prefix} className='font-open_sans text-gray-400'  /> */}
      <BiTrendingUp 
        className='inline text-2xl rounded-md
          text-kf-400  bg-white/50
          dark:text-kf-400 dark:bg-white/10
          border border-kf-500/25 p-px' />  
      <div 
        children={label} 
        className='p-1 tracking-wider font-mono 
          bg-pink-50 text-pink-500
          dark:bg-pink-50/10 dark:text-pink-500
          font-semibold h-20 mx-1
          rounded-md --border text-sm inline' />

    </div> 
    <ShowIf show={data.length}>
      <div 
        className='w-full rounded-lg flex flex-row flex-wrap 
          gap-1 py-3 flex-1 overflow-clip hover:overflow-y-auto 
          overflow-x-hidden content-start'>
      {
        data.map(
          ([k, v], ix) => (
            <Link 
              key={k} to={linkFn(k, v)} 
              draggable='false' className='w-full'>
              <InfoCapsule 
                label={labelFn(k, v)} 
                value={String(valFn(k, v))} />
            </Link>                     
          )
        )
      }
      </div>
    </ShowIf>
    <ShowIf show={!data.length}>
      <p 
        className='w-full h-full flex flex-row items-center justify-center
          --text-gray-300 text-3xl text-center font-semibold 
          whitespace-pre-wrap text-transparent bg-clip-text 
          bg-gradient-to-b from-gray-200 to-gray-500'
        children={`Not enough \ndata \n:-)`} />
    </ShowIf>
  </div>    
</Bling>
  )
}


const Performance = (
  { 
    ...rest 
  }: HomePerformanceParams
) => {

  const { sdk } = useStorecraft();
  const ref_effect_ran = useRef(false);
  const [data, setData] = useState<OrdersStatisticsType>();
  const [span, setSpan] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const { 
    actions: {
      get: cache_get, put: cache_put
    }
  } = useMiscCache();

  const load = useCallback(
    async ($span: number) => {
      setError(undefined);

      if($span===span && data)
        return;

      // if(!data)
        // setLoading(true);

      try {
        const KEY = `statistics_orders_latest_span_${$span}`;
        const working_data = await cache_get(KEY) as OrdersStatisticsType;
        
        if(working_data) {
          setData(working_data);
          setLoading(false);
        }

        // const new_data = dummy_stats;
        const new_data = await sdk.statistics.orders(
          Date.now() - $span * DAY, Date.now()
        );

        cache_put(KEY, new_data);
        setData(new_data);
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false);
      }
    }, [data, sdk, cache_get, cache_put, span]
  );

  const onSpanChanged: TimeFrameParams["onChange"] = useCallback(
    (v) => {
      setSpan(v);
      load(v);
    },
    [load],
  );
  
  useEffect(
    () => {
      if(ref_effect_ran.current)
        return;
      ref_effect_ran.current = true;
      onSpanChanged(span);
    }, [onSpanChanged, span]
  );

  const days_reduced = useMemo(
    () => {
      if(data===undefined) 
        return undefined;
      return compute_top_k_stats(data);
    }, [data]
  );

  const msg = loading ? 'Loading ...' : 
              error ? String(error) : 
              data===undefined ? 'Not enough data...' :
              undefined;

  return (
<div {...rest} >
  <ShowIf show={msg}>
    <div 
      className='w-full h-fit p-10 border-4 border-dashed 
        shelf-border-color rounded-lg flex 
        flex-row justify-center items-center
        text-2xl text-gray-400 animate-pulse' 
      children={msg}>
    </div>
  </ShowIf>
  
  <ShowIf show={days_reduced && data && !msg}>
    <div className='w-full h-fit'>
      <TimeFrame 
        onChange={onSpanChanged} 
        span={span} />
      <SalesChart 
        data={data} 
        className='w-full max-w-screen-md h-[200px] mt-5' 
      /> 
      <HR className='my-5' />
      <div className='w-full h-fit flex flex-row justify-center 
                      lg:justify-start flex-wrap mt-5 gap-5'>
        <TopSoldCard 
          data={days_reduced?.products} 
          label='products' 
          labelFn={(k, v)=>v.title??k} 
          valFn={(k, v)=>v.count ?? 0} 
          linkFn={(k, v) => `/pages/products/${k}`} 
        />
        <TopSoldCard 
          data={days_reduced?.collections} 
          label='collections' 
          valFn={(k, v)=>v.count ?? 0} 
          linkFn={(k, v) => `/pages/collections/${k}`}
        />
        <TopSoldCard 
          data={days_reduced?.discounts} 
          label='discounts' 
          valFn={(k, v)=>v.count ?? 0} 
          linkFn={(k, v) => `/pages/discounts/${k}`}
        />
        <TopSoldCard 
          data={days_reduced?.tags} 
          label='tags' 
          valFn={(k, v)=>v.count ?? 0} 
          linkFn={(k, v) => `/pages/tags/${k.split('_')[0]}`}
        />
      </div>  
    </div>        
  </ShowIf>         
</div>
  )
}

export default Performance
