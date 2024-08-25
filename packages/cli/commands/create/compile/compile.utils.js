import * as prettier from "prettier";


/**
 * @description use `prettier` package to prettify the code
 * @param {string} source 
 * @param {prettier.Options} options 
 */
export const prettify = (source, options={}) => {
  return prettier.format(
    source, 
    {
      ...options, tabWidth: 2, printWidth: 50, semi: false, parser: 'babel-ts'
    }
  );
}
