import { StorecraftError } from '../../api/utils.func.js';
import type { Trouter } from './trouter/index.js';

export type PartialURL = Partial<URL>;

export type VPolkaRequest = Partial<Request> & {
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
  // Optional raw body
  rawBody?: string;
  [k: string]: any
}

type ResponseBody = ReadableStream | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | string | undefined;

export interface VPolkaResponseCreator {
  headers?: Headers;
  status?: number;
  statusText?: string;
  body?: ResponseBody;
  finished?: boolean;

  /**
   * finish and create a Response out of it
   * @param body 
   * @returns {Response}
   */
  send?: (body?: ResponseBody) => VPolkaResponseCreator
  end?: () => VPolkaResponseCreator
  sendJson?: (o: Object) => VPolkaResponseCreator
  sendHtml?: (o: string) => VPolkaResponseCreator
  sendText?: (o: string) => VPolkaResponseCreator
  sendBlob?: (o: Blob) => VPolkaResponseCreator
  sendReadableStream?: (o: ReadableStream) => VPolkaResponseCreator
  sendArrayBuffer?: (o: ArrayBuffer) => VPolkaResponseCreator
  sendSearchParams?: (o: URLSearchParams) => VPolkaResponseCreator
  sendFormData?: (o: FormData) => VPolkaResponseCreator
  sendServerSentEvents?: (o: ReadableStream) => VPolkaResponseCreator
  setStatus?: (code: number, text?: string) => VPolkaResponseCreator
}

export interface IError extends Error {
  code?: number;
  status?: number;
  details?: any;
}

export type ErrorHandler = (err: string | IError, req: VPolkaRequest, res: VPolkaResponseCreator) => Promise<void>;
export type Middleware<Req extends VPolkaRequest, Res extends VPolkaResponseCreator> = (req: Req, res: Res) => Promise<Res | void>;

export interface IPolka<Req extends VPolkaRequest, Res extends VPolkaResponseCreator> extends Trouter<Middleware<Req, Res>> {
  readonly onError: ErrorHandler;
  readonly onNoMatch: Middleware<Req, Res>;

  readonly handler: Middleware<Req, Res>;

  use(pattern: RegExp | string, ...handlers: (IPolka<Req, Res> | Middleware<Req, Res>)[]): this;
  use(...handlers: (IPolka<Req, Res> | Middleware<Req, Res>)[]): this;
}

export type PolkaOptions<Req extends VPolkaRequest, Res extends VPolkaResponseCreator> = {
  onNoMatch?: Middleware<Req, Res>;
  onError?: ErrorHandler;
  prefix?: string;
}

export type ErrorLike = StorecraftError | Error | string | { message: any, code: number };

export type Logger = {
  active: boolean
  error: (
    e: ErrorLike, req: VPolkaRequest, 
    res: VPolkaResponseCreator, 
    code: number, messages: any[]
  ) => void;
}

export * from './index.js';