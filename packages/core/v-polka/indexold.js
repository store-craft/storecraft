// const http = require('http');
import { Trouter as Router, Trouter } from './trouter/index.js';

function lead(x) {
	return x.charCodeAt(0) === 47 ? x : ('/' + x);
}

function value(x) {
  let y = x.indexOf('/', 1);
  return y > 1 ? x.substring(0, y) : x;
}

function mutate(str, req) {
	req.url = req.url.substring(str.length) || '/';
	req.path = req.path.substring(str.length) || '/';
}

/**
 * 
 * @param {any} err 
 * @param {import('./public.js').VPolkaRequest} req 
 * @param {import('./public.js').VPolkaResponse} res 
 * @param {import('./public.js').Middleware} next 
 */
function onError(err, req, res, next) {
	console.log('err, ', err)
	let code = (res.status = err.code || err.status || 500);
	if (typeof err === 'string' || Buffer.isBuffer(err)) 
		res.body=err;
	else res.body=(err.message) // || http.STATUS_CODES[code]);
}

const parse_search = (v) => {
    const o = {}
    const params = new URLSearchParams(v)
    for(let k of params.keys()) {
		const s_arr = params.getAll(k)
        o[k] = s_arr.length>1 ? s_arr : s_arr[0] 
	}
    return o;
}

/**
 * 
 * @param {URL} url 
 * @returns {Record<string, string | string[]> | {}}
 */
const parse_search_from_url = (url) => {
    const o = {}
    for(const k of url.searchParams.keys()) {
		const s_arr = url.searchParams.getAll(k)
        o[k] = s_arr.length>1 ? s_arr : s_arr[0] 
	}
    return o;
}

/**
 * @extends {Router<import('./public.js').Middleware>}
 */
export class Polka extends Router {
	constructor(opts={}) {
		super();
		/** @type {Record<string, Polka>} */
		this.apps = {};
		/** @type {import('./public.js').Middleware[]} */
		this.wares = [];
		/** @type {Record<string, import('./public.js').Middleware[]>} */
		this.bwares = {};
		// this.parse = parser;
		// this.server = opts.server;
		this.handler = this.handler.bind(this);
		this.onError = opts.onError || onError; // catch-all handler
		this.onNoMatch = opts.onNoMatch || this.onError.bind(null, { code:404 });
	}

	/**
	 * 
	 * @param {import('./trouter/index.js').Methods} method 
	 * @param {import('./trouter/index.js').Pattern} pattern 
	 * @param  {...Function} fns 
	 * @returns 
	 */
	add(method, pattern, ...fns) {
		let base = lead(value(pattern));
		if (this.apps[base] !== void 0) 
			throw new Error(
		`Cannot mount ".${method.toLowerCase()}('${lead(pattern)}')" \
		because a Polka application at ".use('${base}')" already exists! \
		You should move this handler into your Polka application instead.`);
		return super.add(method, pattern, ...fns);
	}

	/**
	 * 
	 * @param {string} base 
	 * @param  {...import('./public.js').Middleware[] | Polka} fns 
	 * @returns 
	 */
	// @ts-ignore
	use(base, ...fns) {
		if (typeof base === 'function') {
			// @ts-ignore
			this.wares = this.wares.concat(base, fns);
			return;
		}

		/** @type {string} */
		let base_str = base

		if (base_str === '/') {
			// @ts-ignore
			this.wares = this.wares.concat(fns);
		} else {
			/** @type {string} */
			base_str = lead(base_str);
			fns.forEach(fn => {
				if (fn instanceof Polka) {
					this.apps[base_str] = fn;
				} else {
					let arr = this.bwares[base_str] || [];
					// arr.length > 0 || arr.push((r, _, nxt) => (mutate(base_str, r),nxt()));
					this.bwares[base_str] = arr.concat(fn);
				}
			});
		}
		return this; // chainable
	}

	listen() {
		(this.server = this.server || http.createServer()).on('request', this.handler);
		this.server.listen.apply(this.server, arguments);
		return this;
	}

    /**
     * 
     * @param {import('./public.js').VPolkaRequest} req 
     * @param {import('./public.js').VPolkaResponse} res 
     * @param {URL} url url to guide the apps
     * @returns 
     */
	handler(req, res, url) {
		url = url ?? new URL(req.url, 'https://host')
		let fns=[], arr=this.wares, obj=this.find(req.method, url.pathname);
		let base = value(url.pathname);
		if (this.bwares[base] !== void 0) {
			arr = arr.concat(this.bwares[base]);
		}
		if (obj) {
			fns = obj.handlers;
			req.params = obj.params;
		} else if (this.apps[base] !== void 0) {
			url.pathname = url.pathname.substring(base.length) || '/';
			fns.push(this.apps[base].handler.bind(null, req, res, url));
		}
		fns.push(this.onNoMatch);
		// req.query = parse_search_from_url(url);
		req.query = url.searchParams
		// Exit if only a single function
		let i=0, len=arr.length, num=fns.length;
		if (len === i && num === 1) return fns[0](req, res);
		// Otherwise loop thru all middlware
		let next = err => err ? this.onError(err, req, res, next) : loop();
		let loop = _ => res?.finished || (i < len) && arr[i++](req, res, next);
		arr = arr.concat(fns);
		len += num;
		loop(); // init
	}

	/**
     * 
     * @param {import("./public.js").VPolkaRequest} req 
     * @param {import('./public.js').VPolkaResponse} res 
     * @param {Partial<URL>} info 
     * @returns 
     */
	handlerOLD(req, res, info) {
        
		info = info || this.parse(req);
		let fns=[], arr=this.wares, obj=this.find(req.method, info.pathname);
		// req.originalUrl = req.originalUrl || req.url;
		let base = value(req.path = info.pathname);
		if (this.bwares[base] !== void 0) {
			arr = arr.concat(this.bwares[base]);
		}
		if (obj) {
			fns = obj.handlers;
			req.params = obj.params;
		} else if (this.apps[base] !== void 0) {
			mutate(base, req); info.pathname=req.path; //=> updates
			fns.push(this.apps[base].handler.bind(null, req, res, info));
		}
		fns.push(this.onNoMatch);
		// Grab addl values from `info`
		req.search = info.search;
		// req.query = parse(info.query);
		req.query = parse_search(info.search);
		// Exit if only a single function
		let i=0, len=arr.length, num=fns.length;
		if (len === i && num === 1) return fns[0](req, res);
		// Otherwise loop thru all middlware
		let next = err => err ? this.onError(err, req, res, next) : loop();
		let loop = _ => res.finished || (i < len) && arr[i++](req, res, next);
		arr = arr.concat(fns);
		len += num;
		loop(); // init
	}
}

// export default opts => new Polka(opts);