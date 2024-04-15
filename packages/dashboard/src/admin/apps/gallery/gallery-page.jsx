import { useRef } from 'react';
import Gallery from './gallery.jsx'
import GallerySelect from './gallery-select.jsx';
import { Title } from '@/admin/comps/common-ui.jsx';

export default ({}) => {
  
  const ref_gallery = useRef();

  return (
<div className='w-full h-full'>
  <Title 
      children={`Gallery`} 
      className='mb-5 text-3xl' /> 
  <GallerySelect 
      ref={ref_gallery} 
      onSelect={console.log}  />
  <Gallery 
      className='w-full mt-5 ' />              
</div>
  )    
}
