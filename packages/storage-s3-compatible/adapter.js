import 'dotenv/config'
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
 * 
 * @param {string} key 
 */
const key_to_encoded = key => {
  const url = new URL(key, 'file://host/');
  const encoded_key = encodeURIComponent(url.pathname.substring(1));
  return encoded_key;
}

/**
 * @typedef {import('./types.public.js').Options} Options
 */

/**
 * @typedef {import('@storecraft/core/v-storage').storage_driver} storage
 * @implements {storage}
 */
export class BaseS3Storage {
  
  /** @type {AwsClient} */ #_client;
  /** @type {Options} */ #_options;
  /** @type {string} */ #_url;

  /**
   * 
   * @param {Options} options 
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
   * @param {Options} options 
   */
  constructor(options) {
    this.#_options = options;
    this.#_client = new AwsClient({
      accessKeyId: options.accessKeyId, secretAccessKey: options.secretAccessKey, 
      region: options.region ?? 'auto', service: 's3'
    });

    this.#_url = this.#compute_url(options);
  }

  get url() { return this.#_url; }
  get client() { return this.#_client; }
  get options() { return this.#_options; }
  async init(app) { return this; }

  // puts

  /**
   * 
   * @param {string} key 
   * @param {Blob} blob 
   */
  async putBlob(key, blob) {
    /*
    const f = this.to_file_path(key);
    const file_handle = await open(f, 'w');

    try {
      for await (const buf of blob.stream()) {
        try {
          await file_handle.write(buf);
        } catch(e) {
          console.log(e);
          throw e;
        }
      }
    } catch (e) {
      console.log(e);
    }
    finally {
      await file_handle.close()
    }
*/
    // return await this.putStream(key, blob.stream());
  }

  /**
   * 
   * @param {string} key 
   * @param {ArrayBuffer} buffer 
   */
  async putArraybuffer(key, buffer) {
    /*
    const arr = new Uint8Array(buffer);
    const f = this.to_file_path(key);
    const file_handle = await open(f, 'w');
    try{
      await file_handle.write(arr);
    } catch (e) {

    } finally {
      await file_handle.close();
    }
    */
  }  

  /**
   * 
   * @param {string} key 
   * @param {ReadableStream} stream 
   */
  async putStream(key, stream) {
    /*
    const f = this.to_file_path(key);
    const file_handle = await open(f, 'w')

    // I found this to be better than async iterators in node.js
    const reader = stream.getReader();
    const read_more = async () => {
      const { done, value } = await reader.read();
      console.log(done)
      if (!done) {
        await file_handle.write(value);
        await read_more();
      }
    }

    try {
      await read_more(); 
    } catch(e) {
      console.log('putStream error ', e);
    } finally {
      await file_handle.close();
    }
    */
    return;
  }  

  /**
   * 
   * @param {string} key 
   */
  async putRedirect(key) {
    return undefined;
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

    try { 
      const s = (await this.#get_request(key)).body
      return {
        value: s, 
        metadata: {
          contentType: infer_content_type(key)
        }
      };
  
    } catch(e) {
      console.log(e);
      return undefined;
    }

    return undefined;
  }

  /**
   * 
   * @param {string} key 
   */
  async getRedirect(key) {
    return undefined;
  }

  // remove

  /**
   * 
   * @param {string} key 
   */
  async remove(key) {
    // await unlink(this.to_file_path(key));
    return;
  }
}

export class R2 extends BaseS3Storage {

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

