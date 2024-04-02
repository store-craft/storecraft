import { useCallback, useEffect } from 'react'
import useTrigger from './useTrigger.js'
import { getSDK } from '@/admin-sdk/index.js'

let darkMode = false
const subs = new Set()

const subscribe = cb => {
  subs.add(cb)
  return () => {
    subs.delete(cb)
  }
}

const notify = () => {
  getSDK().perfs.set('dark_mode', darkMode)
  subs.forEach(
    cb => cb(darkMode)
  )
}

/**
 * @param {boolean} [defaultValue] 
 */
export default function useDarkMode(defaultValue=true) {
  const trigger = useTrigger()

  const toggle = useCallback(
    () => {
      darkMode = !darkMode
      notify()
    }, []
  )

  useEffect(
    () => {
      darkMode = getSDK().perfs.get('dark_mode') ?? false; 
      notify();
      trigger();
    }, [trigger]
  )

  useEffect(
    () => subscribe(
      trigger
    ),
    [trigger]
  )

  return { darkMode, toggle }
}