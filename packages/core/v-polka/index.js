import { STATUS_CODES } from './codes.js';
import { Trouter } from './trouter/index.js';

/**
 * @typedef {import('./public.js').IPolka} IPolka
 * @typedef {import('./public.js').PolkaOptions} PolkaOptions
 * @typedef {import('./public.js').Middleware} Middleware
 * @typedef {import('./public.js').VPolkaRequest} VPolkaRequest 
 * @typedef {import('./public.js').VPolkaResponse} VPolkaResponse 
 * 
 * @param {import('./public.js').IError} err 
 * @param {VPolkaRequest} req 
 * @param {VPolkaResponse} res 
 */
async function onError(err, req, res) {
  let code = err?.code ?? err?.cause ?? 500;
  code = res.status = code;
  res.setStatus(code, STATUS_CODES[code.toString()])
  res.sendJson(err.message);
}

/**
 * 
 * @param {Middleware | Polka} fn 
 * @returns {Middleware}
 */
const mount = fn => fn instanceof Polka ? fn.attach : fn;

/**
 * 
 * @extends {Trouter<Middleware>}
 * @implements {IPolka}
 */
export class Polka extends Trouter {

  /**
   * 
   * @param {PolkaOptions} opts 
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
   * @typedef {(RegExp | string | IPolka | Middleware)} Every
   * @param {Every} base 
   * @param  {...(IPolka | Middleware)} fns 
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
   * @param {VPolkaRequest} req 
   * @param {VPolkaResponse} res 
   */
  async handler(req, res) {

    req.parsedUrl = req?.parsedUrl ?? new URL(req.url, 'http://host');
    req.path = req.path ?? req.parsedUrl.pathname
    // const url = new URL(req.url, 'https://host')
    let obj = this.find(req.method, req.path);

    req.searchParams = req.parsedUrl.searchParams;
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

