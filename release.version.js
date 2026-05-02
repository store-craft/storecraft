import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

console.log('Versioning all packages'); 

const version_type = process.argv[2] ?? 'patch';

console.log('Version type: ', version_type);

// process.exit(1);

if(!['patch', 'minor', 'major'].includes(version_type)) {
  console.error('Version type must be one of: patch, minor, major');
  process.exit(1);
}
execSync(`npm version ${version_type} -ws --include-workspace-root --no-git-tag-version`);
const version = JSON.parse(readFileSync('./package.json', 'utf-8')).version;

console.log('New Version is: ', version);
