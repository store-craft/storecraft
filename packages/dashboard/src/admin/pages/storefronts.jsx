import ShowIf from '@/admin/comps/show-if.jsx'
import { BottomActions, TopActions } from '@/admin/comps/collection-actions.jsx'
import { RecordActions, Span, TimeStampView } from '@/admin/comps/common-fields.jsx'
import { Title } from '@/admin/comps/common-ui.jsx'
import useCollectionsActions from '../hooks/useCollectionsActions.js'
import { TableSchemaView } from '../comps/table-schema-view.jsx'
import { ResourceTitle } from '../comps/resource-title.jsx'


/**
 * @type {import('../comps/table-schema-view.jsx').TableSchemaViewField<
 *  import('@storecraft/core/v-api').StorefrontType, any, any
 * >[]}
 */
const schema_fields = [
  { 
    key: 'title', name: 'Title', comp: Span, 
    comp_params: { className: 'font-semibold ' } 
  },
  { 
    key: 'handle', name: 'Handle', comp: Span 
  },
  { 
    key: 'updated_at', name: 'Last Updated', comp: TimeStampView 
  },
  { 
    key: undefined, name: 'Actions', comp: RecordActions, 
    comp_params: { className: '' } 
  },
]

export default ({}) => {

  /**
   * @type {import('../hooks/useCollectionsActions.js').HookReturnType<
   *  import('@storecraft/core/v-api').StorefrontType>
   * }
   */ 
  const { 
    query_api, context, ref_actions, page, loading, 
    error, queryCount, hasLoaded, resource,
    resource_is_probably_empty,
    actions: {
      onLimitChange, onReload, prev, next
    }
  } = useCollectionsActions('storefronts', '/pages/storefronts');

  return (
<div className='h-full w-full'>
  <div className='max-w-[56rem] mx-auto'>
    <ResourceTitle 
        should_onboard={resource_is_probably_empty}
        overallColelctionCount={queryCount} 
        hasLoaded={hasLoaded} 
        resource={resource}/>

    <ShowIf show={error} children={error?.toString()} />
    <ShowIf show={!error}>
      <div className='w-full rounded-md overflow-hidden border 
                      shelf-border-color shadow-md mt-5
                      dark:shadow-slate-900'>      
        <TopActions 
            isCollectionEmpty={resource_is_probably_empty}
            ref={ref_actions} 
            reload={onReload}
            createLink='/pages/storefronts/create'
            searchTitle='Search by title or handle' 
            isLoading={loading} />
        <TableSchemaView 
            context={context} data={page} 
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
