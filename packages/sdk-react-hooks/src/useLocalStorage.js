import { useCallback, useEffect } from 'react'
import useTrigger from './useTrigger.js'
import { LS } from './utils.browser.js';

/**
 * A hook like `useState` but for local storage
 * 
 * TODO: add cross tabs state with 
 * 
 * @template S
 * 
 * @param {string} key 
 * @param {S} defaultValue 
 */
export const create_local_storage_hook = (key, defaultValue) => {
  
  const KEY = key;

  /** @type {S} */
  let state = LS.get(KEY) ?? defaultValue;

  /** @type {Set<(state: S) => void>} */
  const subs = new Set();

  /**
   * @param {(state: S) => void} cb 
   */
  const subscribe = cb => {
    subs.add(cb)
    return () => {
      subs.delete(cb)
    }
  }
  
  /**
   * @param {S} $state 
   */
  const notify = ($state) => {
    state = $state;
    LS.set(KEY, $state);
    subs.forEach(
      cb => cb(state)
    );
  }
    

  return () => {
    const trigger = useTrigger();
  
    useEffect(
      () => subscribe(
        trigger
      ),
      [trigger]
    );

    const setState = useCallback(
      /**
       * @param {S} $state 
       */
      ($state) => {
        let new_state = $state;
        if(typeof $state === 'function') {
          new_state = $state(state);
        }
        notify($state);
      }, []
    );
  
    return {
      state, setState
    }
  }
}
