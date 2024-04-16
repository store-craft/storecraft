import CollectionView from '@/admin/comps/collection-view.jsx'
import ShowIf from '@/admin/comps/show-if.jsx'
import { BottomActions, TopActions } from '@/admin/comps/collection-actions.jsx'
import { Span, RecordActions, TimeStampView } from '@/admin/comps/common-fields.jsx'
import { Title } from '@/admin/comps/common-ui.jsx'
import useCollectionsActions from '@/admin/hooks/useCollectionsActions.js'

const schema_fields = [
  { 
    key: 'title', name: 'Title', comp: Span, 
    comp_params: { className: 'font-semibold' } 
  },
  { 
    key: 'updated_at', name: 'Last Updated	', 
    comp: TimeStampView, 
    comp_params: { className: 'font-semibold' } 
  },
  { 
    key: undefined, name: 'Actions', 
    comp: RecordActions, comp_params: { className: '' } 
  },
]

export default ({}) => {
  const { 
    query_api, context, ref_actions, page, loading, 
    error, queryCount, 
    actions: {
      onLimitChange, onReload, prev, next
    }
  } = useCollectionsActions('posts', '/pages/posts');

  return (
<div className='w-full h-full'>
  <div className='max-w-[56rem] mx-auto'>
    <Title children={`Posts ${queryCount>=0 ? `(${queryCount})` : ''}`} 
           className='mb-5' /> 
    <ShowIf show={error} children={error?.toString()} />
    <ShowIf show={!error}>
      <div className='w-full rounded-md overflow-hidden shadow-md 
                      dark:shadow-slate-900 shelf-border-color'>      
        <TopActions 
            ref={ref_actions} reload={onReload}
            createLink='/pages/posts/create'
            searchTitle='Search by name, values...' 
            isLoading={loading} />
        <CollectionView 
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
