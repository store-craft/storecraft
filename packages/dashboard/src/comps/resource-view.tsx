import { BottomActions } from './collection-actions'
import { 
  q_initial, useCollection, useStorecraft 
} from '@storecraft/sdk-react-hooks'
import { 
  forwardRef, useEffect, useImperativeHandle, 
} from 'react'
import useTrigger from '@/hooks/use-trigger'
import { TableSchemaView } from './table-schema-view'

export type ImpInterface = {
  refresh: () => Promise<void>;
};
export type ResourceViewParams = {
  /**
   * `resource` at the backend endpoint, that supports
   * querying
   */
  resource: string;
  /**
   * `limit` of query
   */
  limit?: number;
  schema: any[];
  /**
   * context
   */
  context?: any;
};


/**
 * `ResourceView` lets you view and paginate big collections
 * rendered in `TableSchemaView`
 */
const ResourceView = forwardRef(
  (
    { 
      resource, limit=5, context, schema, ...rest
    }: ResourceViewParams, 
    ref
  ) => {

  const { sdk } = useStorecraft();
    
  const { 
    pages, page, loading, error, queryCount,
    actions: {
      prev, next, query
    }
  } = useCollection(
    resource, 
    q_initial, false
  );

  const trigger = useTrigger();

  useEffect(
    () => {
      query({ limit: limit, sortBy: ['updated_at', 'id'] })
    }, [query, limit]
  );

  useImperativeHandle(ref, 
    () => (
      {
        refresh : () => query({ limit })
      }
    ), 
    [query, limit]
  );


  return (
<>
  <TableSchemaView 
    context={context} 
    data={page} 
    fields={schema} />
  <BottomActions 
      prev={prev} 
      next={next} 
      onLimitChange={undefined} />
</>
  )
})


export default ResourceView
