import { BottomActions } from './collection-actions.jsx'
import { 
  q_initial, useCollection, useStorecraft 
} from '@storecraft/sdk-react-hooks'
import { 
  forwardRef, useEffect, useImperativeHandle, useMemo, useRef 
} from 'react'
import useTrigger from '../hooks/useTrigger.js'
import { TableSchemaView } from './table-schema-view.jsx'


/**
 * `ResourceView` lets you view and paginate big collections
 * rendered in `TableSchemaView`
 */
const ResourceView = forwardRef(
  /**
   * @typedef {object} ImpInterface
   * @prop {() => Promise<void>} refresh
   * 
   * @typedef {object} ResourceViewParams
   * @prop {string} resource `resource` at the backend endpoint, that supports
   * querying
   * @prop {number} [limit=5] `limit` of query
   * @prop {import('./table-schema-view.jsx').TableSchemaViewField[]} schema 
   * @prop {any} [context] context
   * 
   * 
   * @param {ResourceViewParams} param
   * @param {any} ref
   * 
   */
  (
    { 
      resource, limit=5, context, schema, ...rest
    }, ref
  ) => {

  const { sdk } = useStorecraft();
    
  /**
   * @type {import('@storecraft/sdk-react-hooks').useCollectionHookReturnType<
   *  import('@storecraft/core/v-api').ProductType>
   * }
   */
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
