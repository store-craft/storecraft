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

export const ENV_S3_ACCESS_KEY_ID = 'S3_ACCESS_KEY_ID';
export const ENV_S3_SECRET_ACCESS_KEY = 'S3_SECRET_ACCESS_KEY';
export const ENV_S3_REGION = 'ENV_S3_REGION';
export const ENV_S3_BUCKET = 'ENV_S3_BUCKET';
export const ENV_CF_ACCOUNT_ID = 'CF_ACCOUNT_ID';

/**
 * @description The base S3 compatible class
 * 
 * @implements {storage_driver}
 */
export class S3CompatibleStorage {
  
  /** @type {AwsClient} */ #_client;
  /** @type {Config} */ #_config;

  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    this.#_config = config;
  }

  get config() { return this.#_config; }
  get client() { 
    this.#_client = this.#_client ?? new AwsClient(
      {
        accessKeyId: this.config.accessKeyId, 
        secretAccessKey: this.config.secretAccessKey, 
        region: this.config.region ?? 'auto', 
        service: 's3'
      }
    );
    return this.#_client; 
  }

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
  async init(app) { 
    this.config.accessKeyId = this.config.accessKeyId ?? app.platform.env[ENV_S3_ACCESS_KEY_ID]
    this.config.secretAccessKey = this.config.secretAccessKey ?? app.platform.env[ENV_S3_SECRET_ACCESS_KEY]
    // @ts-ignore
    this.config.region = this.config.region ?? app.platform.env[ENV_S3_REGION];
    this.config.bucket = this.config.bucket ?? app.platform.env[ENV_S3_BUCKET];
    return this; 
  }

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

  get url() {
    const url = new URL(this.config.endpoint);
    if(this.config.forcePathStyle) {
      url.pathname = this.config.bucket;
    } else {
      url.host = `${this.config.bucket}.${url.host}`;
    }
    return url.toString();
  }

  /** @param {string} key  */
  get_file_url(key) {
    return `${this.url}/${key}`;
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
  constructor(config={}) {
    super(
      {
        endpoint: config.account_id ? `https://${config.account_id}.r2.cloudflarestorage.com` : undefined,
        accessKeyId: config.accessKeyId, 
        secretAccessKey:config.secretAccessKey, 
        bucket: config.bucket, 
        forcePathStyle: true, 
        region: 'auto'
      }
    );
    this.r2_config = config;
  }

  /** @type {S3CompatibleStorage["init"]} */
  init = async (app) => {
    await super.init(app);
    const cf_account_id = this.r2_config.account_id ?? app.platform.env[ENV_CF_ACCOUNT_ID];
    this.config.endpoint = this.config.endpoint ?? `https://${cf_account_id}.r2.cloudflarestorage.com`
    return this;
  }
  
}

/**
 * Amazon S3
 */
export class S3 extends S3CompatibleStorage {

  /**
   * @param {Partial<AwsS3Config>} config
   */
  constructor(config = {}) {
    super(
      {
        endpoint: config.region ? `https://s3.${config.region}.amazonaws.com` : undefined,
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey, 
        bucket: config.bucket, 
        forcePathStyle: config.forcePathStyle ?? false, 
        region: config.region
      }
    )
  }

  /** @type {S3CompatibleStorage["init"]} */
  init = async (app) => {
    await super.init(app);
    this.config.endpoint = `https://s3${this.config.region ? ('.'+this.config.region) : ''}.amazonaws.com`
    return this;
  }


}


/**
 * Digital Ocean spaces
 */
export class DigitalOceanSpaces extends S3CompatibleStorage {

  /**
   * @param {Partial<Omit<Config, 'endpoint' | 'forcePathStyle'>>} config
   */
  constructor(config = {}) {
    super(
      {
        endpoint: config.region ? `https://${config.region}.digitaloceanspaces.com` : undefined,
        accessKeyId: config.accessKeyId, 
        secretAccessKey: config.secretAccessKey, 
        bucket: config.bucket, 
        forcePathStyle: false, region: 'auto'
      }
    )
  }

  /** @type {S3CompatibleStorage["init"]} */
  init = async (app) => {
    await super.init(app);
    this.config.endpoint = this.config.region ? `https://${this.config.region}.digitaloceanspaces.com` : undefined
    return this;
  }


}

