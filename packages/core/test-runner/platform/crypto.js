/**
 * @import { PlatformAdapter } from '../../platform/types.public.js'
 * 
 */
import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../api/api.utils.js';


/**
 * 
 * @param {PlatformAdapter} platform 
 */
export const create = (platform) => {

  const s = suite(
    file_name(import.meta.url), 
  );
  
  s('crypto hash / verify', async () => {
    if(!platform.crypto)
      return;

    const password = String(Date.now());

    const hash = await platform.crypto.hash(password);
    const should_verify = await platform.crypto.verify(hash, password);
    const should_not_verify = await platform.crypto.verify(hash, password + '_noise');

    assert.ok(should_verify, 'Hash should have been verified !');
    assert.not(should_not_verify, 'Hash should NOT have been verified !');
  })

  return s;
}

