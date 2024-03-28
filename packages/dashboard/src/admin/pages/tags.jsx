import { useCommonCollection } from '../../shelf-cms-react-hooks'
import CollectionView from '../comps/collection-view'
import ShowIf from '../comps/show-if'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { BottomActions, TopActions } from '../comps/collection-actions'
import { Span, SpanArray, RecordActions } from '../comps/common-fields'
import { useNavigate, useParams } from 'react-router-dom'
import { o2q, q2o } from '../apps/gallery/utils'
import { Title } from '../comps/common-ui'

const schema_fields = [
  { 
    key: 'name', name: 'Name', 
    comp: Span, 
    comp_params: { className: 'font-semibold' } 
  },
  { 
    key: 'values', name: 'Values', 
    comp: SpanArray, 
    comp_params: { className: 'font-semibold' } 
  },
  { 
    key: undefined, name: 'Actions', 
    comp: RecordActions, 
    comp_params: { className: '' } 
  },
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
    pages, page, loading, error, 
    query, queryCount, deleteDocument 
  } = useCommonCollection('tags', false)
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
<div className='w-full h-full'>
  <div className='max-w-[56rem] mx-auto'>
    <Title children={`Tags ${queryCount>=0 ? `(${queryCount})` : ''}`} 
            className='mb-5' /> 
    <ShowIf show={error} children={error?.toString()} 
            className='text-xl text-red-600' />
    <ShowIf show={!error}>
      <div className='w-full rounded-md overflow-hidden border 
                      shelf-border-color shadow-md dark:shadow-slate-900'>      
        <TopActions ref={ref_actions} reload={onReload}
                    createLink='/pages/tags/create'
                    searchTitle='Search by name, values...' isLoading={loading} />
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
