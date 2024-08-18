import { App } from '@storecraft/core'
import { AwsClient } from './aws4fetch.js';

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
 * @typedef {import('./types.public.d.ts').Config} Config
 */

/**
 * The base S3 compatible class
 * @typedef {import('@storecraft/core/v-storage').storage_driver} storage
 * 
 * @implements {storage}
 */
export class S3CompatibleStorage {
  
  /** @type {AwsClient} */ #_client;
  /** @type {Config} */ #_config;
  /** @type {string} */ #_url;

  /**
   * 
   * @param {Config} options 
   */
  #compute_url(options) {
    const url = new URL(options.endpoint);
    if(options.forcePathStyle) {
      url.pathname = options.bucket;
    } else {
      url.host = `${options.bucket}.${url.host}`;
    }
    return url.toString();
  }


  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    this.#_config = config;
    this.#_client = new AwsClient({
      accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey, 
      region: config.region ?? 'auto', service: 's3'
    });

    this.#_url = this.#compute_url(config);
  }

  get url() { return this.#_url; }
  get client() { return this.#_client; }
  get config() { return this.#_config; }

  features() {
    /** @type {import('@storecraft/core/v-storage').StorageFeatures} */
    const f = {
      supports_signed_urls: true
    }

    return f;
  }

  /**
   * 
   * @type {storage["init"]}
   */
  async init(app) { return this; }

  // puts

  /**
   * 
   * @param {string} key 
   * @param {BodyInit} body 
   */
  async #put_internal(key, body) {
    const r = await this.client.fetch(
      this.get_file_url(key),
      {
        method: 'PUT',
        body
      }
    );

    return r.ok;
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
   * @returns {ReturnType<import('@storecraft/core/v-storage').storage_driver["putSigned"]>}
   */
  async putSigned(key) {
    const url = new URL(this.get_file_url(key));
    const signed = await this.client.sign(
      new Request(url, {
        method: "PUT",
      }), 
      {
        aws: { signQuery: true },
      }
    );

    return {
      url: signed.url,
      method: signed.method,
      headers: Object.fromEntries(signed.headers.entries())
    }
  }

  // gets

  /** @param {string} key  */
  get_file_url(key) {
    return `${this.#_url}/${key}`;
  }

  /** @param {string} key  */
  #get_request(key) {
    return this.client.fetch(this.get_file_url(key));
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
   * @returns {ReturnType<import('@storecraft/core/v-storage').storage_driver["getSigned"]>}
   */
  async getSigned(key) {
    const url = new URL(this.get_file_url(key));
    // url.searchParams.set("X-Amz-Expires", "3600");
    const signed = await this.client.sign(
      new Request(url, {
        method: "GET",
      }), 
      {
        aws: { signQuery: true },
      }
    );

    return {
      url: signed.url,
      method: signed.method,
      headers: Object.fromEntries(signed.headers.entries())
    }
  }

  // remove

  /**
   * 
   * @param {string} key 
   */
  async remove(key) {
    const r = await this.client.fetch(
      this.get_file_url(key), { method: 'DELETE' }
    );
    return r.ok;
  }
}

/**
 * Cloudflare R2
 */
export class R2 extends S3CompatibleStorage {

  /**
   * 
   * @param {string} bucket 
   * @param {string} account_id 
   * @param {string} access_key_id 
   * @param {string} secret_access_key 
   */
  constructor(bucket, account_id, access_key_id, secret_access_key) {
    super({
      endpoint: `https://${account_id}.r2.cloudflarestorage.com`,
      accessKeyId: access_key_id, secretAccessKey: secret_access_key, 
      bucket, forcePathStyle: true, region: 'auto'
    })
  }

}

/**
 * Amazon S3
 */
export class S3 extends S3CompatibleStorage {

  /**
   * 
   * @param {string} bucket 
   * @param {string} region 
   * @param {string} access_key_id 
   * @param {string} secret_access_key 
   * @param {boolean} forcePathStyle 
   */
  constructor(bucket, region, access_key_id, secret_access_key, forcePathStyle=false) {
    super({
      endpoint: `https://s3${region ? ('.'+region) : ''}.amazonaws.com`,
      accessKeyId: access_key_id, secretAccessKey: secret_access_key, 
      bucket, forcePathStyle, region
    })
  }

}

/**
 * Digital Ocean spaces
 */
export class DigitalOceanSpaces extends S3CompatibleStorage {

  /**
   * 
   * @param {string} bucket 
   * @param {string} region 'nyc3' for example
   * @param {string} access_key_id 
   * @param {string} secret_access_key 
   */
  constructor(bucket, region, access_key_id, secret_access_key) {
    super({
      endpoint: `https://${region}.digitaloceanspaces.com`,
      accessKeyId: access_key_id, secretAccessKey: secret_access_key, 
      bucket, forcePathStyle: false, region: 'auto'
    })
  }

}

