import ShowIf from '@/comps/show-if'
import { BottomActions, TopActions } from '@/comps/collection-actions'
import { TimeStampView, RecordActions } from '@/comps/common-fields'
import DiscountsQuickSearchActions from '@/comps/discounts-quick-search-actions'
import DiscountType from '@/comps/discounts-table-type'
import Code from '@/comps/discounts-table-code'
import useCollectionsActions from '../hooks/use-collections-actions'
import { TableSchemaView } from '../comps/table-schema-view'
import { ResourceTitle } from '../comps/resource-title'

const schema_fields = [
  { 
    key: 'handle', name: 'Code', comp: Code 
  },
  { 
    key: 'info.details.meta', name: 'Type', comp: DiscountType 
  },
  { 
    key: 'updated_at', name: 'Last Updated', 
    comp: TimeStampView, comp_params : { className : 'font-semibold' } 
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
  } = useCollectionsActions('discounts', '/pages/discounts');

  return (
<div className='h-full w-full'>
  <div className='max-w-[56rem] mx-auto'>
    <ResourceTitle 
      should_onboard={resource_is_probably_empty}
      overallCollectionCount={queryCount} 
      hasLoaded={hasLoaded} 
      resource={resource}/>
    <ShowIf show={error} children={error?.toString()}/>
    <DiscountsQuickSearchActions className='mt-5' />
    <div className='w-full rounded-md overflow-hidden border 
                  shelf-border-color dark:shadow-slate-900 
                  shadow-md mt-5'>      
      <TopActions 
        isCollectionEmpty={resource_is_probably_empty}
        reload={onReload} 
        ref={ref_actions} 
        createLink='/pages/discounts/create'
        searchTitle='Search by Code, type...' 
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

