import { BottomActions } from '@/comps/collection-actions.jsx'
import { Bling } from '@/comps/common-ui.jsx'
import ShowIf from '@/comps/show-if.jsx'
import ImageGrid from './gallery-image-grid.jsx'
import SearchBar from './gallery-searchbar.jsx'
import useCollectionsActions from '@/hooks/use-collections-actions.js'

/**
 * A `gallery` component. if contstrained on height, then image-grid
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
 * @prop {import('@storecraft/core/api').ApiQuery
 * } [query_params={}] { vql: '', limit: 5}
 * @prop {(
 *  e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, 
 *  data: import('@storecraft/core/api').ImageType
 * ) => void} [onClickImage]
 * @prop {boolean} [useSearchParamsForQuery=true] Use url navigation
 * to paginate through search params, as opposed to in-memory. This
 * is suited for pages, the later for individual components.
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
    query_params={}, onClickImage, 
    useSearchParamsForQuery=true, className, ...rest 
  }
) => {

// /**
//   * @type {import('@/hooks/use-collections-actions.js').HookReturnType<
//   *  import('@storecraft/core/api').ImageType>
//   * }
//   */
  const { 
    query_api, context, ref_actions, 
    page, pages, loading, 
    error, queryCount,
    actions: {
      onLimitChange, onReload, prev, next 
    }
  } = useCollectionsActions('images', '/apps/gallery');

  return (
<div className={`flex flex-col justify-between ${className}`} {...rest} >
  <Bling rounded='rounded-md' 
         className='shadow-md w-full h-fit' >
    <SearchBar 
        ref={ref_actions} 
        count={queryCount}
        reload={() => onReload(useSearchParamsForQuery)}
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
        rounded='rounded-md' 
        className='mt-5 shadow-md w-full h-fit' >
      <BottomActions 
          prev={() => prev(useSearchParamsForQuery)} 
          next={() => next(useSearchParamsForQuery)} 
          limit={query_api?.limit ?? 5}
          onLimitChange={l => onLimitChange(l, useSearchParamsForQuery)} 
          className='rounded-md shelf-card' />
    </Bling>             
  </ShowIf>              
</div>
  )    
}

export default Gallery