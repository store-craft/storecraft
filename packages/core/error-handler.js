import { STATUS_CODES } from './v-polka/codes';

/**
 * a robust error handler
 * @param { Error | string | { message: string, code: number } } error
 * @param {import('./types.public.js').VPolkaRequest} req
 * @param {import('./types.public.js').VPolkaResponse} res
 */
export const error_handler = (error, req, res) => {
  let code = 500;
  let message = 'error';

  if(error instanceof Error) {
    code = error?.cause?.code ?? code;
    message = error?.message ?? message;
  } else if(typeof error === 'string') {
    message = error ?? message;
  } else {
    // assume { message: string, code: number }
    code = error?.code ?? code;
    message = error?.message ?? message;
  }

  res.setStatus(code, STATUS_CODES[code.toString()])
  res.sendJson(message);
}