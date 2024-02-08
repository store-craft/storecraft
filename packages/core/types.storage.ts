import { App } from "./index.js";

export type StorageRedirect = {
  method: 'POST' | 'GET' | 'PUT',
  url: string,
  headers?: Record<string, string>
}

/**
 * Basic collection or table
 */
export declare interface storage_driver {

  /**
   * Init the storage
   */
  init: (app: App<any, any, any>) => Promise<this>;

  putBlob: (key: string, blob: Blob) => Promise<string>; 
  putReadableStream: (key: string, stream: ReadableStream) => Promise<string>; 
  putArraybuffer: (key: string, buffer: ArrayBuffer) => Promise<string>; 
  putWithRedirect?: (key: string) => Promise<StorageRedirect | undefined>; 

  get: (key: string) => Promise<Blob>;
  getWithRedirect?: (key: string) => Promise<StorageRedirect | undefined>;

  remove: (key: string) => Promise<void>;
  list?: () => Promise<any>;
}