/**
 * @import { PROOF_MOCKUP_API_SETUP, TestSpec } from './types.js';
 */
import * as assert from 'uvu/assert';
import { App } from '../../index.js'

/**
 * Aggregate all {@link TestSpec} objects from the setup object recursively.
 * @param {object} o 
 * @param {string} path path till now
 * @param {(path: string, spec: TestSpec) => void} onFind prefix till now
 */
const aggregate_all_test_specs_from_object_recursively = (
  o, path='', onFind
) => {
  for(const [key, value] of Object.entries(o)) {
    const resolved_path = path ? (path + '.' + key) : key;

    if(typeof value === 'object') {
      if((key === '__tests') && Array.isArray(value)) {

        value.forEach(
          (test_spec, ix) => {
            onFind(
              path, 
              typeof test_spec==='function' ? test_spec() : test_spec
            );
          }
        );
      }
      else if(!Array.isArray(value)) {
        aggregate_all_test_specs_from_object_recursively(
          value, 
          resolved_path,
          onFind
        )
      }
    }
  }
}

/**
 * 
 * @param {PROOF_MOCKUP_API_SETUP} setup 
 * @returns {Record<string, TestSpec[]>}
 */
export const aggregate_test_api_setup = (setup) => {
  /** @type {Record<string, TestSpec[]>} */
  const test_api = {};

  aggregate_all_test_specs_from_object_recursively(
    setup,
    '',
    (path, spec) => {
      // spec can be undefined if user decided to not run the test
      if(spec)
        test_api[path] = [...(test_api[path] ?? []), spec];
    }
  );

  // console.log({test_api});

  return test_api;
}

/**
 * Assign a value to a nested object property.
 * @param {string} path such as 'a.b.c'
 * @param {any} o 
 * @param {any} value 
 */
const assign = (o={}, path='', value=undefined) => {
  path.split('.').reduce(
    (acc, key, ix, parts) => {
      if(ix === parts.length - 1) {
        acc[key] = value;
        return acc;
      }
      acc[key] ??= {};
      return acc[key];
    }, o
  );
}

/**
 * Assign a value to a nested object property.
 * @param {string} path such as 'a.b.c'
 * @param {any} o 
 */
const get = (o={}, path='') => {
  return path.split('.').reduce(
    (acc, key, ix, parts) => {
      return acc[key];
    }, o
  );
}

/**
 * 
 * @param {App["api"]} api 
 * @param {string} path 
 * @param {TestSpec} test_spec 
 */
export const patch_api = async (api, path, test_spec) => {
  assign(
    api, path, 
    async (...params) => {
      try {
        const result = await test_spec.intercept_backend_api(...params);
        return result;
      } catch (e) {
        assert.unreachable(
          `Intercepting backend api failed for path ${path}: ${e}`
        );
      }
    }
  )
}


/**
 * 
 * @param {App} app
 * @param {PROOF_MOCKUP_API_SETUP} setup 
 */
export const test_setup = async (app, setup) => {
  const agg = aggregate_test_api_setup(setup);

  // console.log({agg});

  assert.ok(
    Object.keys(agg).length > 0,
    'Test setup is empty'
  );

  for(const [path, specs] of Object.entries(agg)) {
    for(const spec of specs) {
      const older = get(app.api, path);

      patch_api(app.api, path, spec);

      const { 
        test
      } = spec;
  
      // console.log('older', older);

      try {
        await test();
      } catch(e) {
        // console.error('test failed, details', e?.details);
        console.log('test failed', e);
        assert.unreachable(
          `Test failed for path ${path}: `
        );
      } finally {
        assign(
          app.api, path, older
        );
      }

    }
  }
}
