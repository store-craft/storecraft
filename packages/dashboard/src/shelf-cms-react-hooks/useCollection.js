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
 * @template {any} G
 * @param {import('@storecraft/core/v-api').ApiQuery} query 
 * @param {string} resource
 */
const paginate_helper = (query, resource) => {

  query.sortBy = query.sortBy ?? ['updated_at', 'id'];

  /** @type {import('@storecraft/core/v-api').Cursor} */
  let startAfter = undefined

  const next = async () => {
    console.log('paginate_helper::next')
    /** @type {typeof query} */
    const current = { 
      ...query,
      startAfter
    }

    /** @type{G[]} */
    const l = await list(
      resource,
      query
    );

    // update next cursor
    if(l?.length) {
      startAfter = query.sortBy.map(
        (key) => [key, l.at(-1)?.[key]]
      );
    }

    return l;
  }

  return next;
}

/**
 * @template {import('@storecraft/core/v-api').BaseType} T
 * @param {string} resource the base path of the resource 
 * @param {import('@storecraft/core/v-api').ApiQuery} q query
 * @param {boolean} autoLoad 
 * @param {T} dummy_type 
 * @returns
 */
export const useCollection = 
  (resource, q=undefined, autoLoad=true, dummy_type) => {

  const _q = useRef(q)
  const _hasEffectRan = useRef(false)
  // const _next = useRef(getShelf().db.col(colId).paginate2(q))

  /** @type {import('react').MutableRefObject<() => Promise<T[]>>} */
  const _next = useRef()
  const [error, setError] = useState(undefined)
  /**@type {[T[][], import('react').Dispatch<import('react').SetStateAction<T[][]>>]} */
  const [pages, setPages] = useState([])
  const [index, setIndex] = useState(-1)
  const [loading, setIsLoading] = useState(autoLoad)
  const [queryCount, setQueryCount] = useState(-1)
  const trigger = useTrigger()
  
  // console.log('resource ',  resource);
  console.log('pages ',  pages);

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
     * @param {object} q query object
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

/**
 * 
 * @param {string} text 
 * @param {number} max_tokens 
 * @returns 
 */
const text2tokens = (text, max_tokens=10) => {
  // console.log('text ', text);
  text = text?.trim().toLowerCase()
  const tokens = text?.match(/\S+/g)?.slice(0, max_tokens) ?? []
  if (text) 
    tokens.push(text)
  return tokens
}

const q_initial = {
  orderBy: [['updatedAt', 'desc']],
  // orderBy: [['updatedAt', 'asc']],
  limit: 5
}

/**
 * Modified collection with modified search query
 * 
 * @template {import('@storecraft/core/v-api').BaseType} T
 * @param {string} resource 
 * @param {boolean} [autoLoad=true] 
 * @param {import('@storecraft/core/v-api').ApiQuery} [autoLoadQuery=q_initial] 
 * @param {T} [dummy_type] 
 */
 export const useCommonCollection = 
  (resource, autoLoad=true, autoLoadQuery=q_initial, dummy_type=undefined) => {
    
  const { 
    pages, page, loading, error, 
    prev, next, query : queryParent, queryCount, deleteDocument 
  } = useCollection(resource, autoLoadQuery, autoLoad, dummy_type)

  const query = useCallback(
    /**
     * @param {object} q query object
     * @param {boolean} from_cache 
     */
    (q, from_cache=false) => {
      const tokens = text2tokens(q.search)
      const where = tokens?.length ? [['search', 'array-contains-any', tokens]] : undefined
      return queryParent(
        {
          ...q_initial, 
          where,
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

// /**
//  * Modified collection for users
//  * @param {*} limit 
//  * @param {*} autoLoad 
//  * @returns 
//  */
// export const useUsers = (limit=10, autoLoad=true) => {
//   const q_initial = useRef({
//     orderBy: [['updatedAt', 'asc']],
//     limit
//   })

//   const [windows, window, loading, error, 
//           { prev, next, setQuery : setQueryParent, deleteDocument, reload, colId }] = 
//           useCollection('users', q_initial.current, autoLoad)

//   const [query, setQuery] = useState( { limit, search: undefined } )

//   useEffect(() => {
//     const tokens = text2tokens(query.search)
//     const where = tokens?.length ? [['search', 'array-contains-any', tokens]] : undefined
//     setQueryParent({
//       ...q_initial.current, 
//       where,
//       limit : query.limit
//     })
//   }, [query])

//   return [windows, window, loading, error, 
//           { prev, next, 
//             setQuery, 
//             deleteDocument, 
//             reload, colId }]
// }
