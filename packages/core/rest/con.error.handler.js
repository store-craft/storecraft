/**
 * @import { VPolkaRequest, VPolkaResponseCreator } from './polka/public.js'
 */
import { StorecraftError } from "../api/utils.func.js";
import { STATUS_CODES } from "./polka/codes.js";

/**
 * a robust error handler
 * @param { StorecraftError | Error | string | { message: any, code: number } } error
 * @param {VPolkaRequest} req 
 * @param {VPolkaResponseCreator} res 
 */
export const onError = async (error, req, res) => {
  let code = 500;
  let messages;

  if(error instanceof StorecraftError) {
    code = error?.code ?? extract_code(error) ?? code;

    messages = error?.message ?? 'unknown-error';
    if(!Array.isArray(messages)) {
      messages = [{message: messages}];
    }
  } else if(typeof error === 'string') {
    messages = [{ message: error ?? 'unknown-error'}];
  } else {
    // assume { message: string, code: number }
    code = (error && ('code' in error)) ? error?.code : code;
    messages = [{ message: error.message ?? 'unknown-error'}];
  }

  // probably a bad app/lib specific code and not rest-api aligned
  if((code < 200) || (code > 599) )
    code = 500;

  res.setStatus(code, STATUS_CODES[code.toString()])
  res.sendJson({ messages });
}

const extract_code = e => {
  const parsed = parseInt(e?.cause)
  return isNaN(parsed) ? undefined : parsed
}
