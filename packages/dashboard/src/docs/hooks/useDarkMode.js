import { useCallback, useEffect } from 'react'
import useTrigger from './useTrigger'

let darkMode = false
const subs = new Set()

const subscribe = cb => {
  subs.add(cb)
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
  const trigger = useTrigger()

  const toggle = useCallback(
    () => {
      darkMode = !darkMode
      notify()
    }
  )

  useEffect(
    () => subscribe(
      trigger
    ),
    []
  )

  return { darkMode, toggle }
}