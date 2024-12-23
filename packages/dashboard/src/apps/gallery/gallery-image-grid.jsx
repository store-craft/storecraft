import { Link } from 'react-router-dom'
import Img from '@/comps/img.jsx'


/**
 * @typedef {object} InternalImageParams
 * @prop {import('@storecraft/core/api').ImageType} data
 * @prop {(
 *  e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, 
 *  data: import('@storecraft/core/api').ImageType
 * ) => void} onClickImage
 * @prop {string} [className]
 * 
 * @typedef {InternalImageParams & 
*  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
* } ImageParams
* 
* @param {ImageParams} params
*/
export const Image = (
  { 
    data, onClickImage=()=>{}, className, ...rest 
  }
) => {

    const { url, handle } = data

    return (
  <div className={`inline-block w-24 h-fit 
                   --pb-2 sm:w-40 shadow-sm group transition-colors duration-300
                   rounded-lg overflow-hidden ${className}`}
                   {...rest}>
    <Link to={`/apps/gallery/img/${handle}`} 
          draggable='false'
          onClick={e => onClickImage(e, data)} >
      <div className='w-full h-24 sm:h-40 relative rounded-md overflow-hidden'>
        <Img 
            src={url} 
            crossOrigin='anonymous'
            draggable='false'
            className='object-cover w-[99%] mx-auto h-full -opacity-20 
                       group-hover:opacity-100 transition-opacity duration-300 
                       ease-linear' />
      </div>
    </Link>
    <div className='mx-px --my-2'>
      <input 
          value={url} readOnly
          className='w-full p-1 mt-0 whitespace-pre break-words 
                     border bg-gray-200 text-gray-600 rounded-b-md'/>
    </div>
  </div>
      )
  }
  
  /**
   * @typedef {object} InternalImageGridParams
   * @prop {import('@storecraft/core/api').ImageType[]} images
   * @prop {(
   *  e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, 
   *  data: import('@storecraft/core/api').ImageType
   * ) => void} onClickImage
   * @prop {string} [className]
   * 
   * @typedef {InternalImageGridParams & 
   *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
   * } ImageGridParams
   * 
   * @param {ImageGridParams} params
   */
  const ImageGrid = (
    {
      images, onClickImage, className, ...rest
    }
  ) => {
  
    return (
<div className={`${className} overflow-y-auto`} {...rest}>
  <div className={`w-fit flex flex-row flex-wrap gap-10 --mx-10 
                   place-content-center --justify-items-center --justify-center mx-auto `} >
  {
    images.map(
      (it, ix) => (
        <Image 
            data={it} 
            key={it.handle} 
            onClickImage={onClickImage} />
      )
    )
  }
  </div>    
  </div>    
    )
  }
  
  export default ImageGrid