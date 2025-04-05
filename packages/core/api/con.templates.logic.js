/**
 * @import { ApiQuery, TemplateType, TemplateTypeUpsert } from './types.public.js'
 */
import { assert, to_handle } from './utils.func.js'
import { templateTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'
import { decode } from '../crypto/base64.js';
import { App } from "../index.js";

/**
 * @param {App} app
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
 * @param {App} app
 */
export const upsert = (app) => 
/**
 * @description `upsert` a `template`
 * @param {TemplateTypeUpsert} item
 */
(item) => regular_upsert(
  app, db(app), 'template', templateTypeUpsertSchema, 
  (before) => {
    return {
      ...before,
      handle: before.handle ?? to_handle(before.title),
      template_html: before.template_html,
      template_text: before.template_text,
      // template_html: decode_if_base64(before.template_html),
      // template_text: decode_if_base64(before.template_text),
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
 * @param {App} app
 */
export const count = (app) => 
  /**
   * @description Count query results
   * 
   * @param {ApiQuery<TemplateType>} query 
   */
  (query) => {
    return db(app).count(query);
  }


/**
 * @param {App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'templates/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'templates/remove'),
    list: regular_list(app, db(app), 'templates/list'),
    count: count(app)
  }
}


