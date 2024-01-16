import type { Trouter } from './trouter/index';

export type PartialURL = Partial<URL>;

export type VPolkaRequest = Request & {
  // path params
  params?: Record<string, any>
  // query search params
  query?: URLSearchParams,
  //current processed path
  path?: string,
  // a parsed url
  parsedUrl?: PartialURL,
  [k: string]: any
}

type ResponseBody = ReadableStream | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | string | undefined;

export interface VPolkaResponse {
  headers: Headers;
  status: number;
  statusText: string;
  body: ResponseBody;
  finished: boolean;

  /**
   * finish and create a Response out of it
   * @param body 
   * @returns {Response}
   */
  send: (body?: ResponseBody) => VPolkaResponse
  sendJson: (o: Object) => VPolkaResponse
  sendText: (o: string) => VPolkaResponse
  setStatus: (code: number, text?: string) => VPolkaResponse
}

export interface IError extends Error {
  code?: number;
  status?: number;
  details?: any;
}

export type ErrorHandler = (err: string | IError, req: VPolkaRequest, res: VPolkaResponse) => Promise<void>;
export type Middleware = (req: VPolkaRequest, res: VPolkaResponse) => Promise<VPolkaResponse | void>;

export interface IPolka extends Trouter<Middleware> {
  readonly onError: ErrorHandler;
  readonly onNoMatch: Middleware;

  readonly handler: Middleware;

  use(pattern: RegExp | string, ...handlers: (IPolka | Middleware)[]): this;
  use(...handlers: (IPolka | Middleware)[]): this;
}

export type PolkaOptions {
  onNoMatch?: Middleware;
  onError?: ErrorHandler;
  prefix?: string;
}

export * from './index.js';