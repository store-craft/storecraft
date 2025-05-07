/**
 * @import { Get } from "../storage/types.storage.js";
 */
import { App } from "../index.js";
import { assert } from "./utils.func.js";

/**
 * @param {App} app 
 */
export const rewrite_media_from_storage = (app) =>
/**
 * @description Recursively go over object keys, locate `media` 
 * keys, iterate them if they are `arrays` and replace `storage://` 
 * values with **CDN** rewrites.
 * 
 * @param {any} o 
 */
(o) => {

  if(!app.config.storage_rewrite_urls)
    return;

  /** @type {URL} */
  let url;

  try { // testing malformness
    url = new URL(app.config.storage_rewrite_urls);
  } catch (e) {
    return;
  }

  let href = url.href;
  if(!url.href.endsWith('/'))
    href += '/';

  rewrite_object(o, 'storage://', href);
}

/**
 * @param {App} app 
 */
export const rewrite_media_to_storage = (app) =>
/**
 * @description Recursively go over object keys, locate 
 * `media` keys, iterate them if they are `arrays` and 
 * replace `app.config.storage_rewrite_urls` into `storage://` 
 * @param {any} o 
 */
(o) => {

  if(!app.config.storage_rewrite_urls)
    return;

  /** @type {URL} */
  let url;

  try { // testing malformness
    url = new URL(app.config.storage_rewrite_urls);
  } catch (e) {
    return;
  }

  let href = url.href;
  if(!url.href.endsWith('/'))
    href += '/';

  rewrite_object(o, href, 'storage://');
}


/**
 * @description Rewrite media array with `rewrite_from` to `rewrite_to`
 * @param {string[]} media 
 * @param {string} rewrite_from 
 * @param {string} rewrite_to 
 */
const rewrite_media_array = (media, rewrite_from, rewrite_to) => {
  return media.map(
    media_url => {
      if(
        (typeof media_url === 'string') &&
        (media_url.startsWith(rewrite_from))
      ) {
        return media_url.replace(rewrite_from, rewrite_to)
      }
      return media_url;
    }
  )
}


/**
 * @description Rewrite object keys with `rewrite_from` to `rewrite_to`
 * @param {object} item 
 * @param {string} rewrite_from 
 * @param {string} rewrite_to 
 */
const rewrite_object = (item, rewrite_from, rewrite_to) => {
  if(!item || typeof item !== 'object')
    return;

  for(const [key, value] of Object.entries(item)) {

    if(key==='media') {
      if(Array.isArray(value)) {
        item[key] = rewrite_media_array(
          value, rewrite_from, rewrite_to
        );
      }
    } else {
      rewrite_object(value, rewrite_from, rewrite_to);
    }
  }
}



/**
 * @param {App} app 
 */
export const features = (app) => 
  /**
   * @description Get the storage official Features
   */
  async () => {
    return app.storage.features() ?? { 
      supports_signed_urls: false 
    }
  }


/** @param {App} app */
export const putStream = (app) => 
  /**
   * @description Put a stream to the storage
   * @param {string} file_key file path, example `/path/to/file.txt`
   * @param {ReadableStream<any>} stream body
   * @param {any} [meta={}] meta data
   * @param {number} [content_length_bytes=0] content length in bytes
   */
  async (file_key, stream, meta={}, content_length_bytes=0) => {
    return app.storage.putStream(
      file_key, stream, meta, 
      content_length_bytes
    );
  }

/** @param {App} app */
export const putSigned = (app) => 
  /**
   * @description Get the storage official Features
   * @param {string} file_key file path, example `/path/to/file.txt`
   */
  async (file_key) => {
    assert(
      app.storage.features().supports_signed_urls,
      'Storage driver does not support signed urls'
    );
    return app.storage.putSigned(
      file_key
    );
  }


/** @param {App} app */
export const getSigned = (app) => 
  /**
   * @description Get signed url for a file for download
   * @param {string} file_key file path, example `/path/to/file.txt`
   */
  async (file_key) => {
    assert(
      app.storage.features().supports_signed_urls,
      'Storage driver does not support signed urls'
    );
    return app.storage.getSigned(
      file_key
    );
  }

/** @param {App} app */
export const getStream = (app) => 
  /**
   * @template {any} [T=any]
   * @description Get a file stream for download
   * @param {string} file_key file path, example `/path/to/file.txt`
   * @returns {Promise<Get<ReadableStream<T>>>}
   */
  async (file_key) => {
    assert(
      file_key,
      'file_key is required'
    );
    
    return app.storage.getStream(
      file_key
    );
  }


/** @param {App} app */
export const remove = (app) => 
  /**
   * @description Remove a file from `storage`
   * @param {string} file_key file path, example `/path/to/file.txt`
   */
  async (file_key) => {
    return app.storage.remove(
      file_key
    );
  }
  

/**
 * @param {App} app
 */  
export const inter = app => {

  return {
    features: features(app),
    putStream: putStream(app),
    putSigned: putSigned(app),
    getSigned: getSigned(app),
    getStream: getStream(app),
    remove: remove(app),
  }
}