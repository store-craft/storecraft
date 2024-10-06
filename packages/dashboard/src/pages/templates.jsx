import ShowIf from '@/comps/show-if.jsx'
import { BottomActions, TopActions } from '@/comps/collection-actions.jsx'
import { Span, RecordActions } from '@/comps/common-fields.jsx'
import useCollectionsActions from '../hooks/useCollectionsActions.js'
import { TableSchemaView } from '../comps/table-schema-view.jsx'
import { ResourceTitle } from '../comps/resource-title.jsx'

/**
 * @type {import('../comps/table-schema-view.jsx').TableSchemaViewField<
 *  import('@storecraft/core/v-api').TagType, any, any
 * >[]}
 */
const schema_fields = [
  { 
    key: 'title', name: 'Title', 
    comp: Span, 
    comp_params: { className: 'font-semibold' } 
  },
  { 
    key: 'handle', name: 'Handle', 
    comp: Span, 
    comp_params: { className: 'font-semibold' } 
  },
  { 
    key: undefined, name: 'Actions', 
    comp: RecordActions, 
    comp_params: { className: '' } 
  },
]

export default ({}) => {

  /**
   * @type {import('../hooks/useCollectionsActions.js').HookReturnType<
   *  import('@storecraft/core/v-api').TemplateType>
   * }
   */ 
  const { 
    query_api, context, ref_actions, page, loading, 
    error, queryCount, hasLoaded, resource,
    resource_is_probably_empty,
    actions: {
      onLimitChange, onReload, prev, next
    }
  } = useCollectionsActions('templates', '/apps/templates');

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
          isCollectionEmpty={resource_is_probably_empty}
          ref={ref_actions} 
          reload={onReload}
          createLink='/apps/templates/create'
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
