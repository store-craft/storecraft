import { 
  useCallback, useEffect, useMemo, 
  useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSDK } from '@/admin-sdk/index.js'
import { Bling, HR } from './common-ui.jsx'
import SalesChart from './home-sales-chart.jsx'
import TimeFrame from './home-time-frame.jsx'
import ShowIf from './show-if.jsx'
import { BiTrendingUp } from 'react-icons/bi/index.js'

const DAY = 86400000

/**
 * @param {number | string | Date} d 
 */
const to_millis = d => (new Date(d)).getTime()

/**
 * Compute top-K over latest span of time from the server stats
 * 
 * @param {import('@storecraft/core/v-api').StatisticsType} data server stats
 * 
 */
const compute_top_k_stats = (data) => {

  if(data===undefined) return undefined;

  /**
   * @type {{
   *  tags?: Record<string, import('@storecraft/core/v-api').StatisticsEntity>,
   *  products?: Record<string, import('@storecraft/core/v-api').StatisticsEntity>,
   *  collections?: Record<string, import('@storecraft/core/v-api').StatisticsEntity>,
   *  discounts?: Record<string, import('@storecraft/core/v-api').StatisticsEntity>
   * }}
   */
  const result = {
    tags: {},
    products: {},
    collections: {},
    discounts: {},
  };

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
          p.tags[k] = (p.tags[k] ?? {...v});
          p.tags[k].count += v.count ? v.count : 0;
        }
      );

      Object.entries(collections).forEach(
        ([k, v]) => {
          p.collections[k] = (p.collections[k] ?? {...v});
          p.collections[k].count += v.count ? v.count : 0;
        }
      );

      Object.entries(discounts).forEach(
        ([k, v]) => {
          p.discounts[k] = (p.discounts[k] ?? {...v});
          p.discounts[k].count += v.count ? v.count : 0;
        }
      );

      Object.entries(products).forEach(
        ([k, v]) => {
          p.products[k] = (p.products[k] ?? {...v});
          p.products[k].count += v.count ? v.count : 0;
        }
      );

      return p
    }, result
  );

  console.log('reduced ', data)

  /**
   * @typedef {[
   *  k1: string, v1: import('@storecraft/core/v-api').StatisticsEntity
   * ]} StatisticsEntityTuple
   * 
   * @param {StatisticsEntityTuple} param0 
   * @param {StatisticsEntityTuple} param1 
   */
  const sortFn = ([k1, v1], [k2, v2]) => -v1.count+v2.count

  /**
   * 
   * @param {import('@storecraft/core/v-api').StatisticsEntity} o 
   * @param {typeof sortFn} sort 
   * 
   * @return {[string, import('@storecraft/core/v-api').StatisticsEntity][]}
   */
  const pickK = (o, sort) => {
    // convert o to array of kv tuples ->sort ->pick first K
    return Object.entries(o)
                  .sort(sort)
                  .slice(0, 10);
  }

  //
  const entries = {};
  entries.collections = pickK(reduced.collections, sortFn)
  entries.tags = pickK(reduced.tags, sortFn)
  entries.discounts = pickK(reduced.discounts, sortFn)
  entries.products = pickK(reduced.products, sortFn)

  return entries;
}



/**
 * 
 * @typedef {object} InnerHomeInfoCapsuleParams
 * @prop {string} label
 * @prop {string} value
 * 
 * @typedef {InnerHomeInfoCapsuleParams &
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } HomeInfoCapsuleParams
 * 
 * @param {HomeInfoCapsuleParams} params
 * 
 */
const InfoCapsule = (
  {
    label, value, ...rest
  }
) => {

  return (
<div className={`p-1 pl-2 px-1 rounded-full border shelf-border-color
               cursor-pointer max-w-full
               bg-kf-400 text-white 
               dark:bg-kf-800/20 
               w-fit h-fit 
               flex flex-row justify-between gap-3 text-sm shadow-lg
               hover:scale-105 transition-transform`} {...rest}>
  <span 
      children={label} 
      className='whitespace-nowrap max-w-max 
                --max-w-[5rem] overflow-x-auto' />        
  <div 
      children={value} 
      className='rounded-full bg-white 
              text-pink-500 px-2 font-semibold'/>
</div>        
  )
}

