import 'dotenv/config'
import { readFile, mkdir, open, unlink } from 'node:fs/promises';
import { fileURLToPath } from "node:url";
import * as path from 'node:path';
import { App } from '@storecraft/core'
import { Blob } from 'node:buffer';
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * @typedef {import('@storecraft/core/v-storage').storage_driver} storage
 * @implements {storage}
 */
export class Storage {
  
  /** @type {import('node:fs').PathLike} */ #path;

  /**
   * 
   * @param {import('node:fs').PathLike} path 
   */
  constructor(path) {
    this.#path = path;
  }

  /**
   * 
   * @param {App<any, any>} app 
   * @returns {Promise<this>}
   */
  async init(app) {
    await mkdir(this.#path, { recursive: true });
    return;
  }

  /**
   * Base path folder to local storage
   */
  get path() {
    return this.#path;
  }

  /**
   * @param {string} key
   */
  to_file_path(key) {
    return path.join(String(this.#path), key_to_encoded(key)); 
  }

  /**
   * @param {string} key 
   */
  getContentType(key) {
    return infer_content_type(key);
  }

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
    return {
      value: Readable.toWeb(createReadStream(this.to_file_path(key))),
      metadata: {
        contentType: infer_content_type(key)
      }
    };
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

