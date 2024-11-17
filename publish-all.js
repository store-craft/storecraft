import { chdir, cwd } from 'node:process';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

export const publish_folder = (path='', throw_on_error=true) => {
  const current_working_dir = cwd();
  try {
    chdir(path);
    execSync('npm publish');
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
  '/cli',
  '/core',
  '/dashboard',

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

  '/sdk',
  '/sdk-react-hooks',
]
.slice(0)
.map(
  p => join('./packages', p)
)
.map(
  p => publish_folder(p, true)
);
