import { cancel, isCancel } from "@clack/prompts";

/**
 * 
 * @param {Promise<any>} prompt 
 */
export const withCancel = async (prompt) => {
  const v = await prompt;
  if(isCancel(v)) {
    cancel('cancelled');
    process.exit(0)
  }
  return v;
}

export const required = (v) => {
  if(typeof v === 'function') {
    v = v();
  }
  if(!Boolean(v))
    return 'This is Required'
}