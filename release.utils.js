import { exec, execSync } from 'node:child_process';
import { join } from 'node:path';

/**
 * @description Get packages paths relative to root
 */
export const get_packages = () => [
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
