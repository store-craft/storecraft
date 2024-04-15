import { useEffect, useRef } from "react";

/**
 * 
 * @param {(e: React.MouseEvent) => void} handler 
 * 
 */
const useOnClickOutside = (handler) => {
  
  /** @type {import("react").MutableRefObject<HTMLElement>} */
  const ref_element = useRef();

  useEffect(
    () => {
      const listener = (event) => {
        if (
          !ref_element.current || 
          ref_element.current.contains(event.target)
        ) {
          return;
        }

        handler(event);
      };

      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);

      return () => {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
      
    }, [handler]
  );

  return ref_element;
};

export default useOnClickOutside;