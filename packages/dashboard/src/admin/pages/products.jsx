import CollectionView from '@/admin/comps/collection-view.jsx'
import ShowIf from '@/admin/comps/show-if.jsx'
import { BottomActions, TopActions } from '@/admin/comps/collection-actions.jsx'
import { RecordActions, Span, SpanArray, 
  TimeStampView } from '@/admin/comps/common-fields.jsx'
import { Title } from '@/admin/comps/common-ui.jsx'
import useCollectionsActions from '../hooks/useCollectionsActions.js'

const test = {
  title: 'call of duty',
  handle: 'call-of-duty-wii-perfect',
  desc : 'blah blah blah',
  price: 50,
  qty: 1,
  updatedAt : 39203023,
  collections: ['ps2-games', 'favorites'],
  tags : ['console_ps2', 'genre_action', 'region_ntsc'],
  search: ['t1', 't2', 't3'],
  media : ['url1', 'url2']
}

const schema_fields = [
  { 
    key: 'title', name: 'Title', comp: Span, 
    comp_params: { className: 'font-semibold max-w-[8rem] overflow-x-auto' } 
  },
  { key: 'price', name: 'Price', comp: Span },
  { 
    key: 'collections', name: 'Collections', comp: SpanArray, 
    comp_params: { 
      className: `p-3 font-bold max-w-[8rem] sm:max-w-[12rem] xl:max-w-max 
                  overflow-x-auto inline-block whitespace-nowrap`,
      name_fn: /** @param {import('@storecraft/core/v-api').CollectionType} c */ c => c.handle
    } 
  },
  { key: 'updated_at', name: 'Last Updated', comp: TimeStampView },
  { 
    key: undefined, name: 'Actions', 
    comp: RecordActions, 
    comp_params: { className: '' } 
  },
];

export default ({}) => {

  /**
   * @type {import('../hooks/useCollectionsActions.js').HookReturnType<
   *  import('@storecraft/core/v-api').ProductType & 
   *  import('@storecraft/core/v-api').VariantType>
   * }
   */
  const { 
    query_api, context, ref_actions, page, loading, 
    error, onLimitChange, onReload, prev, next, 
    queryCount
   } = useCollectionsActions('products', '/pages/products');

  // console.log('query_api', query_api)

  return (
<div className='w-full h-full'>
  <div className='max-w-[56rem] mx-auto'>
    <Title children={`Products ${queryCount>=0 ? `(${queryCount})` : ''}`} 
          className='mb-5' /> 
    <ShowIf show={error} children={error?.toString()} />
    <ShowIf show={!error}>
      <div className='w-full rounded-md overflow-hidden border 
                      shelf-border-color shadow-md dark:shadow-slate-900 '>      
        <TopActions 
            ref={ref_actions} reload={onReload} 
            createLink='/pages/products/create'
            searchTitle='Search by Name, Handle, Tag values, Collections...' 
            isLoading={loading} />
        <CollectionView context={context} data={page} fields={schema_fields} />
        <ShowIf show={page}>
          <BottomActions 
              prev={prev} next={next} 
              limit={query_api.limit}
              onLimitChange={onLimitChange} />
        </ShowIf>
      </div>    
    </ShowIf>
  </div>
</div>
  )
}
