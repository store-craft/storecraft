import { marked } from 'marked'

/**
 * @typedef {object} InternalMDViewParams
 * @prop {string} [text]
 * 
 * @typedef {InternalMDViewParams & 
*  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
* } MDViewParams
* 
* @param {MDViewParams} param
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
