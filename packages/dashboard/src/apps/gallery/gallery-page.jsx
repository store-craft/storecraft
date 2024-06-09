import { useRef } from 'react';
import Gallery from './gallery.jsx'
import GallerySelect from './gallery-select.jsx';
import { Title } from '@/comps/common-ui.jsx';
import { ResourceTitle } from '@/comps/resource-title.jsx';

export default ({}) => {
  
  const ref_gallery = useRef();

  return (
<div className='w-full h-full'>
  <ResourceTitle 
      count={undefined} 
      hasLoaded={true} 
      resource={'Gallery'}/>
  <GallerySelect 
      ref={ref_gallery} 
      onSelect={console.log}  />
  <Gallery 
      className='w-full mt-5 ' />              
</div>
  )    
}
