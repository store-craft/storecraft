import ShowIf from '@/comps/show-if.jsx'
import { BottomActions, TopActions } from '@/comps/collection-actions.jsx'
import { Span, TimeStampView, RecordActions } from '@/comps/common-fields.jsx'
import { LabelCapsule } from '@/comps/capsule.jsx'
import OrdersQuickSearchActions, { id2ColorFulfill } 
       from '@/comps/orders-quick-search-actions.jsx'
import useCollectionsActions from '../hooks/use-collections-actions.js'
import { TableSchemaView } from '../comps/table-schema-view.jsx'
import MDView from '../comps/md-view.jsx'
import { ResourceTitle } from '../comps/resource-title.jsx'

/**
 * 
 * @param {import('@storecraft/core/api').OrderData} item 
 */
const extract_contact_field = item => {
  const contact = item?.contact;

  return contact?.firstname ?
    contact?.firstname + (contact?.lastname ? ' ' + contact?.lastname : '') : 
    contact?.email ?? 'anonymous'
}

/**
 * @type {import('../comps/table-schema-view.jsx').TableSchemaViewField<
 *  import('@storecraft/core/api').OrderData, any, any
 * >[]}
 */
const schema_fields = [
  { 
    key: 'contact', name: 'Customer',
    comp: ({context, value}) => (
      <MDView value={extract_contact_field(context?.item)} 
              className='overflow-x-auto max-w-20 flex-shrink' />
    ),
  },
  { 
    key: 'pricing.total', name: 'Price', comp: Span, 
    comp_params: { className: 'shelf-text-label-color font-semibold' } 
  },
  { 
    key: 'id', name: 'Order ID', comp: Span, 
    comp_params: { className: 'text-gray-500 font-semibold', extra: 'max-w-[4rem]' } 
  },
  { 
    key: 'status.fulfillment', name: 'Status', comp: LabelCapsule, 
    comp_params: { 
      bgColor: v=>id2ColorFulfill(v?.id), label: v=>v?.name.split(' ')[0] 
    } 
  },
  { 
    key: 'updated_at', name: 'Last Updated', comp: TimeStampView 
  },
  { 
    key: undefined, name: 'Actions', comp: RecordActions 
  },
]

export default ({}) => {

  // /**
  //  * @type {import('../hooks/use-collections-actions.js').HookReturnType<
  //  *  import('@storecraft/core/api').OrderData>
  //  * }
  //  */ 
  const { 
    query_api, context, ref_actions, page, loading, 
    error, queryCount, hasLoaded, resource,
    resource_is_probably_empty,
    actions: {
      onLimitChange, onReload, prev, next
    }
  } = useCollectionsActions('orders', '/pages/orders');

  return (
<div className='h-full w-full'>
  <div className='max-w-[56rem] mx-auto'>
    <ResourceTitle 
        should_onboard={resource_is_probably_empty}
        overallCollectionCount={queryCount} 
        hasLoaded={hasLoaded} 
        resource={resource}/>
    <ShowIf show={error} children={error?.toString()} />
    <OrdersQuickSearchActions className='mt-5' />
    <div className='w-full rounded-md overflow-hidden border 
                    shelf-border-color shadow-md 
                    dark:shadow-slate-900 mt-5'>      
      <TopActions 
          isCollectionEmpty={resource_is_probably_empty}
          reload={onReload} 
          ref={ref_actions}
          createLink='/pages/orders/create'
          searchTitle='Search by ID, status, date, customer info...' 
          isLoading={loading} />
      <ShowIf show={!error && page?.length}>
        <TableSchemaView 
            context={context} 
            data={page} 
            fields={schema_fields} />
        <BottomActions 
            prev={prev} 
            next={next} 
            limit={query_api.limit}
            onLimitChange={onLimitChange} />
      </ShowIf>
    </div>    
  </div>
</div>
  )
}

