import spinners from 'cli-spinners';
import { createPrompt, usePrefix, makeTheme } from '@inquirer/core'

/**
 * @description Show a spinner for a promise
 * @param {Promise} promise 
 * @param {string} [text] 
 * @param {spinners[keyof spinners]} [spinner] 
 * @returns 
 */
export const spinner = (
  promise, text='loading...', spinner=spinners.circleHalves
) => createPrompt(
  (config, done) => {
    const theme = makeTheme({...config.theme, spinner });

    const prefix = usePrefix({ isLoading: true, theme });

    promise.then(done);

    return `${theme.style.highlight(prefix)} ${theme.style.highlight(text ?? '')}`;
  }
);

/**
 * 
 */
export const interval = (millis=5000) => {
  return new Promise(
    (resolve, reject) => {
      const id = setTimeout(
        () => {
          resolve()
        }, millis
      );

    }
  )

}

// await spinner_promise(
//   interval()
// )({})