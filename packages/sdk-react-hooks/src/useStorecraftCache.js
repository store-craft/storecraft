import { useCallback } from "react";
import { useIndexDB } from "./useIndexDB.js"
import { 
  api_query_to_searchparams 
} from "@storecraft/core/v-api/utils.query.js";


/**
 * 
 * @template {import("@storecraft/core/v-api").BaseType} T
 * 
 * 
 * @returns {ReturnType<typeof useIndexDB<T>>}
 * 
 */
export const useDocumentCache = () => {
  return useIndexDB('storecraft_document_cache');
}


/**
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
      const key = resource + '_' + api_query_to_searchparams(query).toString();
      return _remove(key);
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