import { cancel, isCancel } from "@clack/prompts";

/**
 * @template T
 * @param {Promise<T>} prompt 
 * @returns {Promise<Exclude<T, symbol>>} prompt 
 */
export const withCancel = async (prompt) => {
  const v = await prompt;
  if(isCancel(v)) {
    cancel('cancelled');
    process.exit(0)
  }
  // @ts-ignore
  return v;
}

export const required = (v) => {
  if(typeof v === 'function') {
    v = v();
  }
  if(!Boolean(v))
    return 'This is Required'
}