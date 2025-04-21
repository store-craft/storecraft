import useTrigger from "@/hooks/use-trigger";
import { Children, useEffect, useRef, useState } from "react";


/**
 * 
 * @description Creates a `portal` component to bypass fixed positions in
 * highly `nested`, `transformed` components 
 * 
 */
export const createPortal = () => {

  const subs = new Set<(value: React.ReactNode) => any>();
  const map = new Map<string, React.ReactNode>();
  let main_trigger;

  const Portal: React.FC = () => {
    const [children, setChildren] = useState(undefined);
    const trigger = useTrigger();

    useEffect(
      () => {
        main_trigger = trigger;
      }, [trigger]
    );

    // console.log(map)
    return Children.toArray(map.values());
  }

  function getRandomInt(max=Number.MAX_SAFE_INTEGER) {
    return Math.floor(Math.random() * max);
  }
  
  const PortalChild: React.FC<{children?: React.ReactNode}> = ({children}) => {
    const ref_key = useRef(getRandomInt());

    useEffect(
      () => {
        map.set(ref_key.current.toString(), children);
        main_trigger?.();
      }
    );

    return children;
  }

  return {
    Portal, PortalChild
  }
}
