import CollectionView from '@/admin/comps/collection-view.jsx'
import ShowIf from '@/admin/comps/show-if.jsx'
import { BottomActions, TopActions } from '@/admin/comps/collection-actions.jsx'
import { TimeStampView, RecordActions } from '@/admin/comps/common-fields.jsx'
import DiscountsQuickSearchActions from '@/admin/comps/discounts-quick-search-actions.jsx'
import DiscountType from '@/admin/comps/discounts-table-type.jsx'
import Code from '@/admin/comps/discounts-table-code.jsx'
import { Title } from '@/admin/comps/common-ui.jsx'
import useCollectionsActions from '../hooks/useCollectionsActions.js'

const schema_fields = [
  { key: 'handle', name: 'Code', comp: Code },
  { key: 'info.details.meta', name: 'Type', comp: DiscountType },
  { 
    key: 'updated_at', name: 'Last Updated', 
    comp: TimeStampView, comp_params : { className : 'font-semibold' } 
  },
  { key: undefined, name: 'Actions', comp: RecordActions },
]

export default ({}) => {

  const { 
    query_api, context, ref_actions, page, loading, 
    error, onLimitChange, onReload, prev, next, 
    queryCount
   } = useCollectionsActions('discounts', '/pages/discounts');

  return (
<div className='h-full w-full'>
  <div className='max-w-[56rem] mx-auto'>
    <Title children={`Discounts ${queryCount>=0 ? `(${queryCount})` : ''}`} 
                  className='mb-5' /> 
    <ShowIf show={error} children={error?.toString()}/>
    <ShowIf show={!error}>
      <DiscountsQuickSearchActions />
        <div className='w-full rounded-md overflow-hidden border 
                      shelf-border-color dark:shadow-slate-900 shadow-md mt-5'>      
        <TopActions 
            reload={onReload} 
            ref={ref_actions} 
            createLink='/pages/discounts/create'
            searchTitle='Search by Code, type...' 
            isLoading={loading} />
        <CollectionView context={context} data={page} fields={schema_fields} />
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

