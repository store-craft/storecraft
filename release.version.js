import { chdir, cwd } from 'node:process';
import { read, readFileSync } from 'node:fs';
import { exec, execSync } from 'node:child_process';
import { get_packages } from './release.utils.js';

console.log('Versioning all packages'); 

const version_type = process.argv[2] ?? 'patch';

console.log('Version type: ', process.argv[2]);

if(!['patch', 'minor', 'major'].includes(version_type)) {
  console.error('Version type must be one of: patch, minor, major');
  process.exit(1);
}

execSync(`npm version ${version_type} --force --no-git-tag-version`);
const version = JSON.parse(readFileSync('./package.json', 'utf-8')).version;

console.log('New Version is: ', process.argv[2]);
console.log('Now applying to all packages');

export const apply = (
  path='', throw_on_error=false, verbose_output=true
) => {

  const current_working_dir = cwd();

  try {
    chdir(path);
    execSync(`npm version ${version} --force --no-git-tag-version`);
  } catch(e) {
    console.log(`Failed with ${path}`);
    console.log(e);

    if(throw_on_error) {
      throw e;
    }

    return {
      path,
      succeed: false
    };
  } finally {
    chdir(current_working_dir);  
  }

  return {
    path,
    succeed: true
  };
}

get_packages()
.map(
  p => apply(p, false)
);

console.log(
  'Now tagging the release for GIT, dont forget to ``push --tags``'
);

execSync(`git tag ${version}`);


