import ShowIf from '@/comps/show-if.jsx'
import { RecordActions, Span } from '@/comps/common-fields.jsx'
import useCollectionsActions from '../hooks/useCollectionsActions.js'
import { useMemo } from 'react'
import { TableSchemaView } from '../comps/table-schema-view.jsx'
import { ResourceTitle } from '../comps/resource-title.jsx'

/**
 * 
 * @typedef {import('@storecraft/core/v-api').PaymentGatewayItemGet} PaymentGatewayItemGet
 * 
 */

/**
 * This is used in `TableSchemaView`
 * 
 * @typedef {object} InternalSpanWithLogoParams
 * @prop {string} [className]
 * @prop {string} [extra]
 * @prop {React.ReactNode} [children]
 * 
 * @typedef {import('../comps/table-schema-view.jsx').TableSchemaViewComponentParams<
 *  string, PaymentGatewayItemGet> & 
*   InternalSpanWithLogoParams & 
*   React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
* } SpanWithLogoParams
* 
* @param {SpanWithLogoParams} param
*/
export const SpanWithLogo = (
  {
    value, children, className, context,
    extra='max-w-[8rem] md:max-w-[18rem]', ...rest
  }
) => {
  const logo = context.item.info.logo_url;

  const readable_span_cls = 'overflow-x-auto flex flex-row items-center \
    gap-2 inline-block whitespace-nowrap'
  const merged = `${readable_span_cls} ${className} ${extra}`
  return (
    <div className={merged} {...rest} >
      {
        logo &&
        <img src={context?.item?.info?.logo_url} 
            className='rounded-md w-6 h-6 object-cover border dark:opacity-80' />
      }
      
      <div children={value ?? children} />
    </div>
  )
}

/**
 * @type {import('../comps/table-schema-view.jsx').TableSchemaViewField<
 *  import('@storecraft/core/v-api').PaymentGatewayItemGet, any, any
 * >[]}
 */
const schema_fields = [
  { 
    key: 'info.name', name: 'Name', comp: SpanWithLogo, 
    comp_params: {
      className: 'font-semibold', 
      extra: 'max-w-[10rem] md:max-w-[18rem]'
    } 
  },
  { 
    key: 'handle', name: 'Handle', comp: Span, 
    comp_params: {
      className: 'font-semibold', 
      extra: 'max-w-[10rem] md:max-w-[18rem]'
    } 
  },
  { 
    key: undefined, name: 'Actions', 
    comp: RecordActions, comp_params: { className: '' } 
  },
]

export default ({}) => {

  /**
   * @type {import('../hooks/useCollectionsActions.js').HookReturnType<
   *  PaymentGatewayItemGet>
   * }
   */ 
  const { 
    context, page, loading, 
    error, queryCount, hasLoaded, resource,
    resource_is_probably_empty
  } = useCollectionsActions('payments/gateways', '/pages/payment-gateways');
  const context_mod = useMemo(
    () => {
      const { viewDocumentUrl } = context;
      
      return {
        viewDocumentUrl
      }
    }, [context]
  );

  return (
<div className='h-full w-full'>
  <div className='max-w-[56rem] mx-auto'>
    <ShowIf show={!error}>
      <ResourceTitle 
        should_onboard={resource_is_probably_empty}
        overallColelctionCount={queryCount} 
        hasLoaded={hasLoaded} 
        resource={resource}/>
    </ShowIf>
    
    <ShowIf show={error} children={error?.toString()}/>
    <div className='w-full rounded-md overflow-hidden border 
                    shelf-border-color shadow-md mt-5
                    dark:shadow-slate-900'>      
      <ShowIf show={!error && page?.length}>
          <TableSchemaView 
              context={context_mod} 
              data={page} 
              fields={schema_fields} />
      </ShowIf>
    </div>    
  </div>
</div>
  )
}
