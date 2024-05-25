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
  
        const fireIfMatch = () => {
          // console.log(magic);

          const match = matches.find(
            match => {
              return match.every(key => Boolean(magic?.[key]))
            }
          );

          if(match) {
            magic = {};

            onMatch && onMatch(match);

            // console.log('woop')
          }
        }
  
        /** @param {KeyboardEvent} e */
        const onKeyDown = e => {
          // e.preventDefault();

          magic[e.key] = true;
          console.log(e.key)
  
          fireIfMatch();
        }
        /** @param {KeyboardEvent} e */
        const onKeyUp = e => {
          // console.log(magic)
          magic[e.key] = false;
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
