import ShowIf from '@/comps/show-if'
import { BottomActions, TopActions } from '@/comps/collection-actions'
import { Span, TimeStampView, RecordActions } from '@/comps/common-fields'
import useCollectionsActions from '../hooks/use-collections-actions'
import { TableSchemaView } from '../comps/table-schema-view'
import { ResourceTitle } from '../comps/resource-title'
import { CustomerType } from '@storecraft/core/api'

export const extract_contact_field = (item: CustomerType) => {
  // console.log('item', item)
  return item?.firstname ?
    item?.firstname + (item?.lastname ? ' ' + item?.lastname : '') : 
    item?.email ?? 'anonymous'
}

const schema_fields = [
  { 
    key: undefined, name: 'Full Name', comp: Span, 
    transform: 
      (item: CustomerType) => extract_contact_field(item),
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
      overallCollectionCount={queryCount} 
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

