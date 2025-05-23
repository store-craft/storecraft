/**
 * @import { 
 *  StorageFeatures, StorageSignedOperation 
 * } from '@storecraft/core/storage'
 */

import { StorecraftSDK } from '../index.js'
import { fetchOnlyApiResponseWithAuth } from './utils.api.fetch.js'

/**
 * @description `Storecraft` storage service.
 * Supports:
 * - direct `downloads` / `uploads`
 * - presigned-urls for `download` / `upload` (If supported)
 * - `delete` files
 */
export default class Storage {

  /**
   * @type {{
   *  features: StorageFeatures
   * }}
   */
  #cache = {
    features: undefined
  }

  /** 
   * @param {StorecraftSDK} sdk of
   */
  constructor(sdk) {
    this.sdk = sdk
  }

  /**
   * @description Retrieve the `features` of `storage`, which informs:
   * - Does `storage` supports `pre-signed` urls for `download` / `upload`
   * @returns {Promise<StorageFeatures>}
   */
  features = async () => {
    if(this.#cache.features)
      return this.#cache.features;

    try {
      const r = await fetchOnlyApiResponseWithAuth(
        this.sdk, 
        `storage`,
        { 
          method: 'get' 
        }
      );

      if(!r.ok)
        throw new Error();

      const json = await r.json();

      this.#cache.features = json;;

      return json;

    } catch (e) {
      console.log(e)
    }

    return {
      supports_signed_urls: false
    }

  }
  
  /**
   * @description Get a blob from `storage` driver with `presigned` urls
   * @param {string} key file path key, 
   * examples `image.png`, `collections/thumb.jpeg`
   * @return {Promise<Blob>}
   * @throws {error}
   */
  getBlobSigned = async (key) => {

    const r = await fetchOnlyApiResponseWithAuth(
      this.sdk, 
      `storage/${key}?signed=true`,
      { method: 'get' }
    );

    const ctype = r.headers.get('Content-Type');

    if(!r.ok) {
      const error = await r.json();

      throw error;
    }

    // `presigned` url instructions
    if(ctype === 'application/json') {
      /** @type {StorageSignedOperation} */
      const presigned_req = await r.json();

      const presigned_res = await this.sdk.fetcher(
        presigned_req.url, 
        {
          method: presigned_req.method,
          headers: presigned_req.headers
        }
      );

      return presigned_res.blob();
    } 

    throw 'unknown'
  }

  /**
   * @description Get a blob from `storage` driver, 
   * straight download. (Not recommended)
   * @param {string} key file path key, 
   * examples `image.png`, `collections/thumb.jpeg`
   * @return {Promise<Blob>}
   * @throws {error}
   */
  getBlobUnsigned = async (key) => {

    const r = await fetchOnlyApiResponseWithAuth(
      this.sdk, 
      `storage/${key}?signed=false`,
      { method: 'get' }
    );

    const ctype = r.headers.get('Content-Type');
    if(!r.ok) {
      const error = await r.json();
      throw error;
    }

    return r.blob();
  }  

  /**
   * @description Get a blob from `storage` driver.
   * @param {string} key file path key, 
   * examples `image.png`, `collections/thumb.jpeg`
   * @return {Promise<Blob>}
   * @throws {error}
   */
  getBlob = async (key) => {

    const features = await this.features();

    if(features.supports_signed_urls)
      return this.getBlobSigned(key);

    return this.getBlobUnsigned(key);
  }

  /** @param {string} path  */
  getText = (path) => 
    this.getBlob(path).then(blob => blob.text());

  /** @param {string} path  */
  getJson = (path) => 
    this.getBlob(path).then(
      blob => blob.text().then(JSON.parse)
    );

  /** @param {string} path  */
  getImageObjectURL = (path) => 
    this.getBlob(path).then(
      blob => URL.createObjectURL(blob)
    );

  /**
   * @description get file source by inspecting the url:
   * - If it starts with `storage://`, then use `backend` 
   * storage service, to download and convert it to encoded 
   * `object-url` for `<img/>`
   * - Else. it is assumed to be a public `url`, and will 
   * return the given url.
   * @template {false | true} [IS_IMAGE=true]
   * @param {string} url 
   * @param {IS_IMAGE} [isImage=true]
   * @returns {Promise<IS_IMAGE extends true ? string : any>}
   */
  getSource = async (
    url, 
    isImage=(/** @type {IS_IMAGE} */ (true))
  ) => {
    try {

      const is_storage = url.startsWith('storage://');

      // if we havent found a driver, rturn the url
      if(!is_storage)
        return /** @type {IS_IMAGE extends true ? string : any} */(url);

      const key = url.split('storage://').at(-1);
      const blob = await this.getBlob(key);

      if(isImage) {
        return /** @type {IS_IMAGE extends true ? string : any} */ (
          URL.createObjectURL(blob)
        )
      }
      else
        return blob.text().then(JSON.parse)    
    } catch(e) {
      console.log(e)
    }

    return /** @type {IS_IMAGE extends true ? string : any} */ (url);
  }


  /**
   * @description Put a blob into `storage` driver 
   * with `presigned` urls if supported. this means the upload
   * is offloaded from the backend to the client straight into 
   * other services that supports it such as s3.
   * @param {string} key file path key, 
   * examples `image.png`, `collections/thumb.jpeg`
   * @param {string | Blob | Uint8Array | ArrayBuffer | File} data 
   */
  putBytesSigned = async (key, data) => {

    const r = await fetchOnlyApiResponseWithAuth(
      this.sdk, 
      `storage/${key}?signed=true`,
      { method: 'put' }
    );

    const ctype = r.headers.get('Content-Type');

    if(!r.ok) {
      const error = await r.json();
      throw error;
    }

    // `presigned` url instructions
    if(ctype === 'application/json') {
      /** @type {StorageSignedOperation} */
      const presigned_req = await r.json();
      const presigned_res = await this.sdk.fetcher(
        presigned_req.url, 
        {
          method: presigned_req.method,
          headers: presigned_req.headers,
          body: data
        }
      );

      return presigned_res.ok;
    }

    throw 'unknown'
  }

  /**
   * @description Put a blob into `storage` driver with 
   * direct `upload` (Not Recommended)
   * @param {string} key file path key, 
   * examples `image.png`, `collections/thumb.jpeg`
   * @param {string | Blob | Uint8Array | ArrayBuffer | File} data 
   */
  putBytesUnsigned = async (key, data) => {

    const r = await fetchOnlyApiResponseWithAuth(
      this.sdk, 
      `storage/${key}?signed=false`,
      { 
        method: 'put',
        body: data
      }
    );

    const ctype = r.headers.get('Content-Type');

    if(!r.ok) {
      const error = await r.json();
      
      throw error;
    }

    return r.ok;
  }

  /**
   * @description Put bytes into `storage` driver.
   * @param {string} key file path key, 
   * examples `image.png`, `collections/thumb.jpeg`
   * @param {string | Blob | Uint8Array | ArrayBuffer | File} data 
   * @return {Promise<boolean>}
   * @throws {error}
   */
  putBytes = async (key, data) => {

    const features = await this.features();

    if(features.supports_signed_urls)
      return this.putBytesSigned(key, data);

    return this.putBytesUnsigned(key, data);
  }

  /**
   * @description Delete a `file` by key
   * @param {string} key file path key, 
   * examples `image.png`, `collections/thumb.jpeg`
   */
  delete = async (key) => {
    const r = await fetchOnlyApiResponseWithAuth(
      this.sdk, 
      `storage/${key}`,
      { method: 'delete' }
    );

    if(!r.ok) {
      const error = await r.json();
      throw error;
    }
    
    return r.ok;
  }

}