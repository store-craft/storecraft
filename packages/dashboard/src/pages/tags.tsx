import ShowIf from '@/comps/show-if'
import { BottomActions, TopActions } from '@/comps/collection-actions'
import { Span, SpanArray, RecordActions } from '@/comps/common-fields'
import useCollectionsActions from '../hooks/use-collections-actions'
import { TableSchemaView, TableSchemaViewField } from '../comps/table-schema-view'
import { ResourceTitle } from '../comps/resource-title'

const schema_fields: TableSchemaViewField[] = [
  { 
    key: 'handle', name: 'Name', 
    comp: Span, 
    comp_params: { className: 'font-semibold' } 
  },
  { 
    key: 'values', name: 'Values', 
    comp: SpanArray, 
    comp_params: { 
      className: 'font-semibold',
    } 
  },
  { 
    key: undefined, name: 'Actions', 
    comp: RecordActions, 
    comp_params: { className: '' } 
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
  } = useCollectionsActions('tags', '/pages/tags');

  return (
<div className='w-full h-full'>
  <div className='max-w-[56rem] mx-auto'>
    <ResourceTitle 
      should_onboard={resource_is_probably_empty}
      overallCollectionCount={queryCount} 
      hasLoaded={hasLoaded} 
      resource={resource}/>
    <ShowIf show={error} children={error?.toString()} />
    <div className='w-full rounded-md overflow-hidden border 
                    shelf-border-color shadow-md mt-5
                    dark:shadow-slate-900'>      
      <TopActions 
        isCollectionEmpty={false}
        ref={ref_actions} 
        reload={onReload}
        createLink='/pages/tags/create'
        searchTitle='Search by name, values...' 
        isLoading={loading} />
      <ShowIf show={!error && page?.length}>
        <TableSchemaView 
          context={context} 
          data={page} 
          fields={schema_fields} />
        <BottomActions 
          prev={prev} next={next} 
          limit={query_api.limit}
          onLimitChange={onLimitChange} />
      </ShowIf>
    </div>    
  </div>
</div>
  )
}
