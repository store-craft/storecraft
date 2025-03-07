/**
 * @import { QuickSearchResult, ApiQuery } from '@storecraft/core/api'
 */
import { 
  useCallback, useRef, useState 
} from 'react'
import useTrigger from './useTrigger.js'
import { list_from_collection_resource } from '@storecraft/sdk/src/utils.api.fetch.js'
import { useStorecraft } from './useStorecraft.js'


/** @type {ApiQuery} */
const q_initial = {
  sortBy: ['updated_at', 'id'],
  order: 'desc',
  limit: 5
}


/**
 * 
 */
export const useQuickSearch = (
) => {

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
     * @param {ApiQuery} q query object
     * @param {boolean} [from_cache] 
     */
    async (q, from_cache=true) => {
      q = {
        ...q_initial, 
        ...q
      };

      try {
        /** @type {QuickSearchResult} */
        // @ts-ignore
        const item = await list_from_collection_resource(
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

