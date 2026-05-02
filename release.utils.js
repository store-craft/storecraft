import child_process from 'node:child_process';
import { join } from 'node:path';
import util from 'node:util';
const exec = util.promisify(child_process.exec);

// DEPRECATED. This file is no longer used. Please see release.version.js and release.publish.js for the new release process.

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
  '/payments/payments-razor-pay',

  '/sdks/sdk',
  '/sdks/sdk-react-hooks',
]
.slice(0)
.map(
  p => join('./packages', p)
);

export const exec_command = async (
  command='', tag='unknown', verbose_output=true,
  throw_on_error=false
) => {
  try {
    const { stdout, stderr } = await exec(command);
    if(verbose_output) {
      stdout && console.log(`${tag} stdout:`, stdout);
      // stderr && console.error(`${tag} stderr:`, stderr);
    }
  } catch(e) {
    console.error(`${tag} error:`, e);
    if(throw_on_error) {
      throw e;
    }
  }
}