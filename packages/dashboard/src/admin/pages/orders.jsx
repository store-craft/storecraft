import CollectionView from '@/admin/comps/collection-view.jsx'
import ShowIf from '@/admin/comps/show-if.jsx'
import { BottomActions, TopActions } from '@/admin/comps/collection-actions.jsx'
import { Span, TimeStampView, RecordActions } from '@/admin/comps/common-fields.jsx'
import { LabelCapsule } from '@/admin/comps/capsule.jsx'
import OrdersQuickSearchActions, { id2ColorFulfill } 
       from '@/admin/comps/orders-quick-search-actions.jsx'
import { Title } from '@/admin/comps/common-ui.jsx'
import useCollectionsActions from '../hooks/useCollectionsActions.js'

const schema_fields = [
  { 
    key: 'contact.firstname', name: 'Customer', comp: Span 
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

  /**
   * @type {import('../hooks/useCollectionsActions.js').HookReturnType<
   *  import('@storecraft/core/v-api').OrderData>
   * }
   */ 
  const { 
    query_api, context, ref_actions, page, loading, 
    error, onLimitChange, onReload, prev, next, 
    queryCount
   } = useCollectionsActions('orders', '/pages/orders');

  return (
<div className='h-full w-full'>
  <div className='max-w-[56rem] mx-auto'>
    <Title children={`Orders ${queryCount>=0 ? `(${queryCount})` : ''}`} 
          className='mb-5' /> 
    <ShowIf show={error} children={error?.toString()} />
    <ShowIf show={!error}>
      <OrdersQuickSearchActions />
      <div className='w-full rounded-md overflow-hidden border 
                      shelf-border-color shadow-md dark:shadow-slate-900 mt-5'>      
        <TopActions 
            reload={onReload} 
            ref={ref_actions}
            createLink='/pages/orders/create'
            searchTitle='Search by ID, status, date, customer info...' 
            isLoading={loading} />
        <CollectionView context={context} data={page} fields={schema_fields} />
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

