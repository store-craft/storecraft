import { App } from "../index.js";

export type StorageFeatures = {
  
  /**
   * @description Does `storage` supports `pre-signed` urls 
   * for `download` / `upload` 
   * 
   */
  supports_signed_urls: boolean;

  extra?: any;
}

/**
 * @description In case, the `storage` supports `pre-signed` urls, 
 * we would like ofcourse to know how to construct the new 
 * requests locally
 * 
 */
export type StorageSignedOperation = {
  /**
   * @description The **HTTP** `method` to use
   */
  method: string,


  /**
   * @description The **HTTP** `url` to use
   */
  url: string,

  /**
   * @description The **HTTP** `headers` to use
   */
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
  init: (app: App<any, any, any>) => Promise<storage_driver>;

  /**
   * 
   * Get the `storage` official **Features**
   */
  features: () => StorageFeatures;

  putBlob: (key: string, blob: Blob, meta?: MetaData) => Promise<boolean>; 
  putArraybuffer: (key: string, buffer: ArrayBuffer, meta?: MetaData) => Promise<boolean>; 
  putStream: (key: string, stream: ReadableStream, meta?: MetaData) => Promise<boolean>; 
  putSigned?: (key: string) => Promise<StorageSignedOperation | undefined>; 

  getBlob: (key: string) => Promise<Get<Blob>>;
  getArraybuffer: (key: string) => Promise<Get<ArrayBuffer>>;
  getStream: (key: string) => Promise<Get<ReadableStream>>;
  getSigned?: (key: string) => Promise<StorageSignedOperation>;

  remove: (key: string) => Promise<boolean>;
  list?: () => Promise<any>;
}