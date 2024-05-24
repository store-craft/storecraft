import { 
  useCallback, useEffect, useRef, useState 
} from 'react'
import useTrigger from './useTrigger.js'
import { list } from '@storecraft/sdk/src/utils.api.fetch.js'
import { App } from '@storecraft/core'
import { useStorecraft } from './useStorecraft.js'
import { useDocumentCache, useQueryCache } from './useStorecraftCache.js'
import { StorecraftSDK } from '@storecraft/sdk'
import { 
  remove as sdk_remove 
} from "@storecraft/sdk/src/utils.api.fetch.js";


/**
 * @param {import("@storecraft/core/v-api").ApiQuery} query_api
 * @param {number} [page_count=0]
 * @param {boolean} [hasLoaded=false]
 * @param {boolean} [loading=false]
 */
export const resource_is_probably_empty = (
  query_api, hasLoaded, loading, page_count
) => {
  return hasLoaded && !loading && page_count!==undefined && 
      page_count<=0 && query_api && (
      !query_api.vql &&
      !query_api.endAt && !query_api.endBefore &&
      !query_api.startAt && !query_api.startAfter
    )
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
 * @template {import('@storecraft/core/v-api').BaseType} T The type of the item
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
      get: cache_document_get, 
      put: cache_document_put, 
      putWithKey: cache_document_put_with_key, 
      remove: cache_document_remove
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
  const [hasLoaded, setHasLoaded] = useState(false);
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

        setHasLoaded(true);

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


  const query = useCallback(
    /**
     * @param {import('@storecraft/core/v-api').ApiQuery} [q=q_initial] query object
     * @param {boolean} [from_cache] 
     */
    async (q=_q.current, from_cache=true) => {
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

        const found_in_cache = Boolean(items);

        if(found_in_cache) {
          setIndex(0);
          setPages([[...items]]);
          // console.log('foundin cache')
          // in the background
          _internal_fetch_next(true).then(
            new_items => {
              cache_query_put(resource, q_modified, new_items);
            }
          );
        } 
      } 
      
      // fetch from server
      if(!items) {
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

  const removeDocument = useCallback(
    /**@param {string} document */
    async (document) => {
      try {
        cache_document_remove(document);

        await sdk_remove(sdk, resource, document);
        await query(_q.current, false);
        
        return document;

      } catch (err) {

        setError(err);
        setIsLoading(false);

        throw err;
      }

    }, [resource, query]
  );

  /**
   * `Record` the max `updated_at` document we encounter and cache it.
   */
  useEffect(
    () => {
      async function doit() {
        const max_updated = pages.flat(1).reduce(
          (p, c) => c > p ? c : p,
          pages?.at(0)?.at(0)
        );

        const KEY = `storecraft_max_updated_seen_${resource}`;
        let max = await cache_document_get(KEY);

        if(max_updated || max) {
          if(max_updated && max) {
            const is_bigger = (
              (max_updated.updated_at > max.updated_at) || 
              (max_updated.updated_at==max.updated_at && max_updated.id>max.id)
            );

            is_bigger && (max = max_updated);
          }
          else {
            max = max ?? max_updated
          }
        }

        if(max) {
          cache_document_put_with_key(KEY, max);
        }
      }

      doit();
    }, [pages, resource]
  )

  /**
   * Let's `poll` if the resource added more documents
   */
  const poll = useCallback(
    async () => {

      const KEY = `storecraft_max_updated_seen_${resource}`;
      const max_updated_seen_item = await cache_document_get(KEY);

      // console.log('max_updated_seen_item', max_updated_seen_item)

      if(!max_updated_seen_item)
        return true;

      const count = await sdk.statistics.countOf(
        resource, 
        {
          startAfter: [
            ['updated_at', max_updated_seen_item.updated_at],
            ['id', max_updated_seen_item.id],
          ],
          order: 'asc'
        }
      );

      // console.log('_q.current', _q.current)
      // console.log('count', count)

      const hasChanged = count > 0;

      return hasChanged;

    }, []
  );

  useEffect(
    () => {
      if(autoLoad && index==-1 && !_hasEffectRan.current) {
        query(_q.current);
      }
    }, []
  );

  const page = index>=0 ? pages[index] : [];

  return {
    pages, 
    page, 
    loading, 
    hasLoaded,
    resource_is_probably_empty: resource_is_probably_empty(_q.current, hasLoaded, loading, page.length),
    error, 
    sdk,
    queryCount, 
    resource,
    actions: {
      prev, 
      next, 
      query,
      poll, 
      removeDocument
    },
  }
}

