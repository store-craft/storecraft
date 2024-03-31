import { useCommonCollection } from '@/shelf-cms-react-hooks/index.js'
import CollectionView from '@/admin/comps/collection-view.jsx'
import ShowIf from '@/admin/comps/show-if.jsx'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BottomActions, TopActions } from '@/admin/comps/collection-actions.jsx'
import { Span, RecordActions, TimeStampView } from '@/admin/comps/common-fields.jsx'
import { useNavigate, useParams } from 'react-router-dom'
import { o2q, q2o } from '../gallery/utils.js'
import { Title } from '@/admin/comps/common-ui.jsx'

const schema_fields = [
  { 
    key: 'title', name: 'Title', comp: Span, 
    comp_params: { className: 'font-semibold' } 
  },
  { 
    key: 'updatedAt', name: 'Last Updated	', 
    comp: TimeStampView, 
    comp_params: { className: 'font-semibold' } 
  },
  { 
    key: undefined, name: 'Actions', 
    comp: RecordActions, comp_params: { className: '' } 
  },
]

/**@type {PostData} */
const dt = {}

export default ({ } ) => {
  const { query_params } = useParams()
  const query_params_o = useMemo(
    () => q2o(query_params, { search: '', limit: 5}),
    [query_params]
  )
  const nav = useNavigate()
  const ref_actions = useRef()
  const { 
    page, loading, error, 
    query, queryCount, deleteDocument 
  } = useCommonCollection('posts', false, dt)

  useEffect(
    () => {
      // console.log('query_params ', query_params_o);
      ref_actions.current.setSearch(query_params_o.search)
      query(query_params_o)
    }, [query_params_o, query]
  )
  const onReload = useCallback(
    () => {
      const { endBeforeId, startAfterId, ...rest } = query_params_o
      const search = ref_actions.current.getSearch()
      nav(`/apps/blog/q/${o2q({ ...rest, search})}`)
    }, [nav, query_params_o]
  )
  const onLimitChange = useCallback(
    (limit) => {
      nav(`/apps/blog/q/${o2q({ ...query_params_o, limit})}`)
    }, [nav, query_params_o]
  )
  const next = useCallback(
    async () => {
      const { endBeforeId, startAfterId, ...rest } = query_params_o
      const new_id = page?.at(-1)?.[0]
      nav(`/apps/blog/q/${o2q({ 
        ...rest,
        startAfterId: new_id
      })}`)
    }, [nav, page, query_params_o]
  )
  const prev = useCallback(
    async () => {
      const { endBeforeId, startAfterId, ...rest } = query_params_o
      const new_id = page?.at(0)?.[0]
      nav(`/apps/blog/q/${o2q({ 
        ...rest,
        endBeforeId: new_id
      })}`)
    }, [nav, page, query_params_o]
  )

  const context = useMemo(
    () => ({
      viewDocumentUrl: id => `/apps/blog/${id}/view`,
      editDocumentUrl: id => `/apps/blog/${id}/edit`,
      deleteDocument,
    }), [deleteDocument]
  )
  return (
<div className='w-full h-full'>
  <div className='max-w-[56rem] mx-auto'>
    <Title children={`Posts ${queryCount>=0 ? `(${queryCount})` : ''}`} 
                    className='mb-5' /> 
    <ShowIf show={error} children={error?.toString()} 
            className='text-xl text-red-600' />
    <ShowIf show={!error}>
      <div className='w-full rounded-md overflow-hidden shadow-md 
                      dark:shadow-slate-900 shelf-border-color'>      
        <TopActions ref={ref_actions} reload={onReload}
                    createLink='/apps/blog/create'
                    searchTitle='Search by name, values...' 
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
