import { useRef } from 'react';
import Gallery from './gallery'
import GallerySelect from './gallery-select';
import { ResourceTitle } from '@/comps/resource-title';

export default ({}) => {
  
  const ref_gallery = useRef(undefined);

  return (
<div className='w-full h-full'>
  <ResourceTitle 
    overallCollectionCount={undefined} 
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
