import ShowIf from '@/admin/comps/show-if.jsx'
import { BottomActions, TopActions } from '@/admin/comps/collection-actions.jsx'
import { Span, SpanArray, RecordActions } from '@/admin/comps/common-fields.jsx'
import { Title } from '@/admin/comps/common-ui.jsx'
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
  } = useCollectionsActions('templates', '/pages/templates');

  return (
<div className='w-full h-full'>
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
            createLink='/pages/tags/create'
            searchTitle='Search by name, values...' 
            isLoading={loading} />
        <TableSchemaView 
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
