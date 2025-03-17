import { marked } from 'marked'

/**
 * @typedef {object} InternalMDViewParams
 * @prop {string} [value]
 * 
 * @typedef {InternalMDViewParams & 
 *  Omit<React.ComponentProps<'div'>, 'value'>
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
  <p className='--mdx md-view overflow-auto' 
    dangerouslySetInnerHTML={
      {
        __html : marked.parse(
          value ?? '', { 
            // @ts-ignore
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
