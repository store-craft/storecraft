/**
 * @import { queryable_resources, InferQueryableType } from '@storecraft/sdk-react-hooks'
 * @import { ApiQuery } from '@storecraft/core/api'
 */

import { 
  InferQueryableType,
  q_initial, queryable_resources, useCollection 
} from '@storecraft/sdk-react-hooks';
import { 
  api_query_to_searchparams, parse_query 
} from '@storecraft/core/api/query.js';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import { count_query_of_resource } from '@storecraft/sdk/src/utils.api.fetch.js';
import { ApiQuery } from '@storecraft/core/api';


/**
 * `useCollectionsActions` is a hook designed for the collections pages,
 * for performing:
 * - Viewing of collections
 * - Pagination through querying or navigation
 * - Querying
 * 
 * This hook wraps `useCollection` hook
 * 
 * @param resource the collection id in backend 
 * @param slug front end slug
 * @param autoLoad 
 * @param autoLoadQuery 
 */
const useCollectionsActions = <
  RESOURCE extends (string | queryable_resources) = (queryable_resources),
  T extends InferQueryableType<RESOURCE> = InferQueryableType<RESOURCE>
> (
    resource: RESOURCE, 
    slug: string=resource, 
    autoLoad=false, 
    autoLoadQuery=(q_initial as ApiQuery<T>)
  ) => {

  const { query_params } = useParams()
 
  const query_api = useMemo(
    () => {
      const query_api =  (parse_query(query_params));
      return query_api as ApiQuery<T>;
    },
    [query_params]
  );

  // console.log('query_api', query_api);

  const nav = useNavigate();
  
  const ref_actions = useRef<import('@/comps/collection-actions.jsx').ImperativeInterface>(undefined);
  const ref_use_cache = useRef(true);

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
          `${slug}/q/${api_query_to_searchparams(q as ApiQuery).toString()}`, 
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
     * navigation with `search` params to enable query.
     */
    ($limit: number, perform_navigation=true) => {
      const { 
        limit, limitToLast, ...rest 
      } = query_api

      
      const q = {
        ...query_api,
        limit: limit ? $limit : undefined,
        limitToLast: limitToLast ? $limit : undefined
      } as ApiQuery<T>;

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
      
      
      const q = {
        ...rest,
        startAfter: [
          ['updated_at', item.updated_at], 
          ['id', item.id]
        ],
        limit: limit ? limit : limitToLast
      } as ApiQuery<T>;

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
      
      const q = {
        ...rest,
        endBefore: [
          ['updated_at', item.updated_at], ['id', item.id]
        ],
        limitToLast: limitToLast ? limitToLast : limit
      } as ApiQuery<T>;

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
      viewDocumentUrl: (id: string) => `${slug}/${id}/view`,
      editDocumentUrl: (id: string) => `${slug}/${id}`,
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