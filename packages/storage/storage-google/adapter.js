/**
 * @import { Config, ServiceFile } from './types.public.js' 
 * @import { ENV } from '@storecraft/core';
 * @import { storage_driver, StorageFeatures } from '@storecraft/core/storage' 
 */

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
 * @description Google Storage adapter
 * 
 * @implements {storage_driver}
 */
export class GoogleStorage {
  
  /** @satisfies {ENV<Config>} */
  static EnvConfig = /** @type{const} */ ({
    bucket: 'GS_BUCKET',
    client_email: 'GS_CLIENT_EMAIL',
    private_key: 'GS_PRIVATE_KEY',
    private_key_id: 'GS_PRIVATE_KEY_ID',
  });

  /** @type {Config} */ #_config;

  /**
   * @param {Config} [config]
   */
  constructor(config={}) {
    this.#_config = config;
  }

  get bucket() { return this.config.bucket; }
  get config() { return this.#_config; }

  /**
   * @type {storage_driver["init"]}
   */
  async init(app) {
    if(!app)
      return this;

    this.#_config.bucket ??= app.platform.env[GoogleStorage.EnvConfig.bucket];
    this.#_config.client_email ??= app.platform.env[GoogleStorage.EnvConfig.client_email];
    this.#_config.private_key ??= app.platform.env[GoogleStorage.EnvConfig.private_key];
    this.#_config.private_key_id ??= app.platform.env[GoogleStorage.EnvConfig.private_key_id];

    return this; 
  }

  features() {
    /** @type {StorageFeatures} */
    const f = {
      supports_signed_urls: true
    }

    return f;
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
        // @ts-ignore
        duplex: 'half'
      }
    );

    return r.ok;
    // console.log(r)
    // console.log(JSON.stringify(await r.json(), null, 2))
  }

  /**
   * 
   * @type {storage_driver["putBlob"]}
   */
  async putBlob(key, blob) {
    return this.#put_internal(key, blob);
  }

  /**
   * 
   * @type {storage_driver["putArraybuffer"]}
   */
  async putArraybuffer(key, buffer) {
    return this.#put_internal(key, buffer);
  }  

  /**
   * 
   * @type {storage_driver["putStream"]}
   */
  async putStream(key, stream) {
    return this.#put_internal(key, stream);
  }

  /**
   * 
   * @type {storage_driver["getSigned"]}
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
   * @type {storage_driver["getArraybuffer"]}
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
   * @type {storage_driver["getBlob"]}
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
   * @type {storage_driver["getStream"]}
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
   * @type {storage_driver["getSigned"]}
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
   * @type {storage_driver["remove"]}
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

    // console.log(await r.text())

    return r.ok;
  }
}

