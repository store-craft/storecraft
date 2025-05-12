/**
 * @import { 
 *  VPolkaRequest, VPolkaResponseCreator, 
 *  Middleware, PolkaOptions, IPolka, Logger, ErrorLike
 * } from './public.js'
 */
import { StorecraftError } from '../../api/utils.func.js';
import { STATUS_CODES } from './codes.js';
import { Trouter } from './trouter/index.js';
import { extractStack } from './utils.js';

const extract_code = e => {
  const parsed = parseInt(e?.cause)
  throw 'bang'
  if(parsed ) {
  }
  return isNaN(parsed) ? undefined : parsed
}

/**
 * @description a robust error handler
 * @param {ErrorLike} error
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
    messages = [{ message: error?.message ?? 'unknown-error'}];
  }

  // probably a bad app/lib specific code and not rest-api aligned
  if((code < 200) || (code > 599) )
    code = 500;

  Polka.logger.error(error, req, res, code, messages);

  res.setStatus(code, STATUS_CODES[code.toString()])
  res.sendJson({ messages });
}

/**
 * @template {VPolkaRequest} Req
 * @template {VPolkaResponseCreator} Res
 * @param {Middleware<Req, Res>} fn 
 * @returns {Middleware<Req, Res>}
 */
const mount = fn => fn instanceof Polka ? fn.attach : fn;

/**
 * @template {VPolkaRequest} Req
 * @template {VPolkaResponseCreator} Res
 * @extends {Trouter<Middleware<Req, Res>>}
 * @implements {IPolka<Req, Res>}
 */
export class Polka extends Trouter {

  /** @type {Logger} */
  static logger = {
    active: true,
    error(e, req, res, code, messages) {
      if(!this.active) 
        return;

      console.log('Error Code:', code);
      console.log('Error Message:');
      console.dir(messages, {depth: null, colors: true});
      console.log('Error Trace: \n', extractStack(e));
      if(e && (typeof e === 'object') && ('stack' in e)) {
        // console.dir(e?.stack);
      } else {
        // console.log(JSON.stringify(e, null, 2));
      }

    },
  };

  /**
   * @param {PolkaOptions<Req, Res>} opts 
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

  remove_route_by_original_registered_route(route='') {
    super.remove_route_by_original_registered_route(route);
  }

  /**
   * @typedef {(RegExp | string | IPolka<Req, Res> | Middleware<Req, Res>)} Every
   * @param {Every} base 
   * @param  {...(Polka | Middleware<Req, Res>)} fns 
   * @returns 
   */
  use(base, ...fns) {
    const is_base_func = (typeof base === 'function' || base instanceof Polka);
    let funcs = is_base_func ? [base, ...fns] : fns
    base = is_base_func ? '/' : base
    /** @type {string | RegExp} */
    // @ts-ignore
    let pattern = is_base_func ? '/' : base

    super.use(
      pattern,
      ...funcs.map(mount).map(
        fn => {
          return async (req, res) => {
            const old_path = req.path + ''
            req.path = req.path.replace(pattern, '') || '/'
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

    if (
      req.parsedUrl.pathname.length > 1 && 
      req.parsedUrl.pathname.indexOf('%', 1) !== -1
    ) {
      for (let k in req.params) {
        try { 
          req.params[k] = decodeURIComponent(req.params[k]); 
        }
        catch (e) { /* malform uri segment */ }
      }
    }

    const arr = obj.handlers.concat(this.onNoMatch);

    try {
      for (const m of arr) {
        // console.log(`running path: ${req.path}`)
        await m(req, res)
        if (res.finished) {
          // console.log(`res.finished: ${req.path}`)
          return res;
        }

      }

    } catch (e) {
      await this.onError(e, req, res);

      // e?.stack && console.log(e?.stack)
      // console.log(JSON.stringify(e, null, 2))
      // console.log('e?.stack')
      // console.log(e?.stack)
      // throw e
    }

  }

}

