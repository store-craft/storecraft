import { useCommonCollection } from '../../shelf-cms-react-hooks'
import CollectionView from '../comps/collection-view'
import ShowIf from '../comps/show-if'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { BottomActions, TopActions } from '../comps/collection-actions'
import { Span, TimeStampView, RecordActions } from '../comps/common-fields'
import { useNavigate, useParams } from 'react-router-dom'
import { LabelCapsule } from '../comps/capsule'
import OrdersQuickSearchActions, { id2ColorFulfill } 
       from '../comps/orders-quick-search-actions'
import { o2q, q2o } from '../apps/gallery/utils'
import { Title } from '../comps/common-ui'

const schema_fields = [
  { key: 'address.firstname', name: 'Customer', comp: Span },
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
    comp_params: { bgColor: v=>id2ColorFulfill(v?.id), label: v=>v?.name.split(' ')[0] } 
  },
  { key: 'updatedAt', name: 'Last Updated', comp: TimeStampView },
  { key: undefined, name: 'Actions', comp: RecordActions },
]

export default ({ collectionId, segment } ) => {
  const { query_params } = useParams()
  const query_params_o = useMemo(
    () => q2o(query_params, { search: '', limit: 5}),
    [query_params]
  )
  const nav = useNavigate()
  const ref_actions = useRef()
  const { 
    pages, page, loading, error, 
    query, queryCount, deleteDocument 
  } = useCommonCollection('orders', false)
  segment = segment ?? collectionId
  useEffect(
    () => {
      ref_actions.current.setSearch(
        query_params_o.search
        )

      query(query_params_o, false)
    }, [query_params, query]
  )
  const onReload = useCallback(
    () => {
      const { 
        endBeforeId, startAfterId, startAtId, 
        endAtId, ...rest } = query_params_o
      const search = ref_actions.current.getSearch()
      nav(`/pages/${segment}/q/${o2q({ ...rest, search})}`)
    }, [nav, collectionId, query_params_o]
  )
  const onLimitChange = useCallback(
    (limit) => {
      const { 
        endBeforeId, startAfterId, startAtId, 
        endAtId, ...rest } = query_params_o
      const new_id = page?.at(0)?.[0]

      nav(`/pages/${segment}/q/${o2q({ 
        ...rest, limit, startAtId: new_id
      })}`)
    }, [nav, collectionId, query_params_o, page]
  )
  const next = useCallback(
    async () => {
      const { 
        endBeforeId, startAfterId, startAtId, 
        endAtId, ...rest } = query_params_o
      const new_id = page?.at(-1)?.[0]
      nav(`/pages/${segment}/q/${o2q({ 
        ...rest,
        startAfterId: new_id
      })}`)
    }, [nav, page, query_params_o]
  )
  const prev = useCallback(
    async () => {
      const { 
        endBeforeId, startAfterId, startAtId, 
        endAtId, ...rest } = query_params_o
      const new_id = page?.at(0)?.[0]
      nav(`/pages/${segment}/q/${o2q({ 
        ...rest,
        endBeforeId: new_id
      })}`)
    }, [nav, page, query_params_o]
  )

  const context = useMemo(
    () => ({
      viewDocumentUrl: id => `/pages/${segment}/${id}/view`,
      editDocumentUrl: id => `/pages/${segment}/${id}/edit`,
      deleteDocument,
    }), [deleteDocument]
  )

  return (
<div className='h-full w-full'>
  <div className='max-w-[56rem] mx-auto'>
    <Title children={`Orders ${queryCount>=0 ? `(${queryCount})` : ''}`} 
                className='mb-5' /> 
    <ShowIf show={error} children={error?.toString()} 
            className='text-xl text-red-600' />
    <ShowIf show={!error}>
      <OrdersQuickSearchActions />
      <div className='w-full rounded-md overflow-hidden border 
                      shelf-border-color shadow-md dark:shadow-slate-900 mt-5'>      
        <TopActions reload={onReload} 
                    ref={ref_actions}
                    createLink='/pages/orders/create'
                    searchTitle='Search by ID, status, date, customer info...' 
                    isLoading={loading} />
        <CollectionView context={context} data={page} fields={schema_fields} />
        <BottomActions prev={prev} next={next} 
                       limit={query_params_o.limit}
                       onLimitChange={onLimitChange} />
      </div>    
    </ShowIf>
  </div>
</div>
  )
}

