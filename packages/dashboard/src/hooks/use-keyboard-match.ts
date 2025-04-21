import { useEffect } from "react";

export type KeyboardMatch = string[];

/**
 * Create a `hook`, that matches any of the given keyboard matches.
 */
export const createKeyboardMatchHook = (...matches: KeyboardMatch[]) => {

  return (onMatch: (match: KeyboardMatch) => void) => {

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
  
        const onKeyDown = (e: KeyboardEvent) => {
          // e.preventDefault();

          magic[e.key] = true;
          // console.log(e.key)
  
          fireIfMatch();
        }
        const onKeyUp = (e: KeyboardEvent) => {
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
