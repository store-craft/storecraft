import { useCallback, useEffect, useMemo, 
         useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSDK } from '@/admin-sdk/index.js'
import { Bling, HR } from './common-ui.jsx'
import SalesChart from './home-sales-chart.jsx'
import TimeFrame from './home-time-frame.jsx'
import ShowIf from './show-if.jsx'
import { SpaceShip, WhiteSpace } from './symbols.jsx'
import { BiTrendingUp } from 'react-icons/bi/index.js'

const DAY = 86400000

/**
 * Compute top-K over latest span of time from the server stats
 * @param {*} data server stats
 * @param {number} span up to 90 days from now
 * @returns 
 */
const compute_top_k_stats = 
  (data, span) => {
    if(data===undefined) return undefined

    const reduced = Object.entries(data.info.days)
          .filter(([day, v]) => ((parseInt(day)-data.fromDay)/DAY)>90-span)
          .reduce(
      (p, c) => {
        const [day, { products, tags, collections, discounts}] = c
        
        Object.entries(tags).forEach(
          ([k, v]) => {
            p.tags[k] = (p.tags[k] ?? 0) + v
          }
        )
        Object.entries(collections).forEach(
          ([k, v]) => {
            p.collections[k] = (p.collections[k] ?? 0) + v
          }
        )
        Object.entries(discounts).forEach(
          ([k, v]) => {
            p.discounts[k] = (p.discounts[k] ?? 0) + v
          }
        )
        Object.entries(products).forEach(
          ([k, v]) => {
            p.products[k] = {
              ...p.products[k], 
              val: (p.products[k]?.val ?? 0) + v.val,
              title: v.title
            }
          }
        )
        return p
      }, {
        tags: {},
        products: {},
        collections: {},
        discounts: {},
      }
    )

    //
    // console.log('reduced ', reduced)

    const sortP = ([k1, v1], [k2, v2]) => -v1.val+v2.val
    const sortA = ([k1, v1], [k2, v2]) => -v1+v2
    const pickK = (o, sort) => {
      // convert o to array of kv tuples ->sort ->pick first K
      return Object.entries(o)
                   .sort(sort)
                   .slice(0, 10)
    }

    //
    reduced.collections = pickK(reduced.collections, sortA)
    reduced.tags = pickK(reduced.tags, sortA)
    reduced.discounts = pickK(reduced.discounts, sortA)
    reduced.products = pickK(reduced.products, sortP)

    return reduced
  }

const InfoCapsule = ({label, value, ...rest}) => {

  return (
<div className={`p-1 pl-2 px-1 rounded-full border shelf-border-color
               cursor-pointer max-w-full
               bg-kf-400 text-white 
               dark:bg-kf-800/20 
               w-fit h-fit 
               flex flex-row justify-between gap-3 text-sm shadow-lg
               hover:scale-105 transition-transform`} {...rest}>
  <span children={label} 
        className='whitespace-nowrap max-w-max --max-w-[5rem] overflow-x-auto' />        
  <div children={value} 
       className='rounded-full bg-white 
                text-pink-500 px-2 font-semibold'/>
</div>        
  )
}

const TopSoldCard = ({ data, label_prefix = '', label='Top Sold', linkFn,
                       valFn=(k, v)=>v, labelFn=(k,v)=>k, 
                       ...rest }) => {

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
      <div children={label} 
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
        data.map(([k, v], ix) => (
          <Link key={k} to={linkFn(k, v)} draggable='false' className='w-full'>
            <InfoCapsule label={labelFn(k, v)} 
                      value={valFn(k, v)} />
          </Link>                     
        ))
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

const Performance = ({ ...rest }) => {
  const ref_effect_ran = useRef(false)
  const [data, setData] = useState(undefined)
  const [span, setSpan] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()

  const load = useCallback(
    async () => {
      setError(undefined)
      setLoading(true)  
      try {
        const data = await getSDK().stats.loadOrdersStats()
        // console.log('data ', data)
        setData(data)
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)  
      }
    }, []
  )
  
  const onSpanChanged = useCallback(
    (v) => {
      setSpan(v)
      if(!data)
        load(v)
    },
    [load, data],
  )
  
  useEffect(
    () => {
      if(ref_effect_ran.current)
        return
      ref_effect_ran.current = true
      onSpanChanged(span)
    }, [onSpanChanged, span]
  )

  const days_reduced = useMemo(
    () => {
      if(data===undefined) 
        return undefined
      return compute_top_k_stats(data, span)
    }, [data, span]
  )

  const msg = loading ? 'Loading ...' : 
              error ? String(error) : 
              data===undefined ? 'Not enough data...' :
              undefined
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
      <TimeFrame onChange={onSpanChanged} span={span} />
      <SalesChart data={data} span={span}
          className='w-full max-w-screen-md h-52 mt-5' /> 
      <HR className='my-5' />
      <div className='w-full h-fit flex flex-row justify-center 
                      lg:justify-start flex-wrap mt-5 gap-5'>
        <TopSoldCard data={days_reduced?.products} 
                     label='products' 
                     labelFn={(k, v)=>v.title??k} 
                     valFn={(k, v)=>v.val} 
                     linkFn={(k, v) => `/pages/products/${k}/edit`} />
        <TopSoldCard data={days_reduced?.collections} 
                     label='collections' 
                     linkFn={(k, v) => `/pages/collections/${k}/edit`}/>
        <TopSoldCard data={days_reduced?.discounts} 
                     label='discounts' 
                     linkFn={(k, v) => `/pages/discounts/${k}/edit`}/>
        <TopSoldCard data={days_reduced?.tags} 
                     label='tags' 
                     linkFn={(k, v) => `/pages/tags/${k.split('_')[0]}/edit`}/>
      </div>  
    </div>        
  </ShowIf>         
</div>
  )
}

export default Performance
