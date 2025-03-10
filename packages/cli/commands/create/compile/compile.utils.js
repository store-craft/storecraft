import * as prettier from "prettier";

export const assert = (any, message='failed') => {
  if(!Boolean(any))
    throw new Error(message);
}

/**
 * @description use `prettier` package to prettify the code
 * @param {string} source 
 * @param {prettier.Options} options 
 */
export const prettify = (source, options={}) => {
  return prettier.format(
    source, 
    {
      ...options, tabWidth: 2, printWidth: 50, semi: false, parser: 'babel-ts'
    }
  );
}

/**
 * @description Dedup (even highly nested) arrays by values
 * @param {any[] } arr 
 * @returns {string[]}
 */
export const dedup_value_array = (arr=[]) => {
  return Array.from(
    new Set(arr.flat(100))
  );
}

/**
 * @description Dedup record object by keys
 * @param {Record<string, any>[]} arr 
 */
export const dedup_object_array = (arr=[]) => {
  return arr.reduce(
    (p, c) => ({...p, ...(c??{})}),
    {}
  );
}

const is_defined = (o) => o!==undefined && o!==null;

/**
 * @description Given an `object` and another object with partial properties,
 * Walk on the object and the shadow object, and record values of both when
 * they both have values 
 * @param {{}} o 
 * @param {{}} shadow 
 * @param {{key: string, shadow_value: string | number | boolean, value: string | number | boolean}[]} acc 
 */
export const record_intersecting_values = (o={}, shadow={}, path='', acc=[]) => {
  for(const key in o) {
    // console.log('key: ', key);
    const value = o?.[key];
    const shadow_value = shadow?.[key];
    const is_regular_value = typeof value==='number' || 
        typeof value==='string' || 
        typeof value==='boolean';
    const acc_path = path ? (path + '.' + key) : key;
    if(is_regular_value && Boolean(shadow_value) && is_defined(value)) {
      acc.push({shadow_value, value, key: acc_path});
    }
    if(!is_regular_value) {
      acc.push(...record_intersecting_values(value, shadow_value, acc_path));
    }
  }
  return acc;
}

/**
 * @description Given a config object and a partial shadow config object
 * that maps keys into env-var keys. 
 * - Extract from config the env variables
 * - Remove from config the extracted keys
 * - Clean config from resulting empty values and objects. 
 * @param {{}} config in-place config object, that will be altered
 * @param {{}} env_config a shadow object that maps a key to env-var key
 * @returns {Partial<Record<string, string | boolean | number>>}
 */
export const extract_env_variables = (config, env_config) => {
  const items = record_intersecting_values(config, env_config);
  // console.log('items', items)
  const set = {};
  for(const item of items) {
    const env_var_path = item.key;
    const env_var_key = item.shadow_value;
    const env_var_value = item.value;

    set[env_var_key] = env_var_value;

    {
      // remove the key from config
      const keys = env_var_path.split('.');
      const pre_keys = keys.slice(0, -1);
      const last_key = keys.at(-1);
      const pre_value = pre_keys.reduce(
        (p, c) => p?.[c],
        config
      );

      // console.log('keys', keys)
      // console.log('pre_keys', pre_keys)
      // console.log('last_key', last_key)
      // console.log('pre_value', pre_value)

      if(pre_value)
        delete pre_value[last_key];
    }
  }

  // at last, clean empty values and objects
  clean_empty_values(config);

  return set;
}

export const is_object_or_function = x => {
  return typeof x === 'object' && !Array.isArray(x) && x !== null;
}

export const clean_empty_values = (o={}) => {
  for(const [key, value] of Object.entries(o)) {
    if(value===undefined || value===null) {
      delete o[key];
      continue;
    }
    if(is_object_or_function(value)) {
      clean_empty_values(value);
      const empty_value = Object.keys(value ?? {}).length==0;
      if(empty_value)
        delete o[key];
    }

  }
}