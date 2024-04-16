import { useState, useCallback } from 'react'


/**
 * Hook for triggering an update
 */
const useTrigger = () => {
  const [ count, setCount] = useState(0)
  const cb = useCallback(
    () => {
      setCount(v=>++v);
      return count;
    }, []
  )
  return cb;
}

export default useTrigger