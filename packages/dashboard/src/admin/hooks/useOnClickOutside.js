import { useEffect, useRef } from "react";

/**
 * 
 * @param {(e: Event) => void} handler 
 * 
 */
const useOnClickOutside = (handler) => {
  
  /** @type {import("react").MutableRefObject<HTMLElement>} */
  const ref_element = useRef();

  useEffect(
    () => {
      /**
       * @param {MouseEvent} event
       */
      const listener = (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (
          !ref_element.current || 
          ref_element.current.contains(event.target)
        ) {
          return;
        }

        // console.log('listener');

        handler(event);
      };

      /**
       * @param {KeyboardEvent} event
       */
      const listener2 = (event) => {

        if (event.key !== 'Escape') 
          return;

        // event.preventDefault();
        // event.stopPropagation();
        // event.stopImmediatePropagation();

        // console.log('listener2');

        handler(event);
      };
      
      document.addEventListener("click", listener);
      document.addEventListener("keydown", listener2);

      return () => {
        document.removeEventListener("click", listener);
        document.removeEventListener("keydown", listener2);
      };
      
    }, [handler]
  );

  return ref_element;
};

export default useOnClickOutside;