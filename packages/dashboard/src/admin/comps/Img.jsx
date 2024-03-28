import { forwardRef, useEffect, useRef, useState } from 'react'
import { getShelf } from '../../admin-sdk'

const Img = forwardRef(
  ({ src, ...rest }, ref) => {
    const srcRef = useRef()
    const [source, setSource] = useState()
    // console.log(src)
    useEffect(
      () => {
        async function getSource() {
          const s = await getShelf().storage.getSource(src)
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