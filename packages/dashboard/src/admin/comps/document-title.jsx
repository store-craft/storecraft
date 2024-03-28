import { useMemo } from "react"

const getClass = (ix) => {
  if(ix==0)
    return 'text-4xl text-black dark:text-gray-300'
  if(ix%2==0)
    return 'text-3xl text-black dark:text-gray-300'
  else if(ix%2==1)
    return 'text-3xl text-gray-500 tracking-wide'
}

const DocumentTitle = 

  ({ major=[], delimiter=' / ', className, ...rest }) => {

  return (
<div className={`scrollbar-none break-words ${className}`} {...rest}>
  {
    major.map(
      (s, ix) => {
        return (
        <span key={ix}>
          <span children={s} 
                className={getClass(ix)} 
                /> 
          {
            (ix<major.length-1) &&
            (<span children={delimiter} 
        className='text-4xl text-pink-400 text-pink-400/50 break-inside-avoid' /> )
          }
        </span>
        )
      }
    )
  }
  
</div>    
  )
}
  
export default DocumentTitle