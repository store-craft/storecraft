import type { App } from "../index.js";

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


export type Get<T extends (Blob | ArrayBuffer | ReadableStream | undefined)> = {
  metadata?: MetaData;
  value: T | undefined;
  error?: boolean;
  message?: string;
}


export type MetaData = {
  contentType?: string | undefined;
  [x: string]: string | undefined;
};

/**
 * 
 * @description `storage` driver type
 */
export declare interface storage_driver {

  /**
   * 
   * @description Init the storage
   */
  init: (app?: App) => Promise<any>;

  /**
   * 
   * @description Get the `storage` official **Features**
   */
  features: () => StorageFeatures;

  /**
   * 
   * @description A human readable information about the `storage` in `markdown`
   */
  info?: () => string[];

  /**
   * Put a `blob` in the storage
   * 
   * 
   * @param key The put key
   * @param blob asset as `blob`
   * @param meta (Optional) meta data
   */
  putBlob: (key: string, blob: Blob, meta?: MetaData) => Promise<boolean>; 
  putArraybuffer: (key: string, buffer: ArrayBuffer, meta?: MetaData) => Promise<boolean>; 
  putStream: (key: string, stream: ReadableStream<any>, meta?: MetaData, bytesLength: number) => Promise<boolean>; 
  putSigned?: (key: string) => Promise<StorageSignedOperation | undefined>; 

  /**
   * Get a `blob` from the storage
   * 
   * 
   * @param key The retrival key
   */
  getBlob: (key: string) => Promise<Get<Blob>>;
  getArraybuffer: (key: string) => Promise<Get<ArrayBuffer>>;
  getStream: (key: string) => Promise<Get<ReadableStream<any>>>;
  getSigned?: (key: string) => Promise<StorageSignedOperation>;

  /**
   * Remove asset from the storage
   * 
   * 
   * @param key The retrival key
   */
  remove: (key: string) => Promise<boolean>;
  list?: () => Promise<any>;
}