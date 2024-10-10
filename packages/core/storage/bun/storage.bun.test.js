import { storage as storage_test_runner } from '../../test-runner/index.js';
import { BunLocalStorage } from './index.js';
import * as path from 'node:path';
import * as os from 'node:os';

async function test() {
  const folder = path.join(os.homedir(), 'test-storecraft-bun-local-storage');
  const storage = new BunLocalStorage(folder);

  await storage.init();

  storage_test_runner.create(storage).run()
}

test();