import { useCallback, useEffect } from 'react'
import useTrigger from './useTrigger.js'

let darkMode = true;
const subs = new Set();

/**
 * 
 * @param {(v: boolean) => void} cb 
 * 
 * @returns {() => void}
 */
const subscribe = cb => {
  subs.add(cb);

  return () => {
    subs.delete(cb)
  }
}

const notify = () => {
  subs.forEach(
    cb => cb(darkMode)
  )
}



export default function useDarkMode() {
  const trigger = useTrigger();

  const toggle = useCallback(
    () => {
      darkMode = !darkMode;

      notify();
    }, [notify, darkMode]
  );

  useEffect(
    () => subscribe(
      trigger
    ),
    []
  );

  return { 
    darkMode, 
    toggle 
  }
}