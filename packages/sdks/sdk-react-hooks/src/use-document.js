/**
 * @import { inferDocumentCache, inferUseQueryCache } from './use-storecraft-cache.js'
 */
import { useCallback, useEffect, useRef, useState } from "react"
import useTrigger from "./use-trigger.js"
import { useStorecraft } from "./use-storecraft.js";
import { useDocumentCache } from "./use-storecraft-cache.js";
import { 
  get_from_collection_resource as sdk_get, upsert_to_collection_resource as upsert_sdk, remove_from_collection_resource as sdk_remove 
} from "@storecraft/sdk/src/utils.api.fetch.js";

/**
 * @template T the `document` type
 * 
 * @typedef {Omit<ReturnType<typeof useDocument<T>>, 'doc'> & 
 *  {
 *    doc: T
 *  }
 * } useDocumentHookReturnType This `type` will give you the return type of the hook
 * 
 */


/**
 * @typedef {'load' | 'update' | 'delete'} Op
 */

/**
 * @template {any} T the document type
 * 
 * @param {string} resource the table `identifier`
 * @param {string} document the document `id` or `handle`
 * @param {boolean} autoLoad 
 * @param {boolean} try_cache_on_autoload 
 * 
 */
export function useDocument(
  resource, document, 
  autoLoad=true, 
  try_cache_on_autoload=true
) {

  /** @type {inferDocumentCache<T>} */
  const {
    actions: {
      get: cache_document_get,
      put: cache_document_put, 
      remove: cache_document_remove
    }
  } = useDocumentCache();
  const { sdk } = useStorecraft();
  const [loading, setLoading] = useState(
    (resource && document && autoLoad) ? true : false
  );
  
  /** @type {ReturnType<typeof useState<T>>} */
  const [data, setData] = useState()
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState(undefined);
  /** @type {ReturnType<typeof useState<Op>>} */
  const [op, setOp] = useState(undefined);
  const trigger = useTrigger();

  useEffect(
    () => sdk.auth.add_sub(trigger)
    , [trigger]
  );

  const location = useRef([resource, document])
  useEffect(
    () => {
      location.current = [resource, document];
    },  [resource, document]
  );

  const reload_hard = useRef(
    async (try_cache=true) => {
      const resource = location.current[0];
      const document = location.current[1];

      if(!(resource && document)) {
        throw 'no doc id';
      }

      setLoading(true);
      setError(undefined);
      setOp('load');

      try {

        /** @type {T} */
        let item;

        if(try_cache) {
          item = await cache_document_get(document);
          
          // found in cache
          if(item) {
            // background fetch from server
            sdk_get(sdk, resource, document)
            .then(
              /** @param {T} item_server  */
              item_server => {
                cache_document_put(item_server);
                setData(item_server);
              }
            );
          }

        }

        if(!item) {
          item = await sdk_get(sdk, resource, document);

          cache_document_put(item);
        }

        // console.log('item', item)
        setData(item);
        setHasLoaded(true);

        return item;
      } catch (e) {
        console.log(e);

        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }

    }
  );

  const reload = useCallback(
    async (try_cache=true) => {
      const resource = location.current[0];
      const document = location.current[1];

      if(!(resource && document)) {
        console.log('resource', resource)
        console.log('document', document)
        throw 'no doc id';
      }

      setLoading(true);
      setError(undefined);
      setOp('load');

      try {

        /** @type {T} */
        let item;

        if(try_cache) {
          item = await cache_document_get(document);
          
          // found in cache
          if(item) {
            // background fetch from server
            sdk_get(sdk, resource, document)
            .then(
              /** @param {T} item_server  */
              item_server => {
                cache_document_put(item_server);
                setData(item_server);
              }
            );
          }
        }

        if(!item) {
          item = await sdk_get(sdk, resource, document);

          cache_document_put(item);
        }

        // console.log('item', item)
        setData(item);
        setHasLoaded(true);

        return item;
      } catch (e) {
        console.log(e);

        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }

    }, []
  );

  const upsert = useCallback(
    /**
     * 
     * @param {T} new_data 
     * @param  {...any} extra 
     * @returns {Promise<T>}
     */
    async (new_data, ...extra) => {
      setLoading(true)
      setError(undefined)
      setOp('update')

      try {
        const id = await upsert_sdk(sdk, resource, new_data);
        
        /** @type {T} */
        const saved_data = await sdk_get(sdk, resource, id);

        setData(saved_data);
        setHasLoaded(true);

        return saved_data;
      } catch(e) {
        setError(e);

        console.log(JSON.stringify(e, null, 2));

        throw e;

      } finally {
        setLoading(false)
      }

    }, [resource, document]
  );

  const remove = useCallback(
    async () => {
      setLoading(true);
      setError(undefined);
      setOp('delete');

      try {
        await sdk_remove(sdk, resource, document);

        cache_document_remove(document);

        setData(undefined);
        setHasLoaded(true);

        return document;
      } catch (e) {
        setError(e);

        throw e;
      } finally {
        setLoading(false);
      }

    }, [resource, document]
  );

  useEffect(
    () => {
      if(resource==undefined)
        throw new Error('useDocument: no Collection Id');
        
      setData(undefined);

    }, [resource, document]
  );

  useEffect(
    () => {
      if (autoLoad) 
        reload(try_cache_on_autoload);
      
    }, [autoLoad, reload, resource, document]
  );

  return {
    doc: data, 
    sdk,
    loading, 
    hasLoaded, 
    error, 
    op, 
    resource,
    document,
    actions: { 
      reload, reload_hard, upsert, 
      remove, 
      setError,
    }
  }
}

