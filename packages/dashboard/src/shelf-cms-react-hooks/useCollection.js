import { useCallback, useEffect, 
         useRef, useState } from 'react'
import useTrigger from './common/useTrigger.js'
import { getSDK } from '@/admin-sdk/index.js'
import { list } from '@/admin-sdk/utils.api.fetch.js'

const q = {
  orderBy: [['firstname', 'asc']],
  limit: -1,
}

/**
 * 
 * @param {string} what id
 */
const delete_from_collection = what => {

  /**
   * 
   * @param {any[][]} list 
   */
  return (list) => {
    let wx = -1
    let ix = -1
    let br = false
    for (wx=0; wx < list.length; wx++) {
      for (ix = 0; ix < list[wx].length; ix++) {
        const id = list[wx][ix][0]
        if(id===what) {
          br=true; break
        }
      }
      if(br) break
    }
  
    if(!br)
      return list
      
    // console.log('list1 ', list);
    list = [...list]    
    list[wx] = [...list[wx]]
    list[wx].splice(ix, 1)
    // console.log('wx ', wx, 'ix ', ix);
    // console.log('list ', list);
    return list
  }
  
}


/**
 * Next Pagination experiment. `Next` is more important the `previous`,
 * because `previous` can be cached and we go through it as we do `next`.
 * 
 * This is used for programatic pagination, but I now mostly use `url` 
 * route pagination with query parameters, which results in a simple
 * `query`.
 * 
 * However, this is still used in `products-in-collection-view` for
 * example.
 * 
 * @template {any} G
 * @param {import('@storecraft/core/v-api').ApiQuery} query 
 * @param {string} resource
 */
const paginate_helper = (query, resource) => {

  query.sortBy = query.sortBy ?? ['updated_at', 'id'];

  /** @type {import('@storecraft/core/v-api').Cursor} */
  let startAfter = query.startAfter;

  const next = async () => {
    // console.log('paginate_helper::next')
    /** @type {typeof query} */
    const current = { 
      ...query,
      startAfter
    }

    /** @type{G[]} */
    const l = await list(
      resource,
      current
    );

    // update next cursor
    if(l?.length) {
      startAfter = current.sortBy.map(
        (key, ix) => [key, l.at(-1)?.[key]]
      );
    }

    return l;
  }

  return next;
}

/**
 * @template T
 * 
 * @param {string} resource the base path of the resource 
 * @param {import('@storecraft/core/v-api').ApiQuery} q query
 * @param {boolean} autoLoad 
 */
export const useCollection = 
  (resource, q=undefined, autoLoad=true) => {

  const _q = useRef(q)
  const _hasEffectRan = useRef(false)
  // const _next = useRef(getShelf().db.col(colId).paginate2(q))

  /** @type {React.MutableRefObject<() => Promise<T[]>>} */
  const _next = useRef()
  const [error, setError] = useState(undefined)
  /**@type {ReturnType<typeof useState<T[][]>>} */
  const [pages, setPages] = useState([])
  const [index, setIndex] = useState(-1)
  const [loading, setIsLoading] = useState(autoLoad)
  const [queryCount, setQueryCount] = useState(-1)
  const trigger = useTrigger()
  
  // console.log('resource ',  resource);
  // console.log('pages ',  pages);

  useEffect(
    () => getSDK().auth.add_sub(trigger)
    , [trigger]
  )

  const _internal_fetch_next = useCallback(
    /**
     * @param {boolean} is_new_query 
     */
    async (is_new_query=false) => {
      setIsLoading(true)
      try {
        const res = await _next.current()
        if(is_new_query) {
          setIndex(0)
          setPages([[...res]])
        } else {
          setIndex(idx => idx + 1)
          setPages(ws => [...ws, [...res]])
        }

      } catch (err) {
        setError(err?.code)
        // throw err
      } finally {
        setIsLoading(false)
      }
    }, []
  )

  // A wrapped optimized pagination
  const paginate = useCallback(
    /**
     * @param {boolean} up paginate up or down
     * @returns 
     */
    (up) => {
      if(!_next.current) return Promise.resolve()
      const hm = up ? 1 : -1
      if(index + hm < 0) return Promise.resolve()
      if(index+hm < pages.length) {
        setIndex(index+hm)
        return Promise.resolve()
      }
      // else let's fetch
      return _internal_fetch_next()
    }, [pages, index, _internal_fetch_next]
  )

  const next = useCallback(
    () => paginate(true)
    , [paginate]
  );

  const prev = useCallback(
    () => paginate(false)
    , [paginate]
  );

  const deleteDocument = useCallback(
    /**@param {string} docId */
    async (docId) => {
      try {
        await getSDK()[resource].delete(docId)
        setPages(delete_from_collection(docId))
        return docId
      } catch (err) {
        setError(err)
        setIsLoading(false)
        throw err
      }
    }, [resource]
  )

  const query = useCallback(
    /**
     * @param {import('@storecraft/core/v-api').ApiQuery} q query object
     * @param {boolean} from_cache 
     */
    async (q={}, from_cache=false) => {
      let result = undefined
      _q.current = q
      // _next.current = await getSDK().db.col(colId).paginate2(
      //   q, from_cache
      //   );

      // console.log('query')
      _next.current = paginate_helper(q, resource);
      result = await _internal_fetch_next(true)  
      // console.log('result', result)
      // setQueryCount(-1)
      const { 
        limit, startAfter, startAt, endAt, endBefore, 
        startAfterId, startAtId, endAtId, endBeforeId, 
        ...q_minus_limit
      } = q
      // const count = await getSDK().db?.col(colId).count(q_minus_limit)
      // setQueryCount(count)
      return result
    }, [resource, _internal_fetch_next, getSDK()]
  )

  useEffect(
    () => {
      if(autoLoad && index==-1 && !_hasEffectRan.current) {
        query(_q.current)
      }
    }, []
  )

  return {
    pages, page: index>=0 ? pages[index] : [], 
    loading, error, 
    prev, next, query, queryCount,
    deleteDocument, 
    colId: resource 
  }
}


/** @type {import('@storecraft/core/v-api').ApiQuery} */
export const q_initial = {
  sortBy: ['updated_at', 'id'],
  order: 'desc',
  limit: 5
}

/**
 * @template T the `document` type
 * 
 * @typedef {Omit<ReturnType<typeof useCommonCollection<T>>, 'page' | 'pages'> & 
 *  {
 *    page: T[]  
 *    pages: T[][]  
 *  }
 * } HookReturnType This `type` will give you the return type of the hook
 * 
 */

/**
 * Modified collection with modified search query
 * 
 * @template T
 * 
 * @param {string} resource 
 * @param {boolean} [autoLoad=true] 
 * @param {import('@storecraft/core/v-api').ApiQuery} [autoLoadQuery=q_initial] 
 */
 export const useCommonCollection = 
  (resource, autoLoad=true, autoLoadQuery=q_initial) => {
    
  const { 
    pages, page, loading, error, 
    prev, next, query : queryParent, queryCount, deleteDocument 
  } = useCollection(resource, autoLoadQuery, autoLoad)

  const query = useCallback(
    /**
     * @param {import('@storecraft/core/v-api').ApiQuery} q query object
     * @param {boolean} from_cache 
     */
    (q, from_cache=false) => {
      // const tokens = text2tokens(q.search)
      // const where = tokens?.length ? [['search', 'array-contains-any', tokens]] : undefined
      return queryParent(
        {
          ...q_initial, 
          // where,
          ...q
        }, from_cache
      )
    }, [queryParent]
  )

  return {
    pages, page, loading, error, 
    prev, next, 
    query, queryCount, 
    deleteDocument, 
    colId: resource 
  }
}
