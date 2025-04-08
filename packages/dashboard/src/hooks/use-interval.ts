import { useCallback, useEffect, useRef } from 'react'

/**
 * can be a finite integer or `Number.POSITIVE_INFINITY`
 */
const useInterval = (
  cb: (count: number)=>void, 
  millis=5000, 
  autoStart=true, 
  runCount=Number.POSITIVE_INFINITY
) => {

  const ref_id = useRef<ReturnType<typeof setInterval>>(undefined);
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