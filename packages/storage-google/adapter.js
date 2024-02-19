import { getJWTFromServiceAccount, presign } from './adapter.utils.js';

const types = {
  'png': 'image/png',
  'gif': 'image/gif',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'tiff': 'image/tiff',
  'webp': 'image/webp',
  'txt': 'text/plain',
  'json': 'application/json',
}

/**
 * 
 * @param {string} name 
 */
const infer_content_type = (name) => {
  const idx = name.lastIndexOf('.');
  if(!idx) return 'application/octet-stream';
  const type = types[name.substring(idx + 1).trim()]
  return type ?? 'application/octet-stream';
}


/**
 * @typedef {import('./types.public.js').ServiceFile} ServiceFile
 * @typedef {import('./types.public.js').Config} Config
 */

/**
 * Google Storage
 * @typedef {import('@storecraft/core/v-storage').storage_driver} storage
 * @implements {storage}
 */
export class GoogleStorage {
  
  /** @type {Config} */ #_config;

  /**
   * @param {Config} [config]
   */
  constructor(config) {
    this.#_config = config;
  }

  get bucket() { return this.config.bucket; }
  get config() { return this.#_config; }

  /**
   * @type {storage["init"]}
   */
  async init(app) {
    if(!app)
      return this;

    this.#_config = this.#_config ?? {
      bucket: app.platform.env.GS_BUCKET,
      client_email: app.platform.env.GS_CLIENT_EMAIL,
      private_key: app.platform.env.GS_PRIVATE_KEY,
      private_key_id: app.platform.env.GS_PRIVATE_KEY_ID,
    }
    return this; 
  }

  // puts

  /**
   * @param {string} key 
   */
  put_file_url(key) {
    const base = 'https://storage.googleapis.com/upload/storage/v1';
    return `${base}/b/${this.bucket}/o?uploadType=media&name=${encodeURIComponent(key)}`
  }

  /**
   * 
   * @param {string} key 
   * @param {BodyInit} body 
   */
  async #put_internal(key, body) {
    const auth = 'Bearer ' + await getJWTFromServiceAccount(this.config);

    const r = await fetch(
      this.put_file_url(key),
      {
        method: 'POST',
        body,
        headers: {
          Authorization: auth,
          'Content-Type': 'image/png'
        },
        duplex: 'half'
      }
    );

    return r.ok;
    // console.log(r)
    // console.log(JSON.stringify(await r.json(), null, 2))
  }

  /**
   * 
   * @param {string} key 
   * @param {Blob} blob 
   */
  async putBlob(key, blob) {
    return this.#put_internal(key, blob);
  }

  /**
   * 
   * @param {string} key 
   * @param {ArrayBuffer} buffer 
   */
  async putArraybuffer(key, buffer) {
    return this.#put_internal(key, buffer);
  }  

  /**
   * 
   * @param {string} key 
   * @param {ReadableStream} stream 
   */
  async putStream(key, stream) {
    return this.#put_internal(key, stream);
  }

  /**
   * 
   * @param {string} key 
   */
  async putSigned(key) {
    const ct = infer_content_type(key);
    const sf = this.config;

    const url_signed = await presign({
      pem_private_key: sf.private_key,
      client_id_email: sf.client_email,
      gcs_api_endpoint: 'https://storage.googleapis.com',
      path: `/${this.bucket}/${key}`,
      verb: 'PUT',
      content_md5: '',
      content_type: ct
    });

    return {
      url: url_signed,
      method: 'PUT',
      headers: {
        'Content-Type': ct
      }
    }

  }

  // gets

  /** @param {string} key  */
  get_file_url(key) {
    const base = 'https://storage.googleapis.com/storage/v1';
    return `${base}/b/${this.bucket}/o/${encodeURIComponent(key)}`
  }

  /** @param {string} key  */
  async #get_request(key) {
    const auth = 'Bearer ' + await getJWTFromServiceAccount(this.config);
    return fetch(
      this.get_file_url(key) + '?alt=media',
      {
        method: 'GET',
        headers: {
          Authorization: auth,
        }
      }
    );
  }

  /**
   * 
   * @param {string} key 
   */
  async getArraybuffer(key) {
    const r = await this.#get_request(key);
    const b = await r.arrayBuffer();
    return {
      value: b, 
      metadata: {
        contentType: infer_content_type(key)
      }
    };
  }

  /**
   * 
   * @param {string} key 
   */
  async getBlob(key) {
    const r = await this.#get_request(key);
    // console.log(await r.json())
    // console.log(r)
    const b = await r.blob();
    return {
      value: b, 
      metadata: {
        contentType: infer_content_type(key)
      }
    };
  }

  /**
   * 
   * @param {string} key 
   * @param {Response} key 
   */
  async getStream(key) {

    const s = (await this.#get_request(key)).body
    return {
      value: s, 
      metadata: {
        contentType: infer_content_type(key)
      }
    };
  }

  /**
   * 
   * @param {string} key 
   */
  async getSigned(key) {
    const sf = this.config;
    const url_signed = await presign({
      pem_private_key: sf.private_key,
      client_id_email: sf.client_email,
      gcs_api_endpoint: 'https://storage.googleapis.com',
      path: `/${this.bucket}/${key}`,
      verb: 'GET',
    });

    return {
      url: url_signed,
      method: 'GET',
    }
  }

  // // remove

  /**
   * 
   * @param {string} key 
   */
  async remove(key) {
    const Authorization = 'Bearer ' + await getJWTFromServiceAccount(this.config);
    const r = await fetch(
      this.get_file_url(key), 
      { 
        method: 'DELETE',
        headers: {
          Authorization
        }
      }
    );

    // console.log(r)
  }
}

