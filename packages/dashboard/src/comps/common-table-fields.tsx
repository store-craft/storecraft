import { LinkWithState } from '@/hooks/use-navigate-with-state.jsx'
import { TableSchemaViewComponentParams } from './table-schema-view';

/**
 * This is used in `TableSchemaView`
 */
export type SpanParams<T extends unknown = any> = 
  TableSchemaViewComponentParams<string, T> & {
    className?: string;
    extra?: string;
    /**
     * create a `url`
     */
    url_fn: (item: T) => string;
    /**
     * get current navigatio `state`
     */
    get_state: () => any;
    children?: React.ReactNode;
  } & React.ComponentProps<'p'>

export const SimpleLink = <T,>(
  {
    context, value, children, className, 
    extra='max-w-[8rem] md:max-w-[12rem]', 
    url_fn, 
    get_state,
    ...rest
  }: SpanParams<T>
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
