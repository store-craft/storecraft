import { storage as storage_test_runner } from '../../test-runner/index.js';
import { NodeLocalStorage } from './index.js';
import * as path from 'node:path';
import * as os from 'node:os';

async function test() {
  const storage = new NodeLocalStorage(
    path.join(os.homedir(), 'test-storecraft-node-local-storage')
  );
  const suite = storage_test_runner.create(storage);
  suite.before(async () => { await storage.init();});
  suite.run();
}

test();