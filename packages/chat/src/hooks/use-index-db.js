import { 
  useCallback, useEffect, useState 
} from 'react'

/**
 * 
 * @param {string} name 
 * 
 * 
 * @returns {Promise<IDBDatabase>}
 * 
 */
const idb_database = (name) => new Promise(
  (resolve, reject) => {

    let request = indexedDB.open(name, 1);

    /**
     * 
     * @param {IDBVersionChangeEvent} event 
     */
    request.onupgradeneeded = function(event) {
      // Save the IDBDatabase interface
      const db = (/** @type {IDBOpenDBRequest} */(event.target)).result;
      
      // Create an objectStore for this database
      db.createObjectStore('main');
      
    };
    
    /**
     * @param {Event} event 
     */
    request.onsuccess = function (event) {
      resolve(
        (/** @type {IDBOpenDBRequest} */(event.target)).result
      );
    }
    
    /**
     * @param {Event} event 
     */
    request.onerror = function(event) {
      reject(
        (/** @type {IDBOpenDBRequest} */(event.target)).error
      );
    };
  }
);

/**
 * 
 * @template T
 * 
 * 
 * @param {string} db_name 
 * @param {string} [object_store_name='main'] 
 * 
 * 
 * @returns {(key: string, value: T) => Promise<string>}
 * 
 */
const idb_put = (db_name, object_store_name='main') => {
  /**
   * @param {string} key
   * @param {T} value
   */
  return (key, value) => new Promise(
    (resolve, reject) => {

      idb_database(db_name)
      .then(
        db => {
          let transaction = db.transaction(object_store_name, "readwrite");
          let objectStore = transaction.objectStore(object_store_name);
          
          let putRequest = objectStore.put(value, key);
          
          putRequest.onsuccess = function(event) {
            const _key = (/** @type {typeof putRequest} */ (event.target)).result;

            if(key===_key)
              resolve(key);
            else reject();
          };

          putRequest.onerror = function (event) {
            reject((/** @type {typeof putRequest} */ (event.target)).error);
          }
        }
      )
      .catch(reject);
    }
  );
}

/**
 * 
 * @template T
 * 
 * 
 * @param {string} db_name 
 * @param {string} [object_store_name='main'] 
 * 
 * 
 * @returns {(key: string) => Promise<T>}
 * 
 */
const idb_get = (db_name, object_store_name='main') => {
  /**
   * @param {string} key
   */
  return (key) => new Promise(
    (resolve, reject) => {

      idb_database(db_name)
      .then(
        db => {
          let transaction = db.transaction(object_store_name, "readwrite");
          let objectStore = transaction.objectStore(object_store_name);
          let getRequest = objectStore.get(key);

          getRequest.onsuccess = function(event) {
            const value = (/** @type {typeof getRequest} */ (event.target)).result;
            if(value)
              resolve(value);
            else reject();
          };

          getRequest.onerror = function (event) {
            reject((/** @type {typeof getRequest} */ (event.target)).error);
          }
        }
      )
      .catch(reject);
    }
  );
}

/**
 * 
 * @param {string} db_name 
 * @param {string} [object_store_name='main'] 
 * 
 * 
 * @returns {(key: string) => Promise<string>}
 * 
 */
const idb_remove = (db_name, object_store_name='main') => {
  /**
   * @param {string} key
   */
  return (key) => new Promise(
    (resolve, reject) => {

      idb_database(db_name)
      .then(
        db => {
          let transaction = db.transaction(object_store_name, "readwrite");
          let objectStore = transaction.objectStore(object_store_name);
          let request = objectStore.delete(key);

          request.onsuccess = function(event) {
            resolve(key);
          };

          request.onerror = function (event) {
            reject((/** @type {typeof request} */ (event.target)).error);
          }
        }
      )
      .catch(reject);
    }
  );
}

/**
 * A `react hook` for using `IndexDB` at the browser.
 * Useful for creating cache systems
 * 
 * 
 * @template {unknown} [T=unknown]
 * 
 * @param {string} db_name 
 */
export const useIndexDB = (db_name) => {

  /** @type {ReturnType<typeof useState<IDBDatabase>>} */
  const[db, setDb] = useState();
  const[error, setError] = useState();

  useEffect(
    () => {
      idb_database(db_name).
        then(setDb).
        catch(setError);
    }, [db_name]
  );

  const put = useCallback(
    /**
     * 
     * @param {string} key 
     * @param {T} value 
     */
    async (key, value) => {
      try {
        const result = await idb_put(db_name, 'main')(key, value);

        return result;
      } catch (e) {
        // @ts-ignore
        setError(e);
      }

      return undefined;
    }, []
  );

  const get = useCallback(
    /**
     * 
     * @param {string} key 
     * 
     * @returns {Promise<T | undefined>}
     */
    async (key) => {
      try {
        const result = await idb_get(db_name, 'main')(key);

        return result;
      } catch (e) {
        // @ts-ignore
        setError(e);
      }

      return undefined;
    }, []
  );

  const remove = useCallback(
    /**
     * 
     * @param {string} key 
     */
    async (key) => {
      try {
        const result = await idb_remove(db_name, 'main')(key);

        return result;
      } catch (e) {
        // @ts-ignore
        setError(e);
      }

      return undefined;
    }, []
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