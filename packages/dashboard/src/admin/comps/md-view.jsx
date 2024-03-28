import { marked } from 'marked'

/**
 * 
 * @param {object} param0 
 * @param {string} param0.text
 */
const MDView = ({text, ...rest}) => {
  return (
<div {...rest}>
  <p className='md-view' 
    dangerouslySetInnerHTML={
      {
        __html : marked.parse(
          text ?? '', { 
            mangle: false, headerIds: false, 
            sanitize:false
          }
        )
      }
    }
  />     
</div>    
  )
}

export default MDView
