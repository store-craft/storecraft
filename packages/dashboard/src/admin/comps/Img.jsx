import { forwardRef, useEffect, useRef, useState } from 'react'
import { getSDK } from '@/admin-sdk/index.js'

const Img = forwardRef(

  /**
   * `Img` wraps the regular `<img/>` tag and analyzes the `src`
   * url to decide: 
   * - If to use `storecraft` backend to fetch the image
   *   through a full download or signed urls.
   * - Fetch a regular `url`
   * 
   * @typedef { React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
   * } ImgParams
   * 
   * @param {ImgParams} params
   * @param {*} ref 
   * 
   */
  (
    { 
      src, ...rest 
    }, ref
  ) => {

    const srcRef = useRef()
    const [source, setSource] = useState()
    // console.log(src)
    useEffect(
      () => {
        async function getSource() {
          const s = await getSDK().storage.getSource(src)
          // console.log('s', s)
          srcRef.current = s
          setSource(s)
        }
        getSource()
        return () => {
          srcRef.current && URL.revokeObjectURL(srcRef.current)
        }
      }, [src]
    )

    return (
  <img {...rest} ref={ref} src={source} />    
    )
  }
)

export default Img