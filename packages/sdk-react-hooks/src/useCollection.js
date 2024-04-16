import { 
  useCallback, useEffect, 
  useRef, useState } from 'react'
import useTrigger from './useTrigger.js'
import { list } from '@storecraft/sdk/src/utils.api.fetch.js'
import { App } from '@storecraft/core'
import { useStorecraft } from './useStorecraft.js'
import { StorecraftSDK } from '@storecraft/sdk'


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
        const id = list[wx][ix].id
        if(id===what) {
          br=true; break
        }
      }
      if(br) break
    }
  
    if(!br)
      return list
      
    list = [...list];
    list[wx] = [...list[wx]];
    list[wx].splice(ix, 1);

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
 * 
 * 
 * @param {StorecraftSDK} sdk
 * @param {import('@storecraft/core/v-api').ApiQuery} query 
 * @param {string} resource
 * 
 * 
 */
const paginate_helper = (sdk, query, resource) => {

  query.sortBy = query.sortBy ?? ['updated_at', 'id'];

  /** @type {import('@storecraft/core/v-api').Cursor} */
  let startAfter = query.startAfter;

  const next = async () => {
    /** @type {typeof query} */
    const current = { 
      ...query,
      startAfter
    }

    /** @type{G[]} */
    const l = await list(
      sdk,
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
 * @template T the `document` type
 * 
 * @typedef {Omit<ReturnType<typeof useCollection<T>>, 'page' | 'pages'> & 
 *  {
 *    page: T[]  
 *    pages: T[][]  
 *  }
 * } useCollectionHookReturnType This `type` will give you the return type of the hook
 * 
 */


/** @type {import('@storecraft/core/v-api').ApiQuery} */
export const q_initial = {
  sortBy: ['updated_at', 'id'],
  order: 'desc',
  limit: 5
}

/**
 * @template {import('@storecraft/core/v-api').BaseType} T The type of the item
 * 
 * @param {keyof App["db"]["resources"]} resource the base path of the resource 
 * @param {import('@storecraft/core/v-api').ApiQuery} q query
 * @param {boolean} autoLoad 
 */
export const useCollection = (
  resource, q=q_initial, autoLoad=true
) => {

  const { sdk } = useStorecraft();
  const _q = useRef(q);
  const _hasEffectRan = useRef(false);

  /** @type {React.MutableRefObject<() => Promise<T[]>>} */
  const _next = useRef();

  const [error, setError] = useState(undefined);

  /**@type {ReturnType<typeof useState<T[][]>>} */
  const [pages, setPages] = useState([]);
  const [index, setIndex] = useState(-1);
  const [loading, setIsLoading] = useState(autoLoad);
  const [queryCount, setQueryCount] = useState(-1);
  const trigger = useTrigger();
  
  useEffect(
    () => sdk.auth.add_sub(trigger),
    [trigger]
  );

  const _internal_fetch_next = useCallback(
    /**
     * @param {boolean} is_new_query 
     */
    async (is_new_query=false) => {

      /** @type {T[]} */
      let result;

      setIsLoading(true)

      try {
        result = await _next.current();

        if(is_new_query) {
          setIndex(0);
          setPages([[...result]]);
        } else {
          setIndex(idx => idx + 1);
          setPages(ws => [...ws, [...result]]);
        }

      } catch (err) {
        setError(err?.code);
        // throw err
      } finally {
        setIsLoading(false);
      }

      return result;

    }, []
  );

  // A wrapped optimized pagination
  const paginate = useCallback(
    /**
     * @param {boolean} up paginate up or down
     * @returns 
     */
    (up) => {

      if(!_next.current) 
        return Promise.resolve();

      const hm = up ? 1 : -1;

      if(index + hm < 0) 
        return Promise.resolve();

      if(index+hm < pages.length) {
        setIndex(index+hm);

        return Promise.resolve();
      }

      // else let's fetch
      return _internal_fetch_next();

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
        await sdk[resource].delete(docId);

        setPages(delete_from_collection(docId));

        return docId;

      } catch (err) {
        setError(err);
        setIsLoading(false);
        throw err;
      }

    }, [resource]
  );

  const query = useCallback(
    /**
     * @param {import('@storecraft/core/v-api').ApiQuery} [q=q_initial] query object
     * @param {boolean} [from_cache] 
     */
    async (q=q_initial, from_cache=false) => {
      let q_modified = {
        ...q_initial,
        ...q
      }

      _q.current = q_modified;
      _next.current = paginate_helper(
        sdk, q_modified, resource
      );

      const result = await _internal_fetch_next(true);
      const count = await sdk.statistics.countOf(
        resource, q_modified
      );

      setQueryCount(count);

      return result;

    }, [resource, _internal_fetch_next]
  );

  /**
   * Let's `poll` if the resource added more documents
   */
  const pollHasChanged = useCallback(
    async () => {

      if(!pages?.length) {
        return false;
      }

      const max_updated = pages.flat(1).reduce(
        (p, c) => c > p ? c : p,
        pages?.at(0)?.at(0)
      );

      const count = await sdk.statistics.countOf(
        resource, 
        {
          startAfter: [
            ['updated_at', max_updated.updated_at],
            ['id', max_updated.id],
          ]
        }
      )

      return count > 0;

    }, [pages]
  );

  useEffect(
    () => {
      if(autoLoad && index==-1 && !_hasEffectRan.current) {
        query(_q.current)
      }
    }, []
  );

  return {
    pages, 
    page: index>=0 ? pages[index] : [], 
    loading, 
    error, 
    sdk,
    queryCount, 
    resource,
    actions: {
      prev, next, query,
      pollHasChanged, 
      deleteDocument
    },
  }
}

