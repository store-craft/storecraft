/**
 * This middleware was taken from the `hono` project
 */

/**
 * @typedef {object} CORSOptions
 * @property {string | string[] | ((origin: string) => string | undefined | null)} origin
 * @property {string[]} [allowMethods]
 * @property {string[]} [allowHeaders]
 * @property {string[]} [exposeHeaders]
 * @property {number} [maxAge]
 * @property {boolean} [credentials]
 */

export const CORSDefault = {
  origin: '*',
  allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'],
  allowHeaders: [],
  exposeHeaders: ['*'],
}

/**
 * 
 * @param {CORSOptions} [options] 
 * @returns 
 */
export const cors = (options) => {
  const opts = {
    ...CORSDefault,
    ...(options ?? {}),
  }

  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === 'string') {
      return () => optsOrigin
    } else if (typeof optsOrigin === 'function') {
      return optsOrigin
    } else {
      /**
       * @param {string} origin
       */
      return (origin) => (optsOrigin.includes(origin) ? origin : optsOrigin[0])
    }
  })(opts.origin);

  /**
   * @param {import("../rest/types.public.d.ts").ApiRequest} req
   * @param {import("../rest/types.public.d.ts").ApiResponse} res
   */
  return async function cors(req, res) {

    /**
     * @param {string} key 
     * @param {string} value 
     */
    function set(key, value) {
      res.headers.set(key, value)
    }

    const allowOrigin = findAllowOrigin(req.headers.get('origin') || '')
    if (allowOrigin) {
      set('Access-Control-Allow-Origin', allowOrigin)
    }

    // Suppose the server sends a response with an 
    // Access-Control-Allow-Origin value with an explicit 
    // origin (rather than the "*" wildcard).
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
    if (opts.origin !== '*') {
      set('Vary', 'Origin')
    }

    if (opts.credentials) {
      set('Access-Control-Allow-Credentials', 'true')
    }

    if (opts.exposeHeaders?.length) {
      set('Access-Control-Expose-Headers', opts.exposeHeaders.join(','))
    }

    // pre-flight
    if (req.method === 'OPTIONS') {
      if (opts.maxAge != null) {
        set('Access-Control-Max-Age', opts.maxAge.toString())
      }

      if (opts.allowMethods?.length) {
        set('Access-Control-Allow-Methods', opts.allowMethods.join(','))
      }

      let headers = opts.allowHeaders
      if (!headers?.length) {
        const requestHeaders = req.headers.get('Access-Control-Request-Headers')
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/)
        }
      }
      if (headers?.length) {
        set('Access-Control-Allow-Headers', headers.join(','))
        res.headers.append('Vary', 'Access-Control-Request-Headers')
      }

      res.headers.delete('Content-Length')
      res.headers.delete('Content-Type')

      res.status = 204;
      res.end();
    }
  }
}