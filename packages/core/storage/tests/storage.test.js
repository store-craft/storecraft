import 'dotenv/config';
import { NodeLocalStorage } from '../node/index.js'
import { homedir } from 'node:os'
import * as path from 'node:path';
import { storage as storage_test_runner } from '../../test-runner/index.js';

async function test() {
  const storage = new NodeLocalStorage(path.join(homedir(), 'storecraft-storage-test'));
  
  await storage.init();

  storage_test_runner.create(storage).run()
}

test()