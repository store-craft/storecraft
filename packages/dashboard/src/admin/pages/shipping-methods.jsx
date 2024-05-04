import ShowIf from '@/admin/comps/show-if.jsx'
import { BottomActions, TopActions } from '@/admin/comps/collection-actions.jsx'
import { RecordActions, Span, TimeStampView } from '@/admin/comps/common-fields.jsx'
import { Title } from '@/admin/comps/common-ui.jsx'
import useCollectionsActions from '../hooks/useCollectionsActions.js'
import { TableSchemaView } from '../comps/table-schema-view.jsx'

const schema_fields = [
  { 
    key: 'title', name: 'Title', comp: Span, 
    comp_params: {
      className: 'font-semibold', 
      extra: 'max-w-[10rem] md:max-w-[18rem]'
    } 
  },
  { 
    key: 'price', name: 'Price', comp: Span, 
    comp_params: {
      className: 'font-semibold', 
      extra: 'max-w-[10rem] md:max-w-[18rem]'
    } 
  },
  { 
    key: 'updated_at', name: 'Last Updated', comp: TimeStampView 
  },
  { 
    key: undefined, name: 'Actions', 
    comp: RecordActions, comp_params: { className: '' } 
  },
]

export default ({}) => {

  /**
   * @type {import('../hooks/useCollectionsActions.js').HookReturnType<
   *  import('@storecraft/core/v-api').ShippingMethodType>
   * }
   */ 
  const { 
    query_api, context, ref_actions, page, loading, 
    error, queryCount, 
    actions: {
      onLimitChange, onReload, prev, next
    }
  } = useCollectionsActions('shipping', '/pages/shipping-methods');


  return (
<div className='h-full w-full'>
  <div className='max-w-[56rem] mx-auto'>
    <Title children={`Shipping Methods ${queryCount>=0 ? `(${queryCount})` : ''}`} 
                  className='mb-5' /> 
    <ShowIf show={error} children={error?.toString()}/>
    <ShowIf show={!error}>
      <div className='w-full rounded-md overflow-hidden border 
                      shelf-border-color shadow-md dark:shadow-slate-900'>      
        <TopActions 
            ref={ref_actions} reload={onReload}  
            createLink='/pages/shipping-methods/create'
            searchTitle='Search by Name or Handle' 
            isLoading={loading} />
        <TableSchemaView 
            context={context} 
            data={page} 
            fields={schema_fields} />
        <BottomActions 
            prev={prev} next={next} 
            limit={query_api.limit}
            onLimitChange={onLimitChange} />
      </div>    
    </ShowIf>
  </div>
</div>
  )
}
