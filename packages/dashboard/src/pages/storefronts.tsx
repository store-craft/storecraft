import ShowIf from '@/comps/show-if'
import { BottomActions, TopActions } from '@/comps/collection-actions'
import { RecordActions, Span, TimeStampView } from '@/comps/common-fields'
import useCollectionsActions from '../hooks/use-collections-actions'
import { TableSchemaView, TableSchemaViewField } from '../comps/table-schema-view'
import { ResourceTitle } from '../comps/resource-title'

const schema_fields: TableSchemaViewField[] = [
  { 
    key: 'title', name: 'Title', comp: Span, 
    comp_params: { className: 'font-semibold ' } 
  },
  { 
    key: 'handle', name: 'Handle', comp: Span 
  },
  { 
    key: 'updated_at', name: 'Last Updated', comp: TimeStampView,
    comp_params: { className: 'font-mono' }
  },
  { 
    key: undefined, name: 'Actions', comp: RecordActions, 
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
  } = useCollectionsActions(
    'storefronts', '/pages/storefronts'
  );

  return (
<div className='h-full w-full'>
  <div className='max-w-[56rem] mx-auto'>
    <ResourceTitle 
      should_onboard={resource_is_probably_empty}
      overallCollectionCount={queryCount} 
      hasLoaded={hasLoaded} 
      resource={resource}/>

    <ShowIf show={error} children={error?.toString()} />
    <div className='w-full rounded-md overflow-hidden 
      store-table-wrapper mt-5'>      
      <TopActions 
        isCollectionEmpty={resource_is_probably_empty}
        ref={ref_actions} 
        reload={onReload}
        createLink='/pages/storefronts/create'
        searchTitle='Search by title or handle' 
        isLoading={loading} />
      <ShowIf show={!error && page?.length}>
        <TableSchemaView 
          context={context} data={page} 
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
