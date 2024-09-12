import { assert, to_handle } from './utils.func.js'
import { templateTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'
import { decode } from '../v-crypto/base64.js';

/**
 * @typedef {import('./types.api.d.ts').TemplateType} ItemType
 * @typedef {import('./types.api.d.ts').TemplateTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {import("../types.public.d.ts").App} app
 */
export const db = app => app.db.resources.templates;

/**
 * @description if `base64_` prefixed then decode the postfix and return it,
 * otherwise, just return the original value.
 * @param {string} val 
 */
const decode_if_base64 = val => {
  if(!val.startsWith('base64_'))
    return val;

  const b64 = val.split('base64_').at(1) ?? '';
  return decode(b64);
}

/**
 * 
 * @param {import("../types.public.d.ts").App} app
 */
export const upsert = (app) => 
/**
 * 
 * @param {ItemTypeUpsert} item
 */
(item) => regular_upsert(
  app, db(app), 'template', templateTypeUpsertSchema, 
  (before) => {
    return {
      ...before,
      handle: before.handle ?? to_handle(before.title),
      template_html: decode_if_base64(before.template_html),
      template_text: decode_if_base64(before.template_text),
    }
  },
  (final) => {
    assert(
      final.template_html,
      'Template is empty', 400
    );
    return [];
  },
  'templates/upsert'
)(item);


/**
 * 
 * @param {import("../types.public.d.ts").App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'templates/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'templates/remove'),
    list: regular_list(app, db(app), 'templates/list'),
  }
}


