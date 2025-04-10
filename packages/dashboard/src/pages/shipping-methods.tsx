import ShowIf from '@/comps/show-if'
import { BottomActions, TopActions } from '@/comps/collection-actions'
import { RecordActions, Span, TimeStampView } from '@/comps/common-fields'
import useCollectionsActions from '../hooks/use-collections-actions'
import { TableSchemaView, TableSchemaViewField } from '../comps/table-schema-view'
import { ResourceTitle } from '../comps/resource-title'

const schema_fields: TableSchemaViewField[] = [
  { 
    key: 'title', name: 'Title', comp: Span, 
    comp_params: {
      className: 'font-semibold', 
      extra: 'max-w-[10rem] md:max-w-[18rem]'
    } 
  },
  { 
    key: 'price', name: 'Price', comp: Span, 
    comp_params: {
      className: 'font-semibold', 
      extra: 'max-w-[10rem] md:max-w-[18rem]'
    } 
  },
  { 
    key: 'updated_at', name: 'Last Updated', comp: TimeStampView 
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
  } = useCollectionsActions(
    'shipping', 
    '/pages/shipping-methods'
  );

  
  return (
<div className='h-full w-full'>
  <div className='max-w-[56rem] mx-auto'>
    <ResourceTitle 
      should_onboard={resource_is_probably_empty}
      overallCollectionCount={queryCount} 
      hasLoaded={hasLoaded} 
      resource={resource}/>
    <ShowIf show={error} children={error?.toString()}/>
    <div className='w-full rounded-md overflow-hidden border 
                    shelf-border-color shadow-md mt-5
                    dark:shadow-slate-900'>      
      <TopActions 
        isCollectionEmpty={resource_is_probably_empty}
        ref={ref_actions} 
        reload={onReload}  
        createLink='/pages/shipping-methods/create'
        searchTitle='Search by Name or Handle' 
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
