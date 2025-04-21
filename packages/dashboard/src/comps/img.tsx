import { useStorecraft } from '@storecraft/sdk-react-hooks';
import React, { forwardRef, useEffect, useRef, useState } from 'react'

/**
 * `Img` wraps the regular `<img/>` tag and analyzes the `src`
 * url to decide: 
 * 
 * - If to use `storecraft` backend to fetch the image
 *   through a full download or signed urls.
 * - Fetch a regular `url`
 */
const Img = forwardRef(
  (
    { 
      src, ...rest 
    }: React.ComponentProps<'img'>, 
    ref: React.Ref<HTMLImageElement>
  ) => {

    const srcRef = useRef<React.ComponentProps<'img'>["src"]>(undefined);
    const [source, setSource] = useState<React.ComponentProps<'img'>["src"]>();
    const { sdk } = useStorecraft();

    // console.log(src)
    useEffect(
      () => {
        async function getSource() {
          const s = await sdk.storage.getSource(src)
          // console.log('s', s)
          srcRef.current = s
          setSource(s)
        }
        getSource();
        return () => {
          srcRef.current && URL.revokeObjectURL(srcRef.current)
        }
      }, [src]
    );

    return (
  <img {...rest} ref={ref} src={source} />    
    )
  }
)

export default Img