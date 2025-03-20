import { useState, useCallback, useEffect, useRef } from "react";


/**
 * Hook for triggering an update
 */
const useTrigger = () => {
  const [ count, setCount] = useState(0);
  const cb = useCallback(
    () => {
      setCount(v=>++v)
    }, []
  );
  return cb;
}

export default useTrigger