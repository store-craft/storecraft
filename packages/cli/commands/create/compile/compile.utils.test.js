import {test} from 'uvu';
import * as assert from 'uvu/assert';
import { extract_env_variables } from './compile.utils.js';


test(
  'extract_env_variables',
  (ctx) => {
    const config = /** @type {const} */ (
      {
        a: {
          b: 1
        },
        c: 2,
        d: 3,
        e: '',
        f: null,
        g: undefined,
      }
    );

    /** @satisfies {import('@storecraft/core').ENV<typeof config>} */
    const env_config = {
      a: {
        b: 'env_b'
      },
      c: 'env_c',
      e: 'env_e'
    }

    // console.log('config-pre', JSON.stringify(config, null, 2))

    const result = extract_env_variables(
      config,
      env_config
    );

    // test values were extracted and cleaned
    assert.is(
      JSON.stringify(config),
      JSON.stringify({d:3}),
    )

    // test env-vars were extracted
    assert.is(
      JSON.stringify(result),
      JSON.stringify({env_b:1, env_c:2, env_e:''}),
    );

    // console.log('config-post', JSON.stringify(config, null, 2))
    // console.log('result', JSON.stringify(result, null, 2))
  }
);

test.run();