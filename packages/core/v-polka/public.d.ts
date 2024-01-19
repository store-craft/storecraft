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
  // Parsed body
  parsedBody?: string | Blob | FormData | any;
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
  sendBlob: (o: Blob) => VPolkaResponse
  sendArrayBuffer: (o: ArrayBuffer) => VPolkaResponse
  sendSearchParams: (o: URLSearchParams) => VPolkaResponse
  sendFormData: (o: FormData) => VPolkaResponse
  setStatus: (code: number, text?: string) => VPolkaResponse
}

export interface IError extends Error {
  code?: number;
  status?: number;
  details?: any;
}

export type ErrorHandler = (err: string | IError, req: VPolkaRequest, res: VPolkaResponse) => Promise<void>;
export type Middleware<Req extends VPolkaRequest, Res extends VPolkaResponse> = (req: Req, res: Res) => Promise<Res | void>;

export interface IPolka<Req extends VPolkaRequest, Res extends VPolkaResponse> extends Trouter<Middleware<Req, Res>> {
  readonly onError: ErrorHandler;
  readonly onNoMatch: Middleware<Req, Res>;

  readonly handler: Middleware<Req, Res>;

  use(pattern: RegExp | string, ...handlers: (IPolka<Req, Res> | Middleware<Req, Res>)[]): this;
  use(...handlers: (IPolka<Req, Res> | Middleware<Req, Res>)[]): this;
}

export type PolkaOptions<Req extends VPolkaRequest, Res extends VPolkaResponse> = {
  onNoMatch?: Middleware<Req, Res>;
  onError?: ErrorHandler;
  prefix?: string;
}

export * from './index.js';