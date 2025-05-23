// Thank you: @fwilkerson, @stahlstift
// ---

export type Methods = string | 'ACL' | 'BIND' | 'CHECKOUT' | 'CONNECT' | 'COPY' | 'DELETE' | 'GET' | 'HEAD' | 'LINK' | 'LOCK' | 'M-SEARCH' | 'MERGE' | 'MKACTIVITY' | 'MKCALENDAR' | 'MKCOL' | 'MOVE' | 'NOTIFY' | 'OPTIONS' | 'PATCH' | 'POST' | 'PRI' | 'PROPFIND' | 'PROPPATCH' | 'PURGE' | 'PUT' | 'REBIND' | 'REPORT' | 'SEARCH' | 'SOURCE' | 'SUBSCRIBE' | 'TRACE' | 'UNBIND' | 'UNLINK' | 'UNLOCK' | 'UNSUBSCRIBE';

export type Pattern = RegExp | string;

export class Trouter<T = Function> {
  find(method: Methods, url: string): {
    params: Record<string, string>;
    handlers: T[];
  };
  add(method: Methods, pattern: Pattern, ...handlers: T[]): this;
  use(pattern: Pattern, ...handlers: T[]): this;
  all(pattern: Pattern, ...handlers: T[]): this;
  get(pattern: Pattern, ...handlers: T[]): this;
  head(pattern: Pattern, ...handlers: T[]): this;
  patch(pattern: Pattern, ...handlers: T[]): this;
  options(pattern: Pattern, ...handlers: T[]): this;
  connect(pattern: Pattern, ...handlers: T[]): this;
  delete(pattern: Pattern, ...handlers: T[]): this;
  trace(pattern: Pattern, ...handlers: T[]): this;
  post(pattern: Pattern, ...handlers: T[]): this;
  put(pattern: Pattern, ...handlers: T[]): this;
  remove_route_by_original_registered_route(original_registered_route: string): void;
}

export type Route = {
  keys: string[] | false, 
  pattern: RegExp, 
  method: Methods, 
  handlers: Function[], 
  midx: number,
  original_registered_route?: Pattern
}