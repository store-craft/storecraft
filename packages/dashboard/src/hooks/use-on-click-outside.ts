import { useEffect, useRef } from "react";

/**
 * 
 */
const useOnClickOutside = (handler: (e: Event) => void) => {
  
  const ref_element = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      const listener = (event: MouseEvent) => {
        // event.preventDefault();
        // event.stopPropagation();
        // event.stopImmediatePropagation();

        if (
          !ref_element.current || 
          ref_element.current.contains(event.target as Node)
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