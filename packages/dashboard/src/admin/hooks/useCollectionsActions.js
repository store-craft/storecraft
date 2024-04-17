import { 
  q_initial, useCollection 
} from '@storecraft/sdk-react-hooks';
import { App } from '@storecraft/core';
import { 
  api_query_to_searchparams, parse_query 
} from '@storecraft/core/v-api/utils.query.js';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom'


/**
 * @template T the `document` type
 * 
 * @typedef {Omit<ReturnType<typeof useCollectionsActions<T>>, 'page' | 'pages'> & 
 *  {
 *    page: T[],  
 *    pages: T[][]
 *  }
 * } HookReturnType This `type` will give you the return type of the hook
 * 
 */


/**
 * `useCollectionsActions` is a hook designed for the collections pages,
 * for performing:
 * - Viewing of collections
 * - Pagination through querying or navigation
 * - Querying
 * 
 * This hook wraps `useCollection` hook
 * 
 * @template {import('@storecraft/core/v-api').BaseType} T
 * 
 * @param {keyof App["db"]["resources"]} resource the collection id in backend 
 * @param {string} [slug] front end slug
 * @param {boolean} [autoLoad=true] 
 * @param {import('@storecraft/core/v-api').ApiQuery} [autoLoadQuery=q_initial] 
 */
const useCollectionsActions = (
  resource, slug=resource, autoLoad=false, autoLoadQuery=q_initial
) => {

  const { query_params } = useParams()
  const query_api = useMemo(
    () => {
      const query_api = parse_query(query_params);
      return query_api;
    },
    [query_params]
  );

  // console.log('query_api', query_api);

  const nav = useNavigate();
  
  /** 
   * @type {React.MutableRefObject<
   *  import('@/admin/comps/collection-actions.jsx').ImperativeInterface>
   * } 
   **/
  const ref_actions = useRef()
  const ref_use_cache = useRef(true)

  /**
   * @type {import('@storecraft/sdk-react-hooks').useCollectionHookReturnType<T>}
   */
  const { 
    pages, page, loading, error, sdk, queryCount, 
    actions: {
      removeDocument, query
    }
  } = useCollection(resource, autoLoadQuery, autoLoad);

  useEffect(
    () => {
      ref_actions.current?.setSearch(
        query_api.vql
        )
      // console.log('query_api', query_api)
      query(query_api, ref_use_cache.current);
      
    }, [query_api, query]
  );

  const onReload = useCallback(
    /**
     * @param {boolean} [perform_navigation=true] perform `url` 
     * navigation with `search` params to enable query.
     */
    async (perform_navigation=true) => {
      const { 
        endBefore, endAt, startAfter, 
        startAt, limitToLast, ...rest 
      } = query_api;

      const search = ref_actions.current.getSearch();
      ref_use_cache.current = false;

      const q = {
        ...rest,
        limit: 5,
        vql: search
      }

      if(perform_navigation) {
        nav(
          `${slug}/q/${api_query_to_searchparams(q).toString()}`, 
          { replace: true }
        );
      } else {
        await query(q);
      }

      return q;

    }, [nav, query, slug, query_api]
  );

  const onLimitChange = useCallback(
    /** 
     * @param {number} $limit  
     * @param {boolean} [perform_navigation=true] perform `url` 
     * navigation with `search` params to enable query.
     * 
     */
    ($limit, perform_navigation=true) => {
      const { 
        limit, limitToLast, ...rest 
      } = query_api

      /** @type {import('@storecraft/core/v-api').ApiQuery} */
      const q = {
        ...query_api,
        limit: limit ? $limit : undefined,
        limitToLast: limitToLast ? $limit : undefined
      }

      if(perform_navigation) {
        nav(`${slug}/q/${api_query_to_searchparams(q).toString()}`);
      } else {
        query(q);
      }

      return q;

    }, [nav, query, slug, query_api, page]
  );

  const next = useCallback(
    /**
     * @param {boolean} [perform_navigation=true] perform `url` 
     * navigation with `search` params to enable query.
     */
    async (perform_navigation=true) => {

      const item = page?.at(-1);
      const { 
        endBefore, endAt, startAfter, 
        startAt, limit, limitToLast, ...rest 
      } = query_api
      
      /** @type {import('@storecraft/core/v-api').ApiQuery} */
      const q = {
        ...rest,
        startAfter: [
          ['updated_at', item.updated_at], ['id', item.id]
        ],
        limit: limit ? limit : limitToLast
      }

      // console.log('q', q)
      if(perform_navigation) {
        nav(`${slug}/q/${api_query_to_searchparams(q).toString()}`);
      } else {
        await query(q);
      }

      return q;

    }, [nav, query, page, query_api, slug]
  );

  const prev = useCallback(
    /**
     * @param {boolean} [perform_navigation=true] perform `url` 
     * navigation with `search` params to enable query.
     */
    async (perform_navigation=true) => {
      const item = page?.at(0);
      const { 
        endBefore, endAt, startAfter, 
        startAt, limit, limitToLast, ...rest 
      } = query_api
      
      /** @type {import('@storecraft/core/v-api').ApiQuery} */
      const q = {
        ...rest,
        endBefore: [
          ['updated_at', item.updated_at], ['id', item.id]
        ],
        limitToLast: limitToLast ? limitToLast : limit
      }

      if(perform_navigation) {
        nav(`${slug}/q/${api_query_to_searchparams(q).toString()}`);
      } else {
        await query(q);
      }

      return q;

    }, [nav, query, page, query_api, slug]
  );

  const context = useMemo(
    () => ({
      viewDocumentUrl: /** @param {string} id */ id => `${slug}/${id}/view`,
      editDocumentUrl: /** @param {string} id */ id => `${slug}/${id}/edit`,
      deleteDocument: removeDocument,
    }), [removeDocument, slug]
  );

  return {
    query_api, 
    ref_actions, 
    context,
    pages, 
    page, 
    loading, 
    error, 
    queryCount,
    actions: {
      onLimitChange, 
      onReload, 
      prev, 
      next, 
    } 
  }
}


export default useCollectionsActions;