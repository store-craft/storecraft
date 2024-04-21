
import { StorecraftSDK } from '../index.js'
import { fetchOnlyApiResponseWithAuth } from './utils.api.fetch.js'

/**
 * 
 * `Storecraft` storage service.
 * 
 * Supports:
 * - direct `downloads` / `uploads`
 * - presigned-urls for `download` / `upload` (If supported)
 * - `delete` files
 * 
 */
export default class Storage {

  /** 
   * @param {StorecraftSDK} sdk of
   */
  constructor(sdk) {
    this.sdk = sdk
  }

  /**
   * 
   * Retrieve the `features` of `storage`, which informs:
   * - Does `storage` supports `pre-signed` urls for `download` / `upload`
   * 
   */
  features = async () => {

  }
  
  /**
   * Get a blob from `storage` driver with `presigned` urls
   * 
   * @param {string} key file path key, 
   * examples `image.png`, `collections/thumb.jpeg`
   * 
   * @return {Promise<Blob>}
   * 
   * @throws {import('@storecraft/core/v-api').error}
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
      /** @type {import('@storecraft/core/v-storage').StorageSignedOperation} */
      const presigned_req = await r.json();
      const presigned_res = await fetch(
        presigned_req.url, 
        {
          method: presigned_req.method,
          headers: presigned_req.headers
        }
      );
      const blob = await presigned_res.blob();
      return blob;
    } 

    throw 'unknown'
  }

  /**
   * Get a blob from `storage` driver, straight download. (Not recommended)
   * 
   * @param {string} key file path key, 
   * examples `image.png`, `collections/thumb.jpeg`
   * 
   * @return {Promise<Blob>}
   * 
   * @throws {import('@storecraft/core/v-api').error}
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
   * Get a blob from `storage` driver with the following strategy:
   * First try `presigned` urls, and if they are not supported, then
   * try direct download.
   * 
   * @param {string} key file path key, 
   * examples `image.png`, `collections/thumb.jpeg`
   * 
   * @return {Promise<Blob>}
   * 
   * @throws {import('@storecraft/core/v-api').error}
   */
  getBlob = async (key) => {

    try {
      const blob = await this.getBlobSigned(key);
      return blob
    } catch (e) {
    }

    // We allow this to `throw`
    const blob = await this.getBlobUnsigned(key);
    return blob;
  }

  /** @param {string} path  */
  getText = (path) => 
      this.getBlob(path).then(blob => blob.text());

  /** @param {string} path  */
  getJson = (path) => 
      this.getBlob(path).then(blob => blob.text().then(JSON.parse));

  /** @param {string} path  */
  getImageObjectURL = (path) => 
      this.getBlob(path).then(blob => URL.createObjectURL(blob));

  /**
   * get file source by inspecting the url:
   * 
   * - If it starts with `storage://`, then use `backend` 
   * storage service, to download and convert it to encoded 
   * `object-url` for `<img/>`
   * 
   * - Else. it is assumed to be a public `url`, and will 
   * return the given url.
   * 
   * @param {string} url 
   * @param {boolean} isImage 
   */
  getSource = async (url, isImage=true) => {
    try {

      const is_storage = url.startsWith('storage://');

      // if we havent found a driver, rturn the url
      if(!is_storage)
        return url;

      const key = url.split('storage://').at(-1);
      const blob = await this.getBlob(key);
      if(isImage)
        return URL.createObjectURL(blob)
      else
        return blob.text().then(JSON.parse)    
    } catch(e) {
      console.log(e)
    }
    return url;
  }

  /**
   * Put a blob into `storage` driver with `presigned` urls
   * 
   * @param {string} key file path key, 
   * examples `image.png`, `collections/thumb.jpeg`
   * @param {string | Blob | Uint8Array | ArrayBuffer | File} data 
   * 
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
      /** @type {import('@storecraft/core/v-storage').StorageSignedOperation} */
      const presigned_req = await r.json();
      const presigned_res = await fetch(
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
   * Put a blob into `storage` driver with direct `upload` (Not Recommended)
   * 
   * @param {string} key file path key, 
   * examples `image.png`, `collections/thumb.jpeg`
   * @param {string | Blob | Uint8Array | ArrayBuffer | File} data 
   * 
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
   * Put bytes into `storage` driver with the following strategy:
   * First try `presigned` urls, and if they are not supported, then
   * try direct upload.
   * 
   * @param {string} key file path key, 
   * examples `image.png`, `collections/thumb.jpeg`
   * @param {string | Blob | Uint8Array | ArrayBuffer | File} data 
   * 
   * @return {Promise<boolean>}
   * 
   * @throws {import('@storecraft/core/v-api').error}
   */
  putBytes = async (key, data) => {

    try {
      const ok = await this.putBytesSigned(key, data);
      return ok;
    } catch (e) {
    }

    // We allow this to `throw`
    const ok = await this.putBytesUnsigned(key, data);
    return ok;
  }

  /**
   * Delete a `file` by key
   * 
   * @param {string} key file path key, 
   * examples `image.png`, `collections/thumb.jpeg`
   */
  delete = async (key) => {
    const r = await fetchOnlyApiResponseWithAuth(
      this.sdk, 
      `storage/${key}`,
      { method: 'delete' }
    );

    return r.ok;
  }

}