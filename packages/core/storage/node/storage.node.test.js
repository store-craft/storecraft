import { storage as storage_test_runner } from '../../test-runner/index.js';
import { NodeLocalStorage } from './index.js';
import * as path from 'node:path';
import * as os from 'node:os';

async function test() {
  const folder = path.join(os.homedir(), 'test-storecraft-node-local-storage');
  const storage = new NodeLocalStorage(folder);

  await storage.init();

  storage_test_runner.create(storage).run()
}

test();