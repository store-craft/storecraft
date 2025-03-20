import { TableSchemaView } from '@/comps/table-schema-view.jsx'
import ShowIf from '@/comps/show-if.jsx'
import { BottomActions, TopActions } from '@/comps/collection-actions.jsx'
import { RecordActions, Span, SpanArray, 
  TimeStampView } from '@/comps/common-fields.jsx'
import useCollectionsActions from '../hooks/use-collections-actions.js'
import { ResourceTitle } from '../comps/resource-title.jsx'

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

/**
 * @type {import('../comps/table-schema-view.jsx').TableSchemaViewField<
 *  import('@storecraft/core/api').ProductType, any, any
 * >[]}
 */
const schema_fields = [
  { 
    key: 'title', name: 'Title', comp: Span, 
    comp_params: { className: 'font-semibold max-w-[8rem] ' } 
  },
  { 
    key: 'price', name: 'Price', comp: Span 
  },
  { 
    key: 'collections', name: 'Collections', comp: SpanArray, 
    comp_params: { 
      className: `p-3 font-bold max-w-[8rem] sm:max-w-[12rem] xl:max-w-[24rem] 
                  inline-block whitespace-nowrap`,
      name_fn: 
        /** 
         * @param {import('@storecraft/core/api').CollectionType} c 
         */ 
        c => c.handle
    } 
  },
  { 
    key: 'updated_at', name: 'Last Updated', comp: TimeStampView 
  },
  { 
    key: undefined, name: 'Actions', 
    comp: RecordActions, 
    comp_params: { className: '' } 
  },
];


export default ({}) => {

  /**
   * @type {import('../hooks/use-collections-actions.js').HookReturnType<
   *  import('@storecraft/core/api').ProductType | 
   *  import('@storecraft/core/api').VariantType>
   * }
   */
  const { 
    query_api, context, ref_actions, page, loading, 
    error, queryCount, hasLoaded, resource,
    resource_is_probably_empty,
    actions: {
      onLimitChange, onReload, prev, next
    }
  } = useCollectionsActions('products', '/pages/products');

  // console.log('query_api', query_api)

  return (
<div className='w-full h-full'>
  <div className='max-w-[56rem] mx-auto'>
    <ResourceTitle 
        should_onboard={resource_is_probably_empty}
        overallCollectionCount={queryCount} 
        hasLoaded={hasLoaded} 
        resource={resource}/>
      <div className='w-full rounded-md overflow-hidden border 
                      shelf-border-color shadow-md mt-5
                      dark:shadow-slate-900 '>      
        <ShowIf show={error} children={error?.toString()} />
        <TopActions 
            isCollectionEmpty={resource_is_probably_empty}
            ref={ref_actions} 
            reload={onReload} 
            createLink='/pages/products/create'
            searchTitle='Search by Name, Handle, Tag values, Collections...' 
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
