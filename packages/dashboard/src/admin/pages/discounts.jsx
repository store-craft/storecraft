import { useCommonCollection } from '../../shelf-cms-react-hooks'
import CollectionView from '../comps/collection-view'
import ShowIf from '../comps/show-if'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { BottomActions, TopActions } from '../comps/collection-actions'
import { Span, TimeStampView, RecordActions } from '../comps/common-fields'
import { useNavigate, useParams } from 'react-router-dom'
import DiscountsQuickSearchActions from '../comps/discounts-quick-search-actions'
import DiscountType from '../comps/discounts-table-type'
import Code from '../comps/discounts-table-code'
import { o2q, q2o } from '../apps/gallery/utils'
import { Title } from '../comps/common-ui'

const schema_fields = [
  { key: 'code', name: 'Code', comp: Code },
  { key: 'info.details.meta', name: 'Type', comp: DiscountType },
  { key: 'updatedAt', name: 'Last Updated', comp: TimeStampView, comp_params : { className : 'font-semibold' } },
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
  const ref_use_cache = useRef(true)
  const { 
    page, loading, error, 
    query, queryCount, deleteDocument 
  } = useCommonCollection('discounts', false)
  segment = segment ?? collectionId
  useEffect(
    () => {
      ref_actions.current.setSearch(
        query_params_o.search
        )

      query(query_params_o, ref_use_cache.current)
    }, [query_params, query]
  )
  const onReload = useCallback(
    () => {
      const { 
        endBeforeId, startAfterId, startAtId, 
        endAtId, ...rest } = query_params_o
      const search = ref_actions.current.getSearch()
      ref_use_cache.current = false
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
    <Title children={`Discounts ${queryCount>=0 ? `(${queryCount})` : ''}`} 
                  className='mb-5' /> 
    <ShowIf show={error} children={error?.toString()} 
            className='text-xl text-red-600' />
    <ShowIf show={!error}>
      <DiscountsQuickSearchActions />
        <div className='w-full rounded-md overflow-hidden border 
                      shelf-border-color dark:shadow-slate-900 shadow-md mt-5'>      
        <TopActions reload={onReload} 
                    ref={ref_actions} 
                    createLink='/pages/discounts/create'
                    searchTitle='Search by Code, type...' 
                    isLoading={loading} />
        <CollectionView context={context} data={page} fields={schema_fields} />
        <BottomActions prev={prev} next={next} 
                       onLimitChange={onLimitChange} />
      </div>    
    </ShowIf>
  </div>
</div>
  )
}

