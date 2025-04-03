import { useCallback, useEffect, useRef } from 'react'

/**
 * 
 * @param {(count: number)=>void} cb 
 * @param {number} [millis=5000] 
 * @param {boolean} [autoStart=true]
 * @param {number} [runCount=Number.POSITIVE_INFINITY] 
 * can be a finite integer or `Number.POSITIVE_INFINITY`
 */
const useInterval = (
  cb, millis=5000, autoStart=true, 
  runCount=Number.POSITIVE_INFINITY
) => {

  /** @type {import('react').MutableRefObject<ReturnType<setInterval>>} */
  const ref_id = useRef();
  const ref_info = useRef(
    {
      count: 0
    }
  );

  const stop = useCallback(
    () => {
      ref_id.current && clearTimeout(ref_id.current)
    }, []
  );

  const start = useCallback(
    () => {
      stop();

      ref_info.current.count = 1;

      cb(1);

      ref_id.current = setInterval(
        () => {
          ref_info.current.count += 1;

          cb(ref_info.current.count);

          if(ref_info.current.count==runCount)
            stop();

        }, millis
      );

    }, [stop, millis]
  );

  useEffect(
    () => {
      stop();

      if(autoStart)
        start();

      return stop;
    }, [start, stop]
  );

  return {
    start, stop
  }

}

export default useInterval;