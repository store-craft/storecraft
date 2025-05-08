import ShowIf from '@/comps/show-if'
import { BottomActions, TopActions } from '@/comps/collection-actions'
import { Span, TimeStampView, RecordActions } from '@/comps/common-fields'
import { LabelCapsule } from '@/comps/capsule'
import OrdersQuickSearchActions, { id2ColorFulfill } 
       from '@/comps/orders-quick-search-actions'
import useCollectionsActions from '../hooks/use-collections-actions'
import { TableSchemaView, TableSchemaViewField } from '../comps/table-schema-view'
import MDView from '../comps/md-view'
import { ResourceTitle } from '../comps/resource-title'
import { OrderData } from '@storecraft/core/api'

const extract_contact_field = (item: OrderData) => {
  const contact = item?.contact;

  return contact?.firstname ?
    contact?.firstname + (contact?.lastname ? ' ' + contact?.lastname : '') : 
    contact?.email ?? 'anonymous'
}

const schema_fields = [
  { 
    key: 'contact', name: 'Customer',
    comp: ({context, value,}) => (
      <MDView value={extract_contact_field(context?.item)} 
        className='max-w-20 flex-shrink' />
    ),
  },
  { 
    key: 'pricing.total', name: 'Price', comp: Span, 
    comp_params: { className: 'shelf-text-label-color font-semibold' } 
  },
  { 
    key: 'id', name: 'Order ID', comp: Span, 
    comp_params: { className: 'text-gray-500 font-semibold', extra: 'max-w-[4rem]' } 
  } as TableSchemaViewField<OrderData, 'id', typeof Span>,
  { 
    key: 'status.fulfillment', name: 'Status', comp: LabelCapsule, 
    comp_params: { 
      bgColor: v=>id2ColorFulfill(v?.id), label: v=>v?.name.split(' ')[0] 
    } 
  },
  { 
    key: 'updated_at', name: 'Last Updated', comp: TimeStampView,
    comp_params: { className: 'font-mono' } 
  },
  { 
    key: undefined, name: 'Actions', comp: RecordActions 
  },
]

export default ({}) => {

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
    <div className='w-full rounded-md overflow-hidden 
      store-table-wrapper mt-5'>      
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

