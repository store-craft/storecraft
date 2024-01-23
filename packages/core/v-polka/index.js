import { STATUS_CODES } from './codes.js';
import { Trouter } from './trouter/index.js';

/**
 * @typedef {import('./public.js').VPolkaRequest} VPolkaRequest 
 * @typedef {import('./public.js').VPolkaResponse} VPolkaResponse 
 * @typedef {import('./public.js').IPolka} IPolka3
 * 
 */

const extract_code = e => {
  const parsed = parseInt(e?.cause)
  return isNaN(parsed) ? undefined : parsed
}

/**
 * a robust error handler
 * @param { Error | string | { message: any, code: number } } error
 * @param {VPolkaRequest} req 
 * @param {VPolkaResponse} res 
 */
export const onError = async (error, req, res) => {
  let code = 500;
  let message = 'error';

  if(error instanceof Error) {
    code = error?.cause?.code ?? extract_code(error) ?? code;
    message = error?.message ?? message;
  } else if(typeof error === 'string') {
    message = error ?? message;
  } else {
    // assume { message: string, code: number }
    code = error?.code ?? code;
    message = error?.message ?? message;
  }

  res.setStatus(code, STATUS_CODES[code.toString()])
  res.sendJson({ error: message });
}

/**
 * @template {VPolkaRequest} Req
 * @template {VPolkaResponse} Res
 * @param {import('./public.js').Middleware<Req, Res>} fn 
 * @returns {import('./public.js').Middleware<Req, Res>}
 */
const mount = fn => fn instanceof Polka ? fn.attach : fn;

/**
 * @template {VPolkaRequest} Req
 * @template {VPolkaResponse} Res
 * @extends {Trouter<import('./public.js').Middleware<Req, Res>>}
 * @implements {import('./public.js').IPolka<Req, Res>}
 */
export class Polka extends Trouter {

  /**
   * 
   * @param {import('./public.js').PolkaOptions<Req, Res>} opts 
   */
  constructor(opts = {}) {
    super();

    this.opts = opts;
    this.handler = this.handler.bind(this);
    this.onError = opts.onError || onError; // catch-all handler
    this.onNoMatch = opts.onNoMatch ||
    this.onError.bind(null, { status: 404, message: 'Unavailable' });
    this.attach = async (req, res) => await this.handler(req, res);
  }

  /**
   * @typedef {(RegExp | string | Polka | import('./public.js').Middleware<Req, Res>)} Every
   * @param {Every} base 
   * @param  {...(Polka | import('./public.js').Middleware<Req, Res>)} fns 
   * @returns 
   */
  use(base, ...fns) {
    const is_base_func = (typeof base === 'function' || base instanceof Polka);
    let funcs = is_base_func ? [base, ...fns] : fns
    base = is_base_func ? '/' : base

    super.use(
      base,
      ...funcs.map(mount).map(
        fn => {
          return async (req, res) => {
            const old_path = req.path + ''
            req.path = req.path.replace(base, '') || '/'
            await fn(req, res);
            req.path = old_path // reset 
          }
        }
      )
    );

    return this;
  }

  /**
   * @param {Req} req 
   * @param {Res} res 
   */
  async handler(req, res) {
    req.parsedUrl = req?.parsedUrl ?? new URL(req.url, 'http://host');
    req.path = req.path ?? req.parsedUrl.pathname
    // const url = new URL(req.url, 'https://host')
    let obj = this.find(req.method, req.path);

    req.query = req.parsedUrl.searchParams;
    req.params = obj.params;

    if (req.parsedUrl.pathname.length > 1 && req.parsedUrl.pathname.indexOf('%', 1) !== -1) {
      for (let k in req.params) {
        try { req.params[k] = decodeURIComponent(req.params[k]); }
        catch (e) { /* malform uri segment */ }
      }
    }

    const arr = obj.handlers.concat(this.onNoMatch);

    try {
      for (const m of arr) {
        console.log(`running path: ${req.path}`)
        await m(req, res)
        console.log(`res.finished: ${res.finished}`)
        if (res.finished) {
          return res;
        }

      }

    } catch (e) {
      await this.onError(e, req, res);
      console.log(e?.stack)
      // throw e
    }

  }

}

