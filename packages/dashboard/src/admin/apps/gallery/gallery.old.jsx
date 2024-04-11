import { useCallback, useEffect, useRef, useState } from 'react'
import { useCommonCollection } from '@/shelf-cms-react-hooks/index.js'
import { BottomActions } from '@/admin/comps/collection-actions.jsx'
import { Bling } from '@/admin/comps/common-ui.jsx'
import ShowIf from '@/admin/comps/show-if.jsx'
import ImageGrid from './gallery-image-grid.jsx'
import SearchBar from './gallery-searchbar.jsx'

/**
 * A gallery component. if contstrained on height, then image-grid
 * will be scrollable
 * 
 * Two modes of retrieving search:
 * 1. onSearchUpdate=undefined will cause the comp to internally 
 *    fetch data when user searches data
 * 2. onSearchUpdate!=undefined will cause the comp to delegate 
 *    the search params outside, where you can redirect again, 
 *    this is useful for re-routing of all kinds
 * 
 * 
 * @typedef {object} InnerGalleryParams
 * @prop {Object} query_params { search: '', limit: 5}
 * @prop {(search: string) => void} [onSearchUpdate] a Function, 
 * that gets called when user searches
 * @prop {(
 *  e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, 
 *  data: import('@storecraft/core/v-api').ImageType
 * ) => void} [onClickImage]
 * @prop {(q: import('@storecraft/core/v-api').ApiQuery) => void} [onNavUpdate]
 * 
 * 
 * @param {InnerGalleryParams &
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 * 
 * 
 */
const Gallery = (
  { 
    query_params, onSearchUpdate, onClickImage, 
    onNavUpdate, className, ...rest 
  }
) => {

  /** @type {React.MutableRefObject<import('./gallery-searchbar.jsx').ImpInterface>} */
  const ref_actions = useRef();
  const [query_params_o, setQP] = useState(query_params);

  /** 
   * @type {import('@/shelf-cms-react-hooks/useCollection.js').HookReturnType<
   *  import('@storecraft/core/v-api').ImageType>
   * } 
   */
  const { 
    pages, page, loading, error, 
    query, queryCount 
  } = useCommonCollection('images', false);

  const ref_use_cache = useRef(true);

  useEffect(
    () => {
      setQP(query_params)
    }, [query_params]
  );
  
  useEffect(
    () => {
      ref_actions.current.setSearch(
        query_params_o.search ?? ''
      )

      query(query_params_o, ref_use_cache.current)
    }, [query_params_o, query]
  );

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
  );
  
  const onLimitChange = useCallback(
    /** @param {number} limit  */
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
  );

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
  );

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
  );
  
  return (
<div className={`flex flex-col justify-between ${className}`} {...rest} >
  <Bling stroke='p-[1px]' rounded='rounded-md' 
         className='shadow-md w-full h-fit' >
    <SearchBar 
        ref={ref_actions} 
        count={queryCount}
        reload={onReload}
        className='shelf-card rounded-md' 
        searchTitle='search by used products/collections/tags'
        isLoading={loading}/>
  </Bling>             
  <ImageGrid 
      images={page} 
      className='mt-5 w-full --h-fit flex-1' 
      onClickImage={onClickImage} />   
  <ShowIf show={pages?.length} >
    <Bling 
        stroke='p-[1px]' 
        rounded='rounded-md' 
        className='mt-5 shadow-md w-full h-fit' >
      <BottomActions 
          prev={prev} next={next} 
          limit={query_params_o?.limit ?? 5}
          onLimitChange={onLimitChange} 
          className='rounded-md shelf-card' />
    </Bling>             
  </ShowIf>              
</div>
  )    
}

export default Gallery