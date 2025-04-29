import { chdir, cwd } from 'node:process';
import { exec, execSync } from 'node:child_process';
import { join } from 'node:path';

export const publish_folder = (
  path='', throw_on_error=true, verbose_output=true
) => {

  const current_working_dir = cwd();

  try {
    chdir(path);
    const ex = execSync('npm publish');
    if(verbose_output) {
      if(ex) {
        console.log(
          new TextDecoder('utf-8').decode(ex)
        );
      }
    }
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

[
  '/core',
  '/cli',
  '/dashboard',
  '/chat',

  '/databases/database-cloudflare-d1',
  '/databases/database-mongodb',
  '/databases/database-mysql',
  '/databases/database-neon',
  '/databases/database-planetscale',
  '/databases/database-postgres',
  '/databases/database-sql-base',
  '/databases/database-sqlite',
  '/databases/database-turso',

  '/storage/storage-google',
  '/storage/storage-s3-compatible',

  '/mailers/mailer-providers-http',
  '/mailers/mailer-smtp',

  '/payments/payments-paypal',
  '/payments/payments-stripe',

  '/sdks/sdk',
  '/sdks/sdk-react-hooks',
]
.slice(0)
.map(
  p => join('./packages', p)
)
.map(
  p => publish_folder(p, true)
);








const exec_promise = (command='', verbose_output=true) => new Promise(
  (resolve, reject) => {
    try {
      var child = exec(command);
      if(verbose_output) {
        child.stdout.pipe(process.stdout)
        child.stderr.pipe(process.stderr)
      }
      child.on('exit', function() {
        resolve(child.stdout);
      })              
    } catch(e) {
      reject(e)
    }
  }
);
