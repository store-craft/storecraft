import { marked } from 'marked'

export type MDViewParams = {
  value?: string;
} & Omit<React.ComponentProps<'div'>, "value">;

const MDView = (
  {
    value, ...rest
  }: MDViewParams
) => {
  
  return (
<div {...rest}>
  <p className='--mdx md-view overflow-auto' 
    dangerouslySetInnerHTML={
      {
        __html : marked.parse(
          value ?? '', { 
          }
        )
      }
    }
  />     
</div>    
  )
}

export default MDView
