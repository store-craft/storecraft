import { 
  useCallback, useEffect, useRef, useState 
} from 'react'
import useTrigger from './useTrigger.js'
import { list } from '@storecraft/sdk/src/utils.api.fetch.js'
import { App } from '@storecraft/core'
import { useStorecraft } from './useStorecraft.js'
import { StorecraftSDK } from '@storecraft/sdk'
import { useDocumentCache, useQueryCache } from './useStorecraftCache.js'


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

  /** @type {import('./useStorecraftCache.js').inferUseQueryCache<T>} */
  const {
    actions: {
      get: cache_query_get, 
      put: cache_query_put, 
    }
  } = useQueryCache();

  /** @type {import('./useStorecraftCache.js').inferDocumentCache<T>} */
  const {
    actions: {
      put: cache_document_put, remove: cache_document_remove
    }
  } = useDocumentCache();

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

        for(let item of result) {
          cache_document_put(item);
        }

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

  const removeDocument = useCallback(
    /**@param {string} docId */
    async (docId) => {
      try {
        await sdk[resource].remove(docId);

        cache_document_remove(docId);

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
    async (q=q_initial, from_cache=true) => {
      let q_modified = {
        ...q_initial,
        ...q
      }

      _q.current = q_modified;
      _next.current = paginate_helper(
        sdk, q_modified, resource
      );

      let items;

      if(from_cache) {
        items = await cache_query_get(resource, q_modified);

        const found_in_cache = items?.length;

        if(found_in_cache) {
          setIndex(0);
          setPages([[...items]]);
          console.log('foundin cache')
          // in the background
          _internal_fetch_next(true);
        } else {
          items = await _internal_fetch_next(true);
          cache_query_put(resource, q_modified, items);
        }

      } else {
        items = await _internal_fetch_next(true);

        cache_query_put(resource, q_modified, items);
      }

      // statistics in the background
      {
        const { 
          limit, limitToLast, startAfter, startAt, endAt, endBefore, 
          ...q_minus_filters
        } = q_modified;

        sdk.statistics.countOf(
          resource, q_minus_filters
        ).then(setQueryCount).catch(console.log);
      }

      return items;

    }, [resource, _internal_fetch_next, cache_query_get, cache_query_put]
  );

  /**
   * Let's `poll` if the resource added more documents
   */
  const pollHasChanged = useCallback(
    async (reload_if_changed=true) => {

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
          ..._q.current,
          startAfter: [
            ['updated_at', max_updated.updated_at],
            ['id', max_updated.id],
          ],
          order: 'asc'
        }
      );

      // console.log('_q.current', _q.current)
      // console.log('count', count)

      const hasChanged = count > 0;

      if(hasChanged && reload_if_changed) {
        query(_q.current);
      }

      return hasChanged;

    }, [pages, query]
  );

  useEffect(
    () => {
      if(autoLoad && index==-1 && !_hasEffectRan.current) {
        query(_q.current);
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
      prev, 
      next, 
      query,
      pollHasChanged, 
      removeDocument
    },
  }
}

