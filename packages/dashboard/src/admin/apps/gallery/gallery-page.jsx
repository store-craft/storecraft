import { useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import Gallery from './gallery'
import GallerySelect from './gallery-select';
import { o2q, q2o } from './utils';
import { Title } from '../../comps/common-ui';

export default ({}) => {
  const { query_params } = useParams()
  const nav = useNavigate()

  const onNavUpdate = useCallback(
    (qo) => {
      nav(`/apps/gallery/q/${o2q(qo)}`)
    },
    [nav],
  )
  
  const ref_gallery = useRef()
  return (
<div className='w-full h-full'>
  <Title children={`Gallery`} 
                    className='mb-5 text-3xl' /> 
  <GallerySelect ref={ref_gallery} onSelect={console.log}  />
  <Gallery query_params={q2o(query_params, { limit: 5 })} 
           onNavUpdate={onNavUpdate}
           className='w-full mt-5 ' />              
</div>
  )    
}
