import ShowIf from '@/comps/show-if.jsx'
import { RecordActions, Span } from '@/comps/common-fields.jsx'
import { Title } from '@/comps/common-ui.jsx'
import useCollectionsActions from '../hooks/use-collections-actions.js'
import { useMemo } from 'react'
import { TableSchemaView } from '../comps/table-schema-view.jsx'
import { ResourceTitle } from '../comps/resource-title.jsx'
import { Favicon } from '@/comps/asset-favicon.jsx'
// @ts-ignore
import svg from '@/comps/favicon.svg';
/**
 * 
 * @typedef {import('@storecraft/core/api').ExtensionItemGet} ExtensionItemGet
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
 *  string, ExtensionItemGet> & 
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
  const logo = context.item?.info?.logo_url;

  const readable_span_cls = 'overflow-x-auto flex flex-row items-center \
    gap-2 inline-block whitespace-nowrap'
  const merged = `${readable_span_cls} ${className} ${extra}`
  return (
    <div className={merged} {...rest} >
      {
        <img src={context?.item?.info?.logo_url ?? svg} 
            className='rounded-md w-6 h-6 object-cover border dark:opacity-80' />
      }
      {
        // !logo &&
        // <Favicon width='w-6' height='h-6' />
      }
      
      <div children={value ?? children} />
    </div>
  )
}

/**
 * @type {import('../comps/table-schema-view.jsx').TableSchemaViewField<
 *  import('@storecraft/core/api').ExtensionItemGet, any, any
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

  // /**
  //  * @type {import('../hooks/use-collections-actions.js').HookReturnType<
  //  *  ExtensionItemGet>
  //  * }
  //  */ 
  const { 
    context, page, loading, 
    error, queryCount, hasLoaded, resource,
    resource_is_probably_empty
  } = useCollectionsActions('extensions', '/apps/extensions');
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
    <ResourceTitle 
        should_onboard={resource_is_probably_empty}
        overallCollectionCount={page?.length ?? 0} 
        hasLoaded={hasLoaded} 
        resource={resource}/>

    <ShowIf show={error} children={error?.toString()}/>
    <ShowIf show={!error && page}>
      <div className='w-full rounded-md overflow-hidden border 
                      shelf-border-color shadow-md  mt-5
                      dark:shadow-slate-900'>      
        <TableSchemaView 
            context={context_mod} 
            data={page} 
            fields={schema_fields} />
      </div>    
    </ShowIf>
  </div>
</div>
  )
}