/**
 * @template V 
 * 
 * @typedef {(
 *  k: string, v: import('@storecraft/core/v-api').StatisticsEntity
 * ) => V} stat_entity_fn
 * 
 */

/**
 * 
 * @typedef {object} InnerHomeTopSoldCardParams
 * @prop {[string, import('@storecraft/core/v-api').StatisticsEntity][]} data
 * @prop {string} [label_prefix='']
 * @prop {string} [label='Top Sold']
 * @prop {stat_entity_fn<string>} linkFn
 * @prop {stat_entity_fn<number>} [valFn]
 * @prop {stat_entity_fn<string>} [labelFn]
 * 
 * @typedef {InnerHomeTopSoldCardParams &
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } HomeTopSoldCardParams
 * 
 * @param {HomeTopSoldCardParams} params
 * 
 */
const TopSoldCard = (
  { 
    data, label_prefix='', label='Top Sold', 
    linkFn, valFn=(k, v)=>v.count ?? 0, 
    labelFn=(k,v)=>v.title ?? k, ...rest 
  }
) => {

  console.log('topsold', data);

  return (
<Bling rounded='rounded-xl' stroke='p-[2px]'>
  <div className='w-56 h-52 
                shelf-plain-card-fill
                rounded-xl shadow-xl dark:shadow-xl px-3 pt-2
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
      <div className='w-full rounded-lg flex flex-row flex-wrap gap-1 py-3
                      flex-1 overflow-y-auto content-start'>
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
      <p className='w-full h-full flex flex-row items-center justify-center
                    --text-gray-300 text-3xl text-center font-semibold 
                    whitespace-pre-wrap text-transparent bg-clip-text 
                    bg-gradient-to-b from-gray-200 to-gray-500'
         children={`Not enough \ndata \n:-)`} />
    </ShowIf>
  </div>    
</Bling>
  )
}

/**
 * 
 * @typedef {object} InnerHomePerformanceParams
 * @prop {object} nada
 * 
 * @typedef {InnerHomePerformanceParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } HomePerformanceParams
 * 
 * @param {HomePerformanceParams} params
 * 
 */
const Performance = (
  { 
    ...rest 
  }
) => {

  const ref_effect_ran = useRef(false);
  /** 
   * @type {ReturnType<typeof useState<
   *  import('@storecraft/core/v-api').StatisticsType>
   * >} 
   */
  const [data, setData] = useState();
  const [span, setSpan] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  console.log('ddddddd', data);

  const load = useCallback(
    /**
     * @param {number} span 
     */
    async (span) => {
      setError(undefined);
      if(!data)
        setLoading(true);

      try {
        const new_data = await getSDK().statistics.get(
          Date.now() - span * DAY, Date.now()
        );
        // console.log('data ', data)
        setData(new_data);
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false);
      }
    }, [data]
  );
  
  /** @type {import('./home-time-frame.jsx').TimeFrameParams["onChange"]} */
  const onSpanChanged = useCallback(
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
    <div className='w-full h-fit p-10 border-4 border-dashed 
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
          className='w-full max-w-screen-md h-52 mt-5' /> 
      <HR className='my-5' />
      <div className='w-full h-fit flex flex-row justify-center 
                      lg:justify-start flex-wrap mt-5 gap-5'>
        <TopSoldCard 
            data={days_reduced?.products} 
            label='products' 
            labelFn={(k, v)=>v.title??k} 
            valFn={(k, v)=>v.count ?? 0} 
            linkFn={(k, v) => `/pages/products/${k}/edit`} />
        <TopSoldCard 
            data={days_reduced?.collections} 
            label='collections' 
            valFn={(k, v)=>v.count ?? 0} 
            linkFn={(k, v) => `/pages/collections/${k}/edit`}/>
        <TopSoldCard 
            data={days_reduced?.discounts} 
            label='discounts' 
            valFn={(k, v)=>v.count ?? 0} 
            linkFn={(k, v) => `/pages/discounts/${k}/edit`}/>
        <TopSoldCard 
            data={days_reduced?.tags} 
            label='tags' 
            valFn={(k, v)=>v.count ?? 0} 
            linkFn={(k, v) => `/pages/tags/${k.split('_')[0]}/edit`}/>
      </div>  
    </div>        
  </ShowIf>         
</div>
  )
}

export default Performance
