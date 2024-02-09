import { App } from "./index.js";

export type StorageRedirect = {
  method: 'POST' | 'GET' | 'PUT',
  url: string,
  headers?: Record<string, string>
}

export type Get<T extends (Blob | ArrayBuffer | ReadableStream)> = {
  metadata?: MetaData;
  value: T;
}


export type MetaData = {
  contentType?: string;
  [x: string]: string;
};

/**
 * Basic collection or table
 */
export declare interface storage_driver {

  /**
   * Init the storage
   */
  init: (app: App<any, any, any>) => Promise<this>;

  putBlob: (key: string, blob: Blob, meta?: MetaData) => Promise<void>; 
  putArraybuffer: (key: string, buffer: ArrayBuffer, meta?: MetaData) => Promise<void>; 
  putStream: (key: string, stream: ReadableStream, meta?: MetaData) => Promise<void>; 
  putRedirect?: (key: string) => Promise<StorageRedirect | undefined>; 

  getBlob: (key: string) => Promise<Get<Blob>>;
  getArraybuffer: (key: string) => Promise<Get<ArrayBuffer>>;
  getStream: (key: string) => Promise<Get<ReadableStream>>;
  getRedirect?: (key: string) => Promise<StorageRedirect | undefined>;

  remove: (key: string) => Promise<void>;
  list?: () => Promise<any>;
}