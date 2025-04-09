import { useCallback, useEffect } from 'react'
import useTrigger from './use-trigger.ts'

let darkMode = true;
type Subscriber = (v: boolean) => void;
const subs = new Set<Subscriber>();

const subscribe = (cb: Subscriber) => {
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