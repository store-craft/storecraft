import { forwardRef, useCallback } from 'react'
import { Overlay } from '@/comps/overlay.jsx';
import Gallery from './gallery.jsx'

const GallerySelect = forwardRef(
  /**
   * @typedef {import('./overlay.jsx').ImpInterface} ImpInterface
   * 
   * 
   * @typedef {object} GallerySelectParams
   * @prop {import('@storecraft/core/v-api').ApiQuery} [query_params]
   * @prop {(img: import('@storecraft/core/v-api').ImageType) => void} onSelect
   * 
   * @param {GallerySelectParams} params 
   * @param {*} ref 
   */
  (
    {
      query_params, onSelect, ...rest
    }, ref
  ) => {

  /** @type {import('./gallery.jsx').InnerGalleryParams["onClickImage"]} */
  const onSelectInternal = useCallback(
    (e, img) => { 
      if(onSelect===undefined)
        return

      // // steal the event from processing
      e.preventDefault()
      e.stopPropagation()

      // // console.log('img', img);
      ref.current.hide()
      onSelect(img)
    }, [onSelect]
  );

  return (
<Overlay ref={ref} >
  <div className='w-full h-full max-w-[60rem] px-5 py-10  '>
    <Gallery 
        useSearchParamsForQuery={false}
        query_params={query_params} 
        onClickImage={onSelectInternal}
        onClick={e => e.stopPropagation()}
        className='w-full h-full bg-slate-100 dark:bg-slate-700 border
                  shelf-border-color p-5 rounded-lg' />
  </div>           
</Overlay>
  )
})

export default GallerySelect
