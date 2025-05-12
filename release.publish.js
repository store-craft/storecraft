import pkg from './package.json' with { type: 'json' };
import { exec_command, get_packages } from './release.utils.js';

console.log(
  `Publishing all packages with new version ${pkg.version}`
);

export const apply = async (
  path='', throw_on_error=false, verbose_output=true
) => {

  try {
    await exec_command(
      `cd ${path} && npm version ${pkg.version} --force --no-git-tag-version`,
      path, true
    );
    await exec_command(
      `cd ${path} && npm publish --access public`,
      path, true
    );
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
  }

  return {
    path,
    succeed: true
  };
}

const promises = await Promise.all(
  get_packages()
  .map(
    p => apply(p, false)
  )
);

const has_failed = promises
  .filter(
    p => !p.succeed
  )
  .map(
    p => p.path
  );

if(has_failed.length > 0) {
  console.error('Failed to apply version to the following packages:');
  console.error(has_failed);
  process.exit(1);
}

console.log(
  'Now tagging the release for GIT, dont forget to ``push --tags``'
);
