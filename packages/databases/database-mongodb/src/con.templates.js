/**
 * @import { db_templates as db_col } from '@storecraft/core/database'
 */
import { Collection } from 'mongodb'
import { MongoDB } from '../index.js'
import { 
  count_regular, get_regular, list_regular, 
  remove_regular, upsert_regular 
} from './con.shared.js'
import { base64 } from '@storecraft/core/crypto';

/**
 * @description if `base64_` prefixed then decode the postfix and return it,
 * otherwise, just return the original value.
 * @param {string} val 
 */
const encode_base64_if_needed = val => {
  if(val?.startsWith('base64_'))
    return val;

  return 'base64_' + base64.encode(val);
}

/**
 * @description if `base64_` prefixed then decode the postfix and return it,
 * otherwise, just return the original value.
 * @param {string} val 
 */
const decode_base64_if_needed = val => {
  if(!val?.startsWith('base64_'))
    return val;

  return base64.decode(val.split('base64_').at(-1) ?? '');
}

/**
 * @param {MongoDB} d 
 * @returns {Collection<db_col["$type_get"]>}
 */
const col = (d) => d.collection('templates');

/**
 * @param {MongoDB} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => upsert_regular(
  driver, col(driver),
  (before) => {
    return before && {
      ...before,
      template_html: before?.template_html && 
        encode_base64_if_needed(before?.template_html),
      template_text: before?.template_text && 
        encode_base64_if_needed(before?.template_text),
      template_subject: before?.template_subject && 
        encode_base64_if_needed(before?.template_subject),
    }
  },
);

/**
 * @param {MongoDB} driver 
 */
const get = (driver) => get_regular(
  driver, col(driver),
  (item) => {
    return item && {
      ...item,
      template_html: item?.template_html && 
        decode_base64_if_needed(item?.template_html),
      template_text: item?.template_text && 
        decode_base64_if_needed(item?.template_text),
      template_subject: item?.template_subject && 
        decode_base64_if_needed(item?.template_subject),
    }
  }
);

/**
 * @param {MongoDB} driver 
 */
const remove = (driver) => remove_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 */
const list = (driver) => list_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 */
const count = (driver) => count_regular(driver, col(driver));

/** 
 * @param {MongoDB} driver
 * @return {db_col & { _col: ReturnType<col>}}
 * */
export const impl = (driver) => {

  return {
    _col: col(driver),
    get: get(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    count: count(driver),
  }
}
