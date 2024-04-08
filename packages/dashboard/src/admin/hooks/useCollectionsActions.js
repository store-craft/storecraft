import { useCommonCollection } from '@/shelf-cms-react-hooks/useCollection.js';
import { api_query_to_searchparams, parse_query } from '@storecraft/core/v-api/utils.query.js';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom'


/**
 * @template T the `document` type
 * 
 * @typedef {Omit<ReturnType<typeof useCollectionsActions>, 'page'> & 
 *  {
 *    page: T[]  
 *  }
 * } HookReturnType This `type` will give you the return type of the hook
 * 
 */

/**
 * `useCollectionsActions` is a hook designed for the collections pages,
 * for performing:
 * - Viewing of collections
 * - Pagination
 * - Querying
 * 
 * @param {string} resource the collection id in backend 
 * @param {string} slug front end slug
 */
const useCollectionsActions = (resource, slug=resource) => {
  const { query_params } = useParams()
  const query_api = useMemo(
    () => {
      const query_api = parse_query(query_params);
      return query_api;
    },
    [query_params]
  );

  const nav = useNavigate();
  
  /** 
   * @type {import('react').MutableRefObject<
   *  import('@/admin/comps/collection-actions.jsx').ImperativeInterface>
   * } 
   **/
  const ref_actions = useRef()
  const ref_use_cache = useRef(true)
  const { 
    page, loading, error, 
    query, queryCount, deleteDocument 
  } = useCommonCollection(resource, false);

  useEffect(
    () => {
      ref_actions.current?.setSearch(
        query_api.vqlString
        )
      
      query(query_api, false && ref_use_cache.current)
    }, [query_api, query]
  );

  const onReload = useCallback(
    () => {
      const { 
        endBefore, endAt, startAfter, 
        startAt, limitToLast, ...rest 
      } = query_api;

      const search = ref_actions.current.getSearch();
      ref_use_cache.current = false;

      const q = api_query_to_searchparams(
        {
          ...rest,
          limit: 5,
          vqlString: search
        }
      );
      nav(
        `${slug}/q/${q.toString()}`, 
        { replace: true }
      );

    }, [nav, slug, query_api]
  );

  const onLimitChange = useCallback(
    /** @param {number} $limit  */
    ($limit) => {
      const { 
        limit, limitToLast, ...rest 
      } = query_api

      const q = api_query_to_searchparams(
        {
          ...query_api,
          limit: limit ? $limit : undefined,
          limitToLast: limitToLast ? $limit : undefined
        }
      );
      nav(`${slug}/q/${q.toString()}`);

    }, [nav, slug, query_api, page]
  );

  const next = useCallback(
    async () => {

      const item = page?.at(-1);
      const { 
        endBefore, endAt, startAfter, 
        startAt, limit, limitToLast, ...rest 
      } = query_api
      
      const q = api_query_to_searchparams(
        {
          ...rest,
          startAfter: [
            ['updated_at', item.updated_at], ['id', item.id]
          ],
          limit: limit ? limit : limitToLast
        }
      );
      nav(`${slug}/q/${q.toString()}`);

    }, [nav, page, query_api, slug]
  );

  const prev = useCallback(
    async () => {
      const item = page?.at(0);
      const { 
        endBefore, endAt, startAfter, 
        startAt, limit, limitToLast, ...rest 
      } = query_api
      
      const q = api_query_to_searchparams(
        {
          ...rest,
          endBefore: [
            ['updated_at', item.updated_at], ['id', item.id]
          ],
          limitToLast: limitToLast ? limitToLast : limit
        }
      );
      nav(`${slug}/q/${q.toString()}`);
    }, [nav, page, query_api, slug]
  );

  const context = useMemo(
    () => ({
      viewDocumentUrl: /** @param {string} id */ id => `${slug}/${id}/view`,
      editDocumentUrl: /** @param {string} id */ id => `${slug}/${id}/edit`,
      deleteDocument,
    }), [deleteDocument, slug]
  );

  return {
    query_api, ref_actions, context,
    page, loading, error, 
    onLimitChange, onReload, prev, 
    next, queryCount
  }
}


export default useCollectionsActions;