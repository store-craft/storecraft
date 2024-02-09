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
export class Storage {
  
  /** @type {AwsClient} */ #_client;
  /** @type {Options} */ #_options;

  /**
   * 
   */
  #compute_endpoint() {
    
  }


  /**
   * 
   * @param {Options} options 
   */
  constructor(options) {
    this.#_options = options;
    this.#_client = new AwsClient({
      accessKeyId: options.accessKeyId, secretAccessKey: options.secretAccessKey, 
      region: options.region, service: 's3'
    });

    this.#bab()

  }

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

    // return await this.putStream(key, blob.stream());
  }

  /**
   * 
   * @param {string} key 
   * @param {ArrayBuffer} buffer 
   */
  async putArraybuffer(key, buffer) {
    const arr = new Uint8Array(buffer);
    const f = this.to_file_path(key);
    const file_handle = await open(f, 'w');
    try{
      await file_handle.write(arr);
    } catch (e) {

    } finally {
      await file_handle.close();
    }
  }  

  /**
   * 
   * @param {string} key 
   * @param {ReadableStream} stream 
   */
  async putStream(key, stream) {
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

  /**
   * 
   * @param {string} key 
   */
  async getArraybuffer(key) {

    const buffer = await readFile(
      this.to_file_path(key),
    );
    return {
      value: buffer,
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

    const buffer = await this.getArraybuffer(key);

    const blob = new Blob(
      [buffer.value], 
      { type: infer_content_type(key) }
    );

    return {
      value: blob,
      metadata: {
        contentType: infer_content_type(key)
      }
    };
  }

  /**
   * 
   * @param {string} key 
   */
  async getStream(key) {
    try { 
      const s = createReadStream(this.to_file_path(key));
      return {
        value: Readable.toWeb(s), 
        metadata: {
          contentType: infer_content_type(key)
        }
      };
  
    } catch(e) {
      
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
    await unlink(this.to_file_path(key));
    return;
  }
}

