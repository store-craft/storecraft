import { useCallback } from "react";
import { useIndexDB } from "./useIndexDB.js"
import { 
  api_query_to_searchparams 
} from "@storecraft/core/v-api/utils.query.js";

/**
 * []
 * @template T
 * 
 * @typedef {ReturnType<typeof useDocumentCache<T>>} inferDocumentCache
 * 
 */


/**
 * 
 * A `react-hook` for managing cached documents
 * 
 * 
 * @template {import("@storecraft/core/v-api").BaseType} T
 * 
 */
export const useDocumentCache = () => {
  /** @type {ReturnType<typeof useIndexDB<T>>} */
  const {
    db, error,
    actions: {
      get: _get, put: _put, remove: _remove
    }
  } = useIndexDB('storecraft_document_cache');


  const get = useCallback(
    /**
     * @param {string} id_or_handle the `document`'s `id` or `handle`
     */
    (id_or_handle) => {
      return _get(id_or_handle);
    }, [_get]
  );


  /**
   * Put a `document`, the key, that will be used for
   * `fetching` are both `id` or `handle` (if has it)
   */
  const put = useCallback(
    /**
     * @param {T} item 
     */
    async (item) => {
      try {
        const promises = [];
        if(item?.handle) {
          promises.push(_put(item.handle, item));
        }
        promises.push(_put(item.id, item));
  
        await Promise.all(promises);
      } catch (e) {
        
      }

      return item.id;
    }, [_put]
  );


  /**
   * `Put` with your own key instead of automatic `put`
   */
  const putWithKey = useCallback(
    /**
     * @param {string} key 
     * @param {T} item 
     */
    async (key, item) => {
      try { 
        await _put(key, item);
      } catch (e) {
      }
      return item.id;
    }, [_put]
  );

  
  const remove = useCallback(
    /**
     * @param {string} id_or_handle the `document`'s `id` or `handle`
     * 
     */
    (id_or_handle) => {
      try {
        return _remove(id_or_handle);
      } catch (e) {
      }
    }, [_remove]
  );


  return {
    db,
    error,
    actions: {
      get,
      put, 
      putWithKey,
      remove
    }
  }
}

/**
 * 
 * A `react-hook` for managing misc cached
 * 
 */
export const useMiscCache = () => {
  return useIndexDB('storecraft_misc_cache');
}


/**
 * 
 * @template T
 * 
 * @typedef {ReturnType<typeof useQueryCache<T>>} inferUseQueryCache
 * 
 */

/**
 * A `react-hook` for managing cached queries
 * 
 * 
 * @template {import("@storecraft/core/v-api").BaseType} T
 * 
 * 
 */
export const useQueryCache = () => {
  /** @type {ReturnType<typeof useIndexDB<T[]>>} */
  const {
    db, error,
    actions: {
      get: _get, put: _put, remove: _remove
    }
  } = useIndexDB('storecraft_query_cache');


  const get = useCallback(
    /**
     * @param {string} resource the `table` / `resource` name
     * @param {import("@storecraft/core/v-api").ApiQuery} query 
     * 
     */
    (resource, query) => {
      const key = resource + '_' + api_query_to_searchparams(query).toString();
      return _get(key);
    }, [_get]
  );


  const put = useCallback(
    /**
     * @param {string} resource the `table` / `resource` name
     * @param {import("@storecraft/core/v-api").ApiQuery} query 
     * @param {T[]} items 
     * 
     */
    (resource, query, items) => {
      const key = resource + '_' + api_query_to_searchparams(query).toString();
      return _put(key, items);
    }, [_put]
  );

  
  const remove = useCallback(
    /**
     * @param {string} resource the `table` / `resource` name
     * @param {import("@storecraft/core/v-api").ApiQuery} query 
     * 
     */
    (resource, query) => {
      try {
        const key = resource + '_' + api_query_to_searchparams(query).toString();
        return _remove(key);
      } catch (e) {

      }
    }, [_remove]
  );


  return {
    db,
    error,
    actions: {
      get,
      put,
      remove
    }
  }

}