import { 
  useCallback, useEffect, 
  useRef, useState } from 'react'
import useTrigger from './useTrigger.js'
import { list } from '@storecraft/sdk/src/utils.api.fetch.js'
import { App } from '@storecraft/core'
import { useStorecraft } from './useStorecraft.js'
import { StorecraftSDK } from '@storecraft/sdk'

const DB_NAME = 'storecraft_local_cache'

/**
 * 
 * @param {string} name 
 * 
 * 
 * @returns {Promise<IDBDatabase>}
 */
const get_database = (name) => new Promise(
  (resolve, reject) => {

    let request = indexedDB.open(name, 1);

    /**
     * 
     * @param {IDBVersionChangeEvent} event 
     */
    request.onupgradeneeded = function(event) {
      // Save the IDBDatabase interface
      /** @type {IDBDatabase} */
      const db = event.target.result;
      
      // Create an objectStore for this database
      db.createObjectStore("queries");
      db.createObjectStore("documents");
    };
    
    /**
     * @param {Event} event 
     */
    request.onsuccess = function (event) {
      resolve(event.target.result);
    }
    
    /**
     * @param {Event} event 
     */
    request.onerror = function(event) {
      reject(event.target.errorCode);
    };
  }
);

/**
 * 
 * @template T
 * 
 * 
 * @param {string} db_name 
 * @param {string} object_store_name 
 * 
 * 
 * @returns {(key: string, value: T) => Promise<string>}
 */
const put = (db_name, object_store_name) => {
  /**
   * @param {string} key
   * @param {T} value
   */
  return (key, value) => new Promise(
    (resolve, reject) => {

      get_database(db_name)
      .then(
        db => {
          let transaction = db.transaction(object_store_name, "readwrite");
          let objectStore = transaction.objectStore(object_store_name);
          
          let putRequest = objectStore.put(value, key);
          
          putRequest.onsuccess = function(event) {
            const _key = event.target.result;

            if(key===_key)
              resolve(key);
            else reject();
          };

          putRequest.onerror = function (event) {
            reject(event.target.errorCode);
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
 * @param {string} object_store_name 
 * 
 * 
 * @returns {(key: string) => Promise<T>}
 */
const get = (db_name, object_store_name) => {
  /**
   * @param {string} key
   */
  return (key) => new Promise(
    (resolve, reject) => {

      get_database(db_name)
      .then(
        db => {
          let transaction = db.transaction(object_store_name, "readwrite");
          let objectStore = transaction.objectStore(object_store_name);
          let getRequest = objectStore.get(key);

          getRequest.onsuccess = function(event) {
            const value = event.target.result;
            if(value)
              resolve(value);
            else reject();
          };

          getRequest.onerror = function (event) {
            reject(event.target.errorCode);
          }
        }
      )
      .catch(reject);
    }
  );
}

export const useCache = () => {




}