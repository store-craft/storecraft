import pkg from './package.json' assert { type: 'json' };
import { fileURLToPath } from 'node:url';
import { chdir, cwd } from 'node:process';
import { execSync } from 'node:child_process';
import { get_packages } from './release.utils.js';

console.log(
  `Publishing all packages with new version ${pkg.version}`
);

export const apply = (
  path='', throw_on_error=false, verbose_output=true
) => {

  const current_working_dir = cwd();

  try {
    chdir(path);
    execSync(`npm version ${pkg.version} --force --no-git-tag-version`);
    const ex = execSync('npm publish --access public');
    if(verbose_output) {
      if(ex) {
        console.log(
          new TextDecoder('utf-8').decode(ex)
        );
      }
    }
  } catch(e) {1
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

