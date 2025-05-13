import { useMemo } from 'react'
import Markdown, { MarkdownToJSX } from 'markdown-to-jsx'
import { LoadingImage } from './loading-image'
import { pubsub } from '@/hooks/use-chat'

const onClick = (value: string) => {
  pubsub.dispatch({
    event: 'request-retry', 
    payload: {
      prompt: [{
        type: 'text', 
        content: `I would like to know more about ${value}`
      }]
    }
  })
}

const options: MarkdownToJSX.Options = {
  overrides: {
    img: {
      component: (props) => <LoadingImage {...props}  />,
      props: {
        className: 'h-40 w-full rounded-lg border chat-border-overlay',
      },
    },
    price: {
      component: (props) => <span {...props}  />,
      props: {
        className: 'rounded-full text-lime-600 dark:text-lime-400 font-mono \
        font-bold w-fit py-0 px-1 border chat-border-overlay \
        bg-slate-50 dark:bg-lime-900 ',
      },
    },
    product: {
      component: ({children, ...rest}) => (
        <span 
          children={'🛍️ ' + children} 
          onClick={() => onClick(children as string)}
          {...rest}  
        />
      ),
      props: {
        className: 'underline underline-offset-4 decoration-dotted \
        rounded-full --font-mono \
        chat-bg-overlay cursor-pointer \
        font-bold w-fit py-0.5 px-1 border chat-border-overlay \
         ',
      },
    },    
    collection: {
      component: ({children, ...rest}) => (
        <span 
          children={'🗂️ ' + children} 
          onClick={() => onClick(children as string)}
          {...rest}  
        />
      ),
      props: {
        className: 'underline underline-offset-4 decoration-dotted \
        rounded-full --font-mono \
        chat-bg-overlay cursor-pointer \
        font-bold w-fit py-0.5 px-1 border chat-border-overlay \
         ',
      },
    },      
    discount: {
      component: ({children, ...rest}) => (
        <span 
          children={'🏷️ ' + children} 
          onClick={() => onClick(children as string)}
          {...rest}  
        />
      ),
      props: {
        className: 'underline underline-offset-4 decoration-dotted \
        rounded-full --font-mono \
        chat-bg-overlay cursor-pointer \
        font-bold w-fit py-0.5 px-1 border chat-border-overlay \
         ',
      },
    },      
    shipping: {
      component: ({children, ...rest}) => (
        <span 
          children={'🚚 ' + children} 
          onClick={() => onClick(children as string)}
          {...rest}  
        />
      ),
      props: {
        className: 'underline underline-offset-4 decoration-dotted \
        rounded-full --font-mono \
        chat-bg-overlay cursor-pointer \
        font-bold w-fit py-0.5 px-1 border chat-border-overlay \
         ',
      },
    },        
  }
}
// 🏷️
export type MDViewParams = {
  /**
   * @description The markdown content to be rendered
   */
  value?: string,
} & Omit<React.ComponentProps<'div'>, 'value'>;

export const MDView = (
  {
    value, ...rest
  }: MDViewParams
) => {
  const Comp = useMemo(
    () => (
      <div {...rest} cclassName='dased' >
        <Markdown
          options={options}
          children={value}/>
      </div>
    ), [value, rest.className]
  );

  return Comp;
}
