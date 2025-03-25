/**
 * @import { queryable_resources, InferQueryableType } from '@storecraft/sdk-react-hooks'
 * @import { ApiQuery } from '@storecraft/core/api'
 */

import { 
  q_initial, useCollection 
} from '@storecraft/sdk-react-hooks';
import { App } from '@storecraft/core';
import { 
  api_query_to_searchparams, parse_query 
} from '@storecraft/core/api/utils.query.js';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import { count_query_of_resource } from '@storecraft/sdk/src/utils.api.fetch.js';


/**
 * `useCollectionsActions` is a hook designed for the collections pages,
 * for performing:
 * - Viewing of collections
 * - Pagination through querying or navigation
 * - Querying
 * 
 * This hook wraps `useCollection` hook
 * 
 * @template {string | queryable_resources} [RESOURCE=(queryable_resources)]
 * @template {InferQueryableType<RESOURCE>} [T=(InferQueryableType<RESOURCE>)]
 * 
 * @param {RESOURCE} resource the collection id in backend 
 * @param {string} [slug] front end slug
 * @param {boolean} [autoLoad=true] 
 * @param {ApiQuery<T>} [autoLoadQuery=q_initial] 
 */
const useCollectionsActions = (
  resource, slug=resource, autoLoad=false, 
  autoLoadQuery=(/** @type {ApiQuery<T>} */(q_initial))
) => {

  const { query_params } = useParams()
 
  const query_api = useMemo(
    () => {
      const query_api =  /** @type {ApiQuery<T>} */ (parse_query(query_params));
      return query_api;
    },
    [query_params]
  );

  // console.log('query_api', query_api);

  const nav = useNavigate();
  
  /** 
   * @type {React.MutableRefObject<
   *  import('@/comps/collection-actions.jsx').ImperativeInterface>
   * } 
   **/
  const ref_actions = useRef();
  const ref_use_cache = useRef(true);

  // /**
  //  * @type {import('@storecraft/sdk-react-hooks').useCollectionHookReturnType<T>}
  //  */

  
  const { 
    pages, page, loading, hasLoaded, error, sdk, queryCount, 
    resource_is_probably_empty,
    resource_has_more_pages,
    actions: {
      removeDocument, query
    }
  } = useCollection(resource, autoLoadQuery, autoLoad);

  
  useEffect(
    () => {
      ref_actions.current?.setSearch(
        query_api.vql
      );
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

     
      const q =  /** @type {ApiQuery<T>} */ ({
        ...rest,
        limit: 5,
        vql: search
      })

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

      
      const q = /** @type {ApiQuery<T>} */ ({
        ...query_api,
        limit: limit ? $limit : undefined,
        limitToLast: limitToLast ? $limit : undefined
      })

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
      // if(!resource_has_more_pages)
      //   return;

      const item = page?.at(-1);
      const { 
        endBefore, endAt, startAfter, 
        startAt, limit, limitToLast, ...rest 
      } = query_api
      
      
      const q = /** @type {ApiQuery<T>} */ ({
        ...rest,
        startAfter: [
          ['updated_at', item.updated_at], 
          ['id', item.id]
        ],
        limit: limit ? limit : limitToLast
      });

      if(perform_navigation) {
        { // when using query with navigation
          // we perform a different check for empty resources
          // as opposed to the regular `query` function,
          // becuase we are in stateless mode.
          const count = await count_query_of_resource(
            sdk, resource, q
          );
          if(count==0) return;
        }
        nav(`${slug}/q/${api_query_to_searchparams(q).toString()}`);
      } else {
        await query(q);
      }

      return q;

    }, [nav, query, page, query_api, slug, resource]
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
      
      const q = /** @type {ApiQuery<T>} */ ({
        ...rest,
        endBefore: [
          ['updated_at', item.updated_at], ['id', item.id]
        ],
        limitToLast: limitToLast ? limitToLast : limit
      });

      if(perform_navigation) {
        { // when using query with navigation
          // we perform a different check for empty resources
          // as opposed to the regular `query` function,
          // becuase we are in stateless mode.
          const count = await count_query_of_resource(
            sdk, resource, q
          );
          if(count==0) return;
        }
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
      editDocumentUrl: /** @param {string} id */ id => `${slug}/${id}`,
      deleteDocument: removeDocument,
    }), [removeDocument, slug]
  );

  return {
    resource,
    query_api, 
    ref_actions, 
    context,
    pages, 
    page, 
    loading, 
    hasLoaded,
    resource_is_probably_empty,
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