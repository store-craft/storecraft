import { marked } from 'marked';

export type MDViewParams = {
  value?: string
} & Omit<React.ComponentProps<'div'>, 'value'>

export const MDView = (
  {
    value, ...rest
  } : MDViewParams
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

