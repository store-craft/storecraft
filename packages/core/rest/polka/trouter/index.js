/**
 * @import { Route, Trouter as TrouterType } from './index.js'
 */
import { parse } from './regexparam/index.js';

const MAP = {
  "": 0,
  GET: 1,
  HEAD: 2,
  PATCH: 3,
  OPTIONS: 4,
  CONNECT: 5,
  DELETE: 6,
  TRACE: 7,
  POST: 8,
  PUT: 9,
};

/**
 * @template T
 */
export class Trouter {
  constructor() {
    /** @type {Route[]} */
    this.routes = [];

    this.all = this.add.bind(this, '');
    this.get = this.add.bind(this, 'GET');
    this.head = this.add.bind(this, 'HEAD');
    this.patch = this.add.bind(this, 'PATCH');
    this.options = this.add.bind(this, 'OPTIONS');
    this.connect = this.add.bind(this, 'CONNECT');
    this.delete = this.add.bind(this, 'DELETE');
    this.trace = this.add.bind(this, 'TRACE');
    this.post = this.add.bind(this, 'POST');
    this.put = this.add.bind(this, 'PUT');
  }

  remove_route_by_original_registered_route(route='') {
    this.routes = this.routes.filter(
      r => r.original_registered_route !== route
    );
  }

  use(route, ...fns) {
    let handlers = [].concat.apply([], fns);
    let { keys, pattern } = parse(route, true);
    // console.log({keys, pattern});
    this.routes.push(
      { 
        keys, 
        pattern, 
        method: '', 
        handlers, 
        midx: MAP[''],
        original_registered_route: route
      }
    );
    return this;
  }

  add(method, route, ...fns) {
    let { keys, pattern } = parse(route);
    let handlers = [].concat.apply([], fns);
    this.routes.push({ keys, pattern, method, handlers, midx: MAP[method] });
    return this;
  }

  find(method, url) {
    let midx = MAP[method];
    let isHEAD = (midx === 2);
    let i = 0, j = 0, k, tmp, arr = this.routes;
    let matches = [], params = {}, handlers = [], pat = [];
    for (; i < arr.length; i++) {
      tmp = arr[i];
      if (tmp.midx === midx || tmp.midx === 0 || (isHEAD && tmp.midx === 1)) {
        if (tmp.keys === false) {
          matches = tmp.pattern.exec(url);
          if (matches === null) continue;
          if (matches.groups !== void 0) for (k in matches.groups) params[k] = matches.groups[k];
          tmp.handlers.length > 1 ? (handlers = handlers.concat(tmp.handlers)) : handlers.push(tmp.handlers[0]);
          pat.push(tmp.pattern)
        } else if (tmp.keys.length > 0) {
          matches = tmp.pattern.exec(url);
          if (matches === null) continue;
          for (j = 0; j < tmp.keys.length;) params[tmp.keys[j]] = matches[++j];
          tmp.handlers.length > 1 ? (handlers = handlers.concat(tmp.handlers)) : handlers.push(tmp.handlers[0]);
          pat.push(tmp.pattern)

        } else if (tmp.pattern.test(url)) {
          tmp.handlers.length > 1 ? (handlers = handlers.concat(tmp.handlers)) : handlers.push(tmp.handlers[0]);
          pat.push(tmp.pattern)
        }
      } // else not a match
    }

    return { params, handlers, pat };
  }
}