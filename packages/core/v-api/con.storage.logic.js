import { App } from "../index.js"

/**
 * prefer signed url get by default
 * @param {URLSearchParams} search_params
 */
export const does_prefer_signed = search_params => {
  return (search_params?.get('signed')?.trim() ?? 'true') !== 'false'
}


/**
 * Recursively go over object keys, locate `media` keys, iterate
 * them if they are `arrays` and replace `storage://` values with 
 * **CDN** rewrites.
 * 
 * 
 * @param {App} app 
 */
export const rewrite_media_from_storage = (app) =>
/**
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
 * Recursively go over object keys, locate `media` keys, iterate
 * them if they are `arrays` and replace `app.config.storage_rewrite_urls`
 * into `storage://` 
 * 
 * 
 * @param {App} app 
 */
export const rewrite_media_to_storage = (app) =>
/**
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

  rewrite_object(o, href, 'storage://');
}


/**
 * 
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
 * 
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
        item[key] = rewrite_media_array(value, rewrite_from, rewrite_to);
      }
    } else {
      rewrite_object(value, rewrite_from, rewrite_to);
    }
  }
}
