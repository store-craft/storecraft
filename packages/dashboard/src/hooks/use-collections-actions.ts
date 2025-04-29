/**
 * @import { 
 *  queryable_resources, InferQueryableType 
 * } from '@storecraft/sdk-react-hooks'
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
 * @description `useCollectionsActions` is a hook designed for
 * the collections pages, for performing:
 * - Viewing of collections
 * - Pagination through querying or navigation
 * - Querying
 * It's main use case is for performing url navigation with query params
 * although can be used without.
 * 
 * TODO: Rewrite the cursors to be used by `vql` in later versions.
 * currently, i dont do that because it is a breaking change for dashboards
 * that dont have the backend to support it.
 * Also, `limit` always resets the query. 
 * 
 * This hook wraps {@link useCollection} hook
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

  const { query_params } = useParams();

  const parsed_query_params = useMemo(
    () => {
      const search_params = new URLSearchParams(query_params);
      return {
        query_api: parse_query(search_params) as ApiQuery<T>,
        // search input DOM value
        search: search_params.get('search') ?? '',
      }
    },
    [query_params]
  );

  // console.log({query_params, parsed_query_params});

  const nav = useNavigate();
  
  const ref_actions = useRef<
    import('@/comps/collection-actions.jsx').ImperativeInterface
  >(undefined);

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
        parsed_query_params.search
      );
      // console.log('query_api', query_api)
      query(
        {
          ...parsed_query_params.query_api,
          vql: parsed_query_params.search,
        }, 
        ref_use_cache.current
      );
      
    }, [parsed_query_params, query]
  );

  const onReload = useCallback(
    /**
     * @param perform_navigation perform `url` 
     * navigation with `search` params to enable query.
     */
    async (perform_navigation=true) => {
      const { 
        endBefore, endAt, startAfter, 
        startAt, limitToLast, ...rest 
      } = parsed_query_params.query_api;

      const search = ref_actions.current.getSearch();
      ref_use_cache.current = false;
     
      const q = /** @type {ApiQuery<T>} */ ({
        ...rest,
        limit: 5,
        vql: search
      })

      if(perform_navigation) {
        nav(
          `${slug}/q/${api_query_to_searchparams(q as ApiQuery).toString()}&search=${search}`, 
          { replace: true }
        );
      } else {
        await query(q);
      }

      return q;

    }, [nav, query, slug, parsed_query_params]
  );

  const onLimitChange = useCallback(
    /** 
     * navigation with `search` params to enable query.
     */
    ($limit: number, perform_navigation=true) => {
      const { 
        limit, limitToLast, ...rest 
      } = parsed_query_params.query_api
      
      const q = {
        ...parsed_query_params,
        limit: limit ? $limit : undefined,
        limitToLast: limitToLast ? $limit : undefined
      } as ApiQuery<T>;

      const search = ref_actions.current.getSearch();

      if(perform_navigation) {
        nav(
          `${slug}/q/${api_query_to_searchparams(q).toString()}&search=${search}`
        );
      } else {
        query(q);
      }

      return q;

    }, [nav, query, slug, parsed_query_params, page]
  );

  // console.log({current_page: page})

  const next = useCallback(
    /**
     * @param perform_navigation perform `url` 
     * navigation with `search` params to enable query.
     */
    async (perform_navigation=true) => {
      const item = page?.at(-1);
      const { 
        endBefore, endAt, startAfter, 
        startAt, limit, limitToLast, ...rest 
      } = parsed_query_params.query_api
      
      const search = ref_actions.current.getSearch();

      const q = {
        ...rest,
        startAfter: [
          ['updated_at', item.updated_at], 
          ['id', item.id]
        ],
        vql: search,
        limit: limit ? limit : limitToLast
      } as ApiQuery<T>;

      // console.dir({q, page, item}, {depth: 15})

      { // test if the query is empty
        const count = await count_query_of_resource(
          sdk, resource, q
        );
        // console.log({count})
        if(count==0) 
          return q;
      }

      if(perform_navigation) {
        nav(
          `${slug}/q/${api_query_to_searchparams(q).toString()}&search=${search}`
        );
      } else {
        await query(q, true);
      }

      return q;

    }, [nav, query, page, parsed_query_params, slug, resource]
  );

  const prev = useCallback(
    /**
     * @param perform_navigation perform `url` 
     * navigation with `search` params to enable query.
     */
    async (perform_navigation=true) => {
      const item = page?.at(0);
      const { 
        endBefore, endAt, startAfter, 
        startAt, limit, limitToLast, ...rest 
      } = parsed_query_params.query_api

      const search = ref_actions.current.getSearch();

      // console.log({search})

      const q = {
        ...rest,
        endBefore: [
          ['updated_at', item.updated_at], ['id', item.id]
        ],
        vql: search,
        limitToLast: limitToLast ? limitToLast : limit
      } as ApiQuery<T>;

      // console.dir({q, page, item}, {depth: 15})
      
      { // test if the query is empty
        const count = await count_query_of_resource(
          sdk, resource, q
        );
        // console.log({count})
        if(count==0) 
          return q;
      }

      if(perform_navigation) {
        // console.log({look: api_query_to_searchparams(q).toString()})
        nav(
          `${slug}/q/${api_query_to_searchparams(q).toString()}&search=${search}`
        );
      } else {
        await query(q, true);
      }

      return q;

    }, [nav, query, page, parsed_query_params, slug]
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
    query_api: parsed_query_params.query_api, 
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