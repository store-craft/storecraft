import CollectionView from '@/admin/comps/collection-view.jsx'
import ShowIf from '@/admin/comps/show-if.jsx'
import { RecordActions, Span } from '@/admin/comps/common-fields.jsx'
import { Title } from '@/admin/comps/common-ui.jsx'
import useCollectionsActions from '../hooks/useCollectionsActions.js'
import { useMemo } from 'react'

/**
 * 
 * @typedef {ReturnType<
 *  import('@storecraft/core/v-payments').get_payment_gateway>
 * } PaymentGatewayItemGet
 * 
 */

/**
 * This is used in `CollectionView`
 * 
 * @typedef {object} InternalSpanWithLogoParams
 * @prop {string} [className]
 * @prop {string} [extra]
 * @prop {React.ReactNode} [children]
 * 
 * @typedef {import('../comps//collection-view.jsx').CollectionViewComponentParams<
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
    error, queryCount, 
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
    <Title children={`Payment Gateways ${page?.length>=0 ? `(${page?.length})` : ''}`} 
                  className='mb-5' /> 
    <ShowIf show={error} children={error?.toString()}/>
    <ShowIf show={!error}>
      <div className='w-full rounded-md overflow-hidden border 
                      shelf-border-color shadow-md dark:shadow-slate-900'>      
        <CollectionView 
            context={context_mod} 
            data={page} 
            fields={schema_fields} />
      </div>    
    </ShowIf>
  </div>
</div>
  )
}
