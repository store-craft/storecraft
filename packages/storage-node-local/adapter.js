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
   * 
   * @param {string} key 
   * @param {Blob} blob 
   */
  async putBlob(key, blob) {

    const f = this.to_file_path(key);
    const file_handle = await open(f, 'w')

    try {
      for await (const buf of blob.stream()) {
        await file_handle.write(buf);
      }
    } catch (e) {
    }
    finally {
      await file_handle.close()
    }

    return key;
  }

  /**
   * 
   * @param {string} key 
   */
  async putWithRedirect(key) {
    return undefined;
  }

  /**
   * @param {string} key
   */
  to_file_path(key) {
    return path.join(String(this.#path), key_to_encoded(key)); 
  }

  /**
   * 
   * @param {string} key 
   */
  async get(key) {

    const buffer = await readFile(
      this.to_file_path(key),
    );

    const blob = new Blob(
      [buffer], 
      { type: infer_content_type(key) }
    );

    return blob;
  }

  /**
   * 
   * @param {string} key 
   */
  async getStream(key) {

    return Readable.toWeb(createReadStream(this.to_file_path(key)))
    // const buffer = await readFile(
    //   this.to_file_path(key),
    // );

    // const blob = new Blob(
    //   [buffer], 
    //   { type: infer_content_type(key) }
    // );

    // return blob;
  }

  /**
   * 
   * @param {string} key 
   */
  async getWithRedirect(key) {
    return undefined;
  }

  /**
   * 
   * @param {string} key 
   */
  async remove(key) {
    await unlink(this.to_file_path(key));
    return;
  }
}

