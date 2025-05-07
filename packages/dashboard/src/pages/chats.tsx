import ShowIf from '@/comps/show-if'
import { BottomActions, TopActions } from '@/comps/collection-actions'
import { Span, TimeStampView, RecordActions } from '@/comps/common-fields'
import useCollectionsActions from '../hooks/use-collections-actions'
import { TableSchemaView } from '../comps/table-schema-view'
import { ResourceTitle } from '../comps/resource-title'
import { type ChatType } from '@storecraft/core/api'
import { useMemo } from 'react'

const schema_fields = [
  { 
    key: 'id', name: 'Thread', comp: Span 
  },
  { 
    key: undefined, name: 'Full Name', comp: Span, 
    transform: (item: ChatType) => 
      item?.customer_email ?? item?.customer_id ?? 'anonymous',
    comp_params: { className: 'font-semibold' } 
  },
  { 
    key: 'created_at', name: 'Created', comp: TimeStampView 
  },
  { 
    key: undefined, name: 'Actions', comp: RecordActions 
  },
]

const test_data = [
  { 
    id: 'thread_u239293jdwjej', customer_email: 'a1@a.com'
  },
  { 
    id: 'thread_u239293jdwsdjej', 
  },
  { 
    id: 'thread_u239293jdwsdvdvjej', customer_email: 'a3@a.com'
  }

]

export default ({}) => {

  let { 
    query_api, context, ref_actions, page, loading, 
    error, queryCount, hasLoaded, resource,
    resource_is_probably_empty,
    actions: {
      onLimitChange, onReload, prev, next
    }
  } = useCollectionsActions('chats', '/pages/chats');

  const context_mod = useMemo(
    () => {
      const { viewDocumentUrl } = context;
      
      return {
        linkExternalUrl: (id: string) => `/chat?thread_id=${id}`,
        deleteDocument: context.deleteDocument
      }
    }, [context]
  );

  // error = undefined;
  // hasLoaded = true;
  // page = test_data;

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
        searchTitle='search by thread / customer email / id ...' 
        isLoading={loading} />
      <ShowIf show={!error && page?.length}>
        <TableSchemaView 
          context={context_mod} 
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

