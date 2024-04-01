import { useCommonCollection } from '@/shelf-cms-react-hooks/index.js'
import CollectionView from '@/admin/comps/collection-view.jsx'
import ShowIf from '@/admin/comps/show-if.jsx'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { BottomActions, TopActions } from '@/admin/comps/collection-actions.jsx'
import { RecordActions, Span, SpanArray, 
  TimeStampView } from '@/admin/comps/common-fields.jsx'
import { o2q, q2o } from '@/admin/apps/gallery/utils.js'
import { useNavigate, useParams } from 'react-router-dom'
import { Title } from '@/admin/comps/common-ui.jsx'

const test = {
  title: 'call of duty',
  handle: 'call-of-duty-wii-perfect',
  desc : 'blah blah blah',
  price: 50,
  qty: 1,
  updatedAt : 39203023,
  collections: ['ps2-games', 'favorites'],
  tags : ['console_ps2', 'genre_action', 'region_ntsc'],
  search: ['t1', 't2', 't3'],
  media : ['url1', 'url2']
}

const schema_fields = [
  { 
    key: 'title', name: 'Title', comp: Span, 
    comp_params: { className: 'font-semibold max-w-[8rem] overflow-x-auto' } 
  },
  { key: 'price', name: 'Price', comp: Span },
  { 
    key: 'collections', name: 'Collections', comp: SpanArray, 
    comp_params: { className: `p-3 font-bold max-w-[8rem] sm:max-w-[12rem] xl:max-w-max 
                               overflow-x-auto inline-block whitespace-nowrap` } 
  },
  { key: 'updated_at', name: 'Last Updated', comp: TimeStampView },
  { 
    key: undefined, name: 'Actions', 
    comp: RecordActions, 
    comp_params: { className: '' } 
  },
]

export default ({ collectionId, segment }) => {
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
  } = useCommonCollection('products', false)
  segment = segment ?? collectionId
  useEffect(
    () => {
      ref_actions.current.setSearch(
        query_params_o.search
        )
      
      query(query_params_o, ref_use_cache.current)
    }, [query_params_o, query]
  )
  const onReload = useCallback(
    () => {
      const { 
        endBeforeId, startAfterId, startAtId, 
        endAtId, ...rest } = query_params_o
      const search = ref_actions.current.getSearch()
      ref_use_cache.current = false
      nav(`/pages/${segment}/q/${o2q({ ...rest, search, ts: Date.now()})}`, {replace:true})
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
    <Title children={`Products ${queryCount>=0 ? `(${queryCount})` : ''}`} 
              className='mb-5' /> 
    <ShowIf show={error} children={error?.toString()} />
    <ShowIf show={!error}>
      <div className='w-full rounded-md overflow-hidden border 
                      shelf-border-color shadow-md dark:shadow-slate-900 '>      
        <TopActions ref={ref_actions} reload={onReload} 
                    createLink='/pages/products/create'
                    searchTitle='Search by Name, Handle, Tag values, Collections...' 
                    isLoading={loading} />
        <CollectionView context={context} data={page} fields={schema_fields} />
        <ShowIf show={page}>
          <BottomActions prev={prev} next={next} 
                        limit={query_params_o.limit}
                        onLimitChange={onLimitChange} />
        </ShowIf>
      </div>    
    </ShowIf>
  </div>
</div>
  )
}
