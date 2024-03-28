import { useState, useCallback } from 'react'

/**
 * Hook for triggering an update
 */

const useToggle = (initial=false) => {
  const [ state, setState] = useState(initial)
  const toggle = useCallback(
    () => {
      setState(v=>!v)
    }, []
  )

  return [
    state, toggle
  ]
}

export default useToggle