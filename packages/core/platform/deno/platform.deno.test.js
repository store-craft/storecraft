import { DenoPlatform } from './index.js';
import { platform as platform_test_runner } from '../../test-runner/index.js';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import http from "node:http";


async function test() {
  const platform = new DenoPlatform();

  // test crypto first
  platform_test_runner.crypto.create(platform).run();
}

test();
