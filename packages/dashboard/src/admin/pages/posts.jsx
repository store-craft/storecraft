import ShowIf from '@/admin/comps/show-if.jsx'
import { BottomActions, TopActions } from '@/admin/comps/collection-actions.jsx'
import { Span, RecordActions, TimeStampView } from '@/admin/comps/common-fields.jsx'
import useCollectionsActions from '@/admin/hooks/useCollectionsActions.js'
import { TableSchemaView } from '../comps/table-schema-view.jsx'
import { ResourceTitle } from '../comps/resource-title.jsx'

/**
 * @type {import('../comps/table-schema-view.jsx').TableSchemaViewField<
 *  import('@storecraft/core/v-api').PostType, any, any
 * >[]}
 */
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
    error, queryCount, hasLoaded, resource,
    resource_is_probably_empty,
    actions: {
      onLimitChange, onReload, prev, next
    }
  } = useCollectionsActions('posts', '/pages/posts');

  return (
<div className='w-full h-full overflow-x-clip'>
  <div className='max-w-[56rem] mx-auto --overflow-x-clip'>
    <ResourceTitle 
        should_onboard={resource_is_probably_empty}
        overallColelctionCount={queryCount} 
        hasLoaded={hasLoaded} 
        resource={resource}/>
    <ShowIf show={error} children={error?.toString()} />
      <div className='w-full rounded-md overflow-hidden shadow-md 
                      dark:shadow-slate-900 border mt-5
                      shelf-border-color'>      
        <TopActions 
            isCollectionEmpty={resource_is_probably_empty}
            ref={ref_actions} 
            reload={onReload}
            createLink='/pages/posts/create'
            searchTitle='Search by name, values...' 
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
