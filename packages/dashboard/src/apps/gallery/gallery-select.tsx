import React, { forwardRef, useCallback } from 'react'
import { ImpInterface, Overlay } from '@/comps/overlay.jsx';
import Gallery, { InnerGalleryParams } from './gallery.jsx'
import { ApiQuery, ImageType } from '@storecraft/core/api';

export type GallerySelectParams = {
  query_params?: ApiQuery;
  onSelect: (img: ImageType) => void;
};


const GallerySelect = forwardRef(
  (
    {
      query_params, onSelect, ...rest
    }: GallerySelectParams, 
    ref: React.RefObject<ImpInterface>
  ) => {

  const onSelectInternal: InnerGalleryParams["onClickImage"] = useCallback(
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
                shelf-border-color p-5 rounded-lg' 
    />
  </div>           
</Overlay>
  )
})

export default GallerySelect
