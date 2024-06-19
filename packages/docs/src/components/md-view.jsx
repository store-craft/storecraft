import { marked } from 'marked'

/**
 * @typedef {object} InternalMDViewParams
 * @prop {string} [value]
 * 
 * @typedef {InternalMDViewParams & 
 *  Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'value'>
 * } MDViewParams
 * 
 * @param {MDViewParams} param
 */
export const MDView = (
  {
    value, ...rest
  }
) => {
  
  return (
<div {...rest}>
  <p 
    dangerouslySetInnerHTML={
      {
        __html : marked.parse(
          value ?? '', { 
            mangle: false, 
            headerIds: false, 
            sanitize:false
          }
        )
      }
    }
  />     
</div>    
  )
}

