import pkg from './package.json' assert { type: 'json' };
import { chdir, cwd } from 'node:process';
import { exec, execSync } from 'node:child_process';
import { join } from 'node:path';

function tag() {
  execSync(`git tag ${pkg.version}`);
}

tag();