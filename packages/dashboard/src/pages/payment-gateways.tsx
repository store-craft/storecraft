import ShowIf from '@/comps/show-if'
import { RecordActions, Span } from '@/comps/common-fields'
import useCollectionsActions from '../hooks/use-collections-actions'
import { useMemo } from 'react'
import { TableSchemaView, TableSchemaViewComponentParams, TableSchemaViewField } from '../comps/table-schema-view'
import { ResourceTitle } from '../comps/resource-title'
import svg from '@/comps/favicon.svg';
import { PaymentGatewayItemGet } from '@storecraft/core/api'


export type SpanWithLogoParams = TableSchemaViewComponentParams<
  PaymentGatewayItemGet["info"]["name"],
  PaymentGatewayItemGet
> & React.ComponentProps<'div'> & {
  extra?: string
};


export const SpanWithLogo = (
  {
    value, children, className, context,
    extra='max-w-[8rem] md:max-w-[18rem]', ...rest
  }: SpanWithLogoParams
) => {

  const readable_span_cls = 'overflow-x-auto flex flex-row flex-nowrap items-center \
    gap-2  whitespace-nowrap'
  const merged = `${readable_span_cls} ${className} ${extra}`
  return (
    <div className={merged} {...rest} >
      {
        <img 
          src={context?.item?.info?.logo_url ?? svg} 
          className=' rounded-md w-6 h-6 object-cover border dark:opacity-80' />
      }
      <span children={String(value) ?? children} />
    </div>
  )
}

const schema_fields: TableSchemaViewField[] = [
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

  const { 
    context, page, loading, 
    error, queryCount, hasLoaded, resource,
    resource_is_probably_empty
  } = useCollectionsActions(
    'payments/gateways', '/pages/payment-gateways'
  );
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
        overallCollectionCount={page?.length ?? 0} 
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
