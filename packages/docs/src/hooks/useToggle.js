import { useState, useCallback } from 'react'


/**
 * 
 * @param {boolean} [initialValue=false] 
 * 
 * @returns {[boolean, Function]}
 */
export default function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(
    () => {
      setValue(v => !v);
    }, []
  );

  return [value, toggle];
}