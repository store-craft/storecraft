import { useEffect } from "react";


/**
 * 
 * Create a `hook`, that matches any of the given keyboard matches.
 * 
 * @typedef {string[]} KeyboardMatch
 * 
 * @param  {...KeyboardMatch} matches 
 */
export const createKeyboardMatchHook = (...matches) => {

  /**
   * @param {(match: KeyboardMatch) => void} onMatch
   */
  return (onMatch) => {

    useEffect(
      () => {
        let magic = {};
  
        /** @param {KeyboardEvent} e */
        const fireIfMatch = (e) => {
          // console.log(magic);

          const match = matches.find(
            match => {
              return match.every(key => Boolean(magic?.[key]))
            }
          );

          if(match) {
            e.preventDefault();

            magic = {};

            onMatch && onMatch(match);

            // console.log('woop')
          }
        }
  
        /** @param {KeyboardEvent} e */
        const onKeyDown = e => {
          magic[e.key] = true;
  
          fireIfMatch(e);
        }
        /** @param {KeyboardEvent} e */
        const onKeyUp = e => {
          magic[e.key] = false;
          // console.log(magic)
        }
  
        document.addEventListener(
          'keydown', onKeyDown
        );
        document.addEventListener(
          'keyup', onKeyUp
        );
  
        return () => {
          magic = {};
          document.removeEventListener('keydown', onKeyDown);
          document.removeEventListener('keyup', onKeyUp);
        }
      }, [matches, onMatch]
    );
  }
}
