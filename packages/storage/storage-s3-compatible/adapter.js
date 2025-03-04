/**
 * @import { AwsS3Config, Config, R2Config } from './types.public.js'
 * @import { storage_driver, StorageFeatures } from '@storecraft/core/storage'
 */
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
 * @description The base S3 compatible class
 * 
 * @implements {storage_driver}
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
    /** @type {StorageFeatures} */
    const f = {
      supports_signed_urls: true
    }

    return f;
  }

  /**
   * 
   * @type {storage_driver["init"]}
   */
  async init(app) { return this; }

  // puts

  /**
   * 
   * @param {string} key 
   * @param {BodyInit} body 
   * @param {object} [headers={}] 
   */
  async #put_internal(key, body, headers={}) {
    const r = await this.client.fetch(
      this.get_file_url(key),
      {
        method: 'PUT',
        body,
        headers
      }
    );

    if(!r.ok) {
      console.log(
        await r.text()
      );
    }

    return r.ok;
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
  async putStream(key, stream, meta={}, bytesLength=0) {
    const extra_headers = {};
    if(Boolean(bytesLength)) {
      extra_headers["Content-Length"] = bytesLength;
    }

    return this.#put_internal(
      // @ts-ignore
      key, stream, extra_headers
    );
  }

  /**
   * 
   * @type {storage_driver["putSigned"]}
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
   * @type {storage_driver["getArraybuffer"]}
   */
  async getArraybuffer(key) {
    const r = await this.#get_request(key);
    return {
      value: r.ok ? (await r.arrayBuffer()) : undefined, 
      error: !r.ok,
      message: r.ok ? undefined : await r.text(),
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
    return {
      value: r.ok ? (await r.blob()) : undefined, 
      error: !r.ok,
      message: r.ok ? undefined : await r.text(),
      metadata: {
        contentType: infer_content_type(key)
      }
    };
  }

  /**
   * @type {storage_driver["getStream"]}
   */
  async getStream(key) {
    const r = await this.#get_request(key);
    const b = r.body;
    return {
      value: r.ok ? b : undefined, 
      error: !r.ok,
      message: r.ok ? undefined : await r.text(),
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
   * @type {storage_driver["remove"]}
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
   * @param {R2Config} config
   */
  constructor({bucket, account_id, accessKeyId, secretAccessKey}) {
    super(
      {
        endpoint: `https://${account_id}.r2.cloudflarestorage.com`,
        accessKeyId, secretAccessKey, bucket, 
        forcePathStyle: true, region: 'auto'
      }
    )
  }

}

/**
 * Amazon S3
 */
export class S3 extends S3CompatibleStorage {

  /**
   * @param {AwsS3Config} config
   */
  constructor({bucket, region, accessKeyId, secretAccessKey, forcePathStyle=false}) {
    super(
      {
        endpoint: `https://s3${region ? ('.'+region) : ''}.amazonaws.com`,
        accessKeyId, secretAccessKey, 
        bucket, forcePathStyle, region
      }
    )
  }

}

/**
 * Digital Ocean spaces
 */
export class DigitalOceanSpaces extends S3CompatibleStorage {

  /**
   * @param {Omit<Config, 'endpoint' | 'forcePathStyle'>} config
   */
  constructor({bucket, region, accessKeyId, secretAccessKey}) {
    super(
      {
        endpoint: `https://${region}.digitaloceanspaces.com`,
        accessKeyId, secretAccessKey, 
        bucket, forcePathStyle: false, region: 'auto'
      }
    )
  }

}

