import ShowIf from '@/comps/show-if.jsx'
import { BottomActions, TopActions } from '@/comps/collection-actions.jsx'
import { RecordActions, Span, TimeStampView } from '@/comps/common-fields.jsx'
import useCollectionsActions from '../hooks/use-collections-actions.js'
import { TableSchemaView } from '../comps/table-schema-view.js'
import { ResourceTitle } from '../comps/resource-title.jsx'

const schema_fields = [
  { 
    key: 'title', name: 'Title', comp: Span, 
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
    query_api, context, ref_actions, page, 
    loading, hasLoaded,
    error, queryCount, resource,
    resource_is_probably_empty,
    actions: {
      onLimitChange, onReload, prev, next
    }
  } = useCollectionsActions(
    'collections', '/pages/collections'
  );

  // const page=[];

  return (
<div className='h-full w-full'>
  <div className='max-w-[56rem] mx-auto'>
    <ShowIf show={!error}>
      <ResourceTitle 
        should_onboard={resource_is_probably_empty}
        overallCollectionCount={queryCount} 
        hasLoaded={hasLoaded} 
        resource={resource}/>
    </ShowIf>
    <ShowIf show={error} children={error?.toString()}/>
      <div className='w-full rounded-md overflow-hidden border 
                      shelf-border-color shadow-md mt-5 
                      dark:shadow-slate-900 '>      
        <TopActions 
          isCollectionEmpty={false}
          ref={ref_actions} 
          reload={onReload}  
          createLink='/pages/collections/create'
          searchTitle='Search by Name or Handle' 
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
