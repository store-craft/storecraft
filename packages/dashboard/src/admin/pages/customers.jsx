import CollectionView from '@/admin/comps/collection-view.jsx'
import ShowIf from '@/admin/comps/show-if.jsx'
import { BottomActions, TopActions } from '@/admin/comps/collection-actions.jsx'
import { Span, TimeStampView, RecordActions } from '@/admin/comps/common-fields.jsx'
import { capFirstLetter } from '@/admin/utils/index.js'
import { Title } from '@/admin/comps/common-ui.jsx'
import useCollectionsActions from '../hooks/useCollectionsActions.js'

const schema_fields = [
  { 
    key: undefined, name: 'Full Name', comp: Span, 
    transform: 
      /** @param {import('@storecraft/core/v-api').CustomerType} item */
      item => `${item.firstname} ${item.lastname}`,
    comp_params: { className: 'font-semibold' } 
  },
  { key: 'email', name: 'Email', comp: Span },
  { key: 'updated_at', name: 'Last Updated', comp: TimeStampView },
  { key: 'auth_id', name: 'UID', comp: Span, comp_params: { extra: 'max-w-[4rem]' } },
  { key: undefined, name: 'Actions', comp: RecordActions },
]

export default ({}) => {
  /**
   * @type {import('../hooks/useCollectionsActions.js').HookReturnType<
   *  import('@storecraft/core/v-api').CustomerType>
   * }
   */ 
  const { 
    query_api, context, ref_actions, page, loading, 
    error, onLimitChange, onReload, prev, next, 
    queryCount
   } = useCollectionsActions('customers', '/pages/customers');

  return (
<div className='h-full w-full'>
  <div className='max-w-[56rem] mx-auto'>
    <Title children={`Customers ${queryCount>=0 ? `(${queryCount})` : ''}`} 
           className='mb-5' /> 
    <ShowIf show={error} children={error?.toString()} />
    <ShowIf show={!error}>
      <div className='w-full rounded-md overflow-hidden border 
                      shelf-border-color shadow-md dark:shadow-slate-900'>      
        <TopActions ref={ref_actions} reload={onReload}
                    createLink='/pages/customers/create'
                    searchTitle='Search by name, email, uid...' 
                    isLoading={loading} />
        <CollectionView context={context} data={page} fields={schema_fields} />
        <BottomActions prev={prev} next={next} 
                       limit={query_api.limit}
                       onLimitChange={onLimitChange} />
      </div>    
    </ShowIf>
  </div>
</div>
  )
}

