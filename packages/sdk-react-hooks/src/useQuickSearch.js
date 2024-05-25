import { 
  useCallback, useEffect, useRef, useState 
} from 'react'
import useTrigger from './useTrigger.js'
import { fetchApiWithAuth, list } from '@storecraft/sdk/src/utils.api.fetch.js'
import { App } from '@storecraft/core'
import { useStorecraft } from './useStorecraft.js'
import { useDocumentCache, useQueryCache } from './useStorecraftCache.js'
import { StorecraftSDK } from '@storecraft/sdk'



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

/** @type {import('@storecraft/core/v-api').ApiQuery} */
const q_initial = {
  sortBy: ['updated_at', 'id'],
  order: 'desc',
  limit: 5
}


/**
 * 
 * @typedef {import('@storecraft/core/v-database').QuickSearchResult} QuickSearchResult
 */

/**
 * 
 */
export const useQuickSearch = (
) => {

  /** @type {import('./useStorecraftCache.js').inferDocumentCache<{}>} */
  const {
    actions: {
      putWithKey: cache_document_put_with_key, 
    }
  } = useDocumentCache();

  const { sdk } = useStorecraft();
  const _hasEffectRan = useRef(false);

  const [error, setError] = useState(undefined);

  /**@type {ReturnType<typeof useState<QuickSearchResult>>} */
  const [result, setResult] = useState();
  const [loading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const trigger = useTrigger();
  
  const query = useCallback(
    /**
     * @param {import('@storecraft/core/v-api').ApiQuery} q query object
     * @param {boolean} [from_cache] 
     */
    async (q, from_cache=true) => {
      q = {
        ...q_initial, 
        ...q
      };

      try {
        /** @type {QuickSearchResult} */
        const item = await list(
          sdk,
          'search', 
          q
        );

        setResult(item);
      } catch (e) {
        setError(e);
      }

    }, []
  );

  return {
    result, 
    loading, 
    hasLoaded,
    error, 
    sdk,
    actions: {
      query,
    },
  }
}

