import { forwardRef, useCallback } from 'react'
import { Overlay } from '@/admin/comps/overlay.jsx';
import Gallery from './gallery.jsx'

const QP = {}
const GallerySelect = forwardRef(
  ({query_params=QP, onSelect, ...rest}, ref) => {

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
  )

  return (
<Overlay ref={ref} >
  <div className='w-full h-full max-w-[60rem] px-5 py-10  '>
    <Gallery query_params={query_params} 
             onClickImage={onSelectInternal}
             onClick={e => e.stopPropagation()}
             className='w-full h-full bg-slate-100 dark:bg-slate-700 border
                        shelf-border-color p-5 rounded-lg' />
  </div>           
</Overlay>
  )
})

export default GallerySelect
