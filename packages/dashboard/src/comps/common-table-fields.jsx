import { LinkWithState } from '@/hooks/use-navigate-with-state.jsx'


/**
 * This is used in `TableSchemaView`
 * 
 * @template {any} T
 * 
 * @typedef {object} InternalSpanParams
 * @prop {string} [className]
 * @prop {string} [extra]
 * @prop {(item: T) => string} url_fn create a `url`
 * @prop {() => any} get_state get current navigatio `state` 
 * @prop {React.ReactNode} [children]
 */ 

/** 
 * @template {any} [T=any] item `type`
 * 
 * @typedef {import('./table-schema-view.jsx').TableSchemaViewComponentParams<string, T> & 
 *   InternalSpanParams<T> & 
 *   React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
 * } SpanParams
 * 
 * @param {SpanParams} param
 */
export const SimpleLink = (
  {
    context, value, children, className, 
    extra='max-w-[8rem] md:max-w-[12rem]', 
    url_fn, get_state,
    ...rest
  }
) => {

  // console.log('context', context)

  const readable_span_cls = 'overflow-x-auto inline-block whitespace-nowrap shelf-text-label-color'
  const merged = `${readable_span_cls} ${className} ${extra}`
  
  return (
    <div className={merged} {...rest} >
      <LinkWithState 
          current_state={get_state}
          children={value ?? children} 
          to={url_fn?.(context.item)} 
          className='underline'/>
    </div>
  )
}
