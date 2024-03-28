import { useCallback, useEffect, useRef, useState } from 'react'
import { useCommonCollection } from '../../../shelf-cms-react-hooks'
import { BottomActions } from '../../comps/collection-actions'
import { Bling } from '../../comps/common-ui'
import ShowIf from '../../comps/show-if'
import ImageGrid from './gallery-image-grid'
import SearchBar from './gallery-searchbar'

const img_test = [
  "91iHBLGTsIL._SL1500_.jpg",
  {
    "usage": [
        "products/jax-and-daxter-093384"
    ],
    "updatedAt": 1675951280187,
    "url": "https://images-na.ssl-images-amazon.com/images/I/91iHBLGTsIL._SL1500_.jpg",
    "name": "91iHBLGTsIL._SL1500_.jpg",
    "search": [
        "jax-and-daxter-093384",
        "jax and daxter 2",
        "jax",
        "and",
        "daxter",
        "2",
        "ps2",
        "cib",
        "action",
        "wewe",
        "sds"
    ],
    "handle": "91iHBLGTsIL._SL1500_.jpg"
  }
]

const imgs = Array.from({length: 25}, (v, k) => img_test)

/**
 * A gallery component. if contstrained on height, then image-grid
 * will be scrollable
 * 
 * Two modes of retrieving search:
 * 1. onSearchUpdate=undefined will cause the comp to internally fetch data when
 *    user searches data
 * 2. onSearchUpdate!=undefined will cause the comp to delegate the search params outside,
 *    where you can redirect again, this is useful for re-routing of all kinds
 * 
 * @param {Object} query_params { search: '', limit: 5}
 * @param {Function} onSearchUpdate a Function, that gets called when user searches
 * @param {Function} onClickImage a callback when image is clicked
 * @returns 
 */
const Gallery = ({ className, query_params, onSearchUpdate, 
                   onClickImage, onNavUpdate,
                   ...rest }) => {

  const ref_actions = useRef()
  const [query_params_o, setQP] = useState(query_params)
  const { 
    pages, page, loading, error, 
    query, queryCount 
  } = useCommonCollection('images', false)
  const ref_use_cache = useRef(true)
  useEffect(
    () => {
      setQP(query_params)
    }, [query_params]
  )
  useEffect(
    () => {
      ref_actions.current.setSearch(
        query_params_o.search ?? ''
      )

      query(query_params_o, ref_use_cache.current)
    }, [query_params_o, query]
  )
  const onReload = useCallback(
    () => {
      const { 
        endBeforeId, startAfterId, startAtId, 
        endAtId, ...rest } = query_params_o
      const search = ref_actions.current.getSearch()
      const qp = {
        ...rest, 
        search
      }

      ref_use_cache.current = false

      if(onNavUpdate) {
        onNavUpdate(qp)
        return
      }

      setQP(qp)
    }, [onNavUpdate, query_params_o]
  )
  const onLimitChange = useCallback(
    (limit) => {
      const { 
        endBeforeId, startAfterId, startAtId, 
        endAtId, ...rest } = query_params_o
      const new_id = page?.at(0)?.[0]
      const qp = {
        ...rest, limit, startAtId: new_id
      }

      if(onNavUpdate) {
        onNavUpdate(qp)
        return
      }

      setQP(qp)
    }, [onNavUpdate, query_params_o, page]
  )
  const next = useCallback(
    async () => {
      const { 
        endBeforeId, startAfterId, startAtId, 
        endAtId, ...rest } = query_params_o
      const new_id = page?.at(-1)?.[0]
      const qp = {
        ...rest,
        startAfterId: new_id
      }

      if(onNavUpdate) {
        onNavUpdate(qp)
        return
      }

      setQP(qp)
    }, [onNavUpdate, page, query_params_o]
  )
  const prev = useCallback(
    async () => {
      const { 
        endBeforeId, startAfterId, startAtId, 
        endAtId, ...rest } = query_params_o
      const new_id = page?.at(0)?.[0]
      const qp = {
        ...rest,
        endBeforeId: new_id
      }

      if(onNavUpdate) {
        onNavUpdate(qp)
        return
      }

      setQP(qp)
    }, [onNavUpdate, page, query_params_o]
  )

  
  return (
<div className={`flex flex-col justify-between ${className}`} {...rest} >
  <Bling stroke='p-[1px]' rounded='rounded-md' 
         className='shadow-md w-full h-fit' >
    <SearchBar ref={ref_actions} 
             count={queryCount}
             reload={onReload}
             className='shelf-card rounded-md' 
             searchTitle='search by used products/collections/tags'
             isLoading={loading}/>
  </Bling>             
  <ImageGrid images={page} className='mt-5 w-full --h-fit flex-1' 
             onClickImage={onClickImage} />   
  <ShowIf show={pages?.length} >
    <Bling stroke='p-[1px]' rounded='rounded-md' 
           className='mt-5 shadow-md w-full h-fit' >
      <BottomActions prev={prev} next={next} 
                     limit={query_params_o?.limit ?? 5}
                     onLimitChange={onLimitChange} 
                     className='rounded-md shelf-card' />
    </Bling>             
  </ShowIf>              
</div>
  )    
}

export default Gallery