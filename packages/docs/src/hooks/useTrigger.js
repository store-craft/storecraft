import { useState, useCallback } from 'react'

export default function useTrigger() {
  const [value, setValue] = useState(0)
  const trigger = useCallback(() => {
      setValue(v => v+1)
    }, []
  )
  return trigger
}