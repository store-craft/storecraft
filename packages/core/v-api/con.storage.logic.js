import { App } from "../index.js"

/**
 * prefer signed url get by default
 * @param {URLSearchParams} search_params
 */
export const does_prefer_signed = search_params => {
  return (search_params?.get('signed')?.trim() ?? 'true') !== 'false'
}


/**
 * @param {App} app 
 */
export const rewrite_media = (app) =>
/**
 * Recursively go over object keys, locate `media` keys, iterate
 * them if they are `arrays` and replace `storage://` values with 
 * **CDN** rewrites.
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

  rewrite_object(o, url.href);
}


/**
 * 
 * @param {string[]} media 
 * @param {string} rewrite 
 */
const rewrite_media_array = (media, rewrite) => {
  return media.map(
    media_url => {
      if(typeof media_url === 'string') {
        return media_url.replace('storage://', rewrite)
      }
      return media_url;
    }
  )
}


/**
 * 
 * @param {object} item 
 * @param {string} rewrite 
 */
const rewrite_object = (item, rewrite) => {
  if(!item || typeof item !== 'object')
    return;

  for(const [key, value] of Object.entries(item)) {

    if(key==='media') {
      if(Array.isArray(value)) {
        item[key] = rewrite_media_array(value, rewrite);
      }
    } else {
      rewrite_object(value, rewrite);
    }
  }
}
