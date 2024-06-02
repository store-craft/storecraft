import { useEffect, useState } from "react";


/**
 * 
 * Create a `portal` component to bypass fixed positions in
 * highly `nested`, `transformed` coponents 
 * 
 */
export const createPortal = () => {

  /** @type {Set<(value: React.ReactNode) => any>} */
  const subs = new Set();

  /**
   * 
   * @type {React.FC<{}>}
   */
  const Portal = () => {
    const [children, setChildren] = useState(undefined);

    useEffect(
      () => {
        subs.add(setChildren);

        return () => {
          subs.delete(setChildren);
        }
      }, []
    );

    return children;
  }

  /**
   * 
   * @type {React.FC<{children?: React.ReactNode}>}
   */
  const PortalChild = ({children}) => {
    if (children) {
      subs.forEach(
        it => {
          it(children);
        }
      )
    }

    return undefined;
  }

  return {
    Portal, PortalChild
  }
}
