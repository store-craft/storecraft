import ShowIf from '@/admin/comps/show-if.jsx'
import { BottomActions, TopActions } from '@/admin/comps/collection-actions.jsx'
import { Span, TimeStampView, RecordActions } from '@/admin/comps/common-fields.jsx'
import useCollectionsActions from '../hooks/useCollectionsActions.js'
import { TableSchemaView } from '../comps/table-schema-view.jsx'
import { ResourceTitle } from '../comps/resource-title.jsx'

/**
 * 
 * @param {import('@storecraft/core/v-api').CustomerType} item 
 */
export const extract_contact_field = item => {

  return item?.firstname ?
  item?.firstname + (item?.lastname ? ' ' + item?.lastname : '') : 
  item?.email ?? 'anonymous'
}

/**
 * @type {import('../comps/table-schema-view.jsx').TableSchemaViewField<
 *  import('@storecraft/core/v-api').CustomerType, any, any
 * >[]}
 */
const schema_fields = [
  { 
    key: 'undefined', name: 'Full Name', comp: Span, 
    transform: 
      /** @param {import('@storecraft/core/v-api').CustomerType} item */
      item => extract_contact_field(item),
    comp_params: { className: 'font-semibold' } 
  },
  { 
    key: 'email', name: 'Email', comp: Span 
  },
  { 
    key: 'updated_at', name: 'Last Updated', comp: TimeStampView 
  },
  { 
    key: 'auth_id', name: 'UID', comp: Span, 
    comp_params: { extra: 'max-w-[4rem]' } 
  },
  { 
    key: undefined, name: 'Actions', comp: RecordActions 
  },
]

export default ({}) => {
  /**
   * @type {import('../hooks/useCollectionsActions.js').HookReturnType<
   *  import('@storecraft/core/v-api').CustomerType>
   * }
   */ 
  const { 
    query_api, context, ref_actions, page, loading, 
    error, queryCount, hasLoaded, resource,
    resource_is_probably_empty,
    actions: {
      onLimitChange, onReload, prev, next
    }
  } = useCollectionsActions('customers', '/pages/customers');

  return (
<div className='h-full w-full'>
  <div className='max-w-[56rem] mx-auto'>
    <ResourceTitle 
        should_onboard={resource_is_probably_empty}
        overallColelctionCount={queryCount} 
        hasLoaded={hasLoaded} 
        resource={resource}/>
    <ShowIf show={error} children={error?.toString()} />
    <div className='w-full rounded-md overflow-hidden border 
                    shelf-border-color shadow-md  mt-5
                    dark:shadow-slate-900'>      
      <TopActions 
          isCollectionEmpty={resource_is_probably_empty}
          ref={ref_actions} 
          reload={onReload}
          createLink='/pages/customers/create'
          searchTitle='Search by name, email, uid...' 
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

