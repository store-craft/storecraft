import useTrigger from "@/hooks/useTrigger.js";
import { Children, useEffect, useRef, useState } from "react";


/**
 * 
 * @description Creates a `portal` component to bypass fixed positions in
 * highly `nested`, `transformed` components 
 * 
 */
export const createPortal = () => {

  /** @type {Set<(value: React.ReactNode) => any>} */
  const subs = new Set();
  /** @type {Map<string, React.ReactNode>} */
  const map = new Map();
  let main_trigger;

  /**
   * 
   * @type {React.FC<{}>}
   */
  const Portal = () => {
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
  
  /**
   * 
   * @type {React.FC<{children?: React.ReactNode}>}
   */
  const PortalChild = ({children}) => {
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
