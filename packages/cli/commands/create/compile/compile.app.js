/**
 * // IMPORTANT: 
 * // - We import types rather than regular classes import because these
 * //   packages are DEV dependencies. Otherwise, it will crash in production. 
 * //
 * @import { SQLite } from '@storecraft/database-sqlite';
 * @import { Postgres } from '@storecraft/database-postgres';
 * @import { MySQL } from '@storecraft/database-mysql';
 * @import { D1_HTTP } from '@storecraft/database-cloudflare-d1';
 * @import { MongoDB } from '@storecraft/database-mongodb';
 * @import { NeonHttp, NeonServerless } from '@storecraft/database-neon';
 * @import { PlanetScale } from '@storecraft/database-planetscale';
 * @import { Turso } from '@storecraft/database-turso';
 * @import { R2, S3, S3CompatibleStorage } from '@storecraft/storage-s3-compatible';
 * @import { GoogleStorage } from '@storecraft/storage-google';
 * @import { SendGrid } from '@storecraft/mailer-providers-http/sendgrid';
 * @import { Resend } from '@storecraft/mailer-providers-http/resend';
 * @import { MailChimp } from '@storecraft/mailer-providers-http/mailchimp';
 * @import { Mailgun } from '@storecraft/mailer-providers-http/mailgun';
 * @import { Paypal } from '@storecraft/payments-paypal';
 * @import { Stripe } from '@storecraft/payments-stripe';
 */
import { o2s } from '../../utils.js'
import { collect_config } from '../collect/collect.config.js'
import { collect_database } from '../collect/collect.database.js'
import { collect_mailer } from '../collect/collect.mailer.js'
import { collect_payments } from '../collect/collect.payments.js'
import { collect_platform } from '../collect/collect.platform.js'
import { collect_storage } from '../collect/collect.storage.js'
import { extract_env_variables } from './compile.utils.js'


/**
 * @typedef {object} Meta
 * @prop {Awaited<ReturnType<collect_config>>} config
 * @prop {Awaited<ReturnType<typeof collect_database>>} database
 * @prop {Awaited<ReturnType<collect_mailer>>} mailer
 * @prop {Awaited<ReturnType<collect_payments>>} payments
 * @prop {Awaited<ReturnType<collect_platform>>} platform
 * @prop {Awaited<ReturnType<collect_storage>>} storage
 */


/**
 * @param {Awaited<ReturnType<collect_platform>>} platform 
 */
export const infer_platform = platform => {
  switch (platform.id) {
    case 'node':
      return {
        cls: `NodePlatform`,
        imports: [
          `import { NodePlatform } from '@storecraft/core/platform/node'`
        ],
        deps: [
        ]
      }
    case 'bun':
      return {
        cls: `BunPlatform`,
        imports: [
          `import { BunPlatform } from '@storecraft/core/platform/bun'`
        ],
        deps: [
        ]
      }
    case 'deno':
      return {
        cls: `DenoPlatform`,
        imports: [
          `import { DenoPlatform } from '@storecraft/core/platform/deno'`
        ],
        deps: [
        ]
      }

    case 'cloudflare-workers':
      return {
        cls: `CloudflareWorkersPlatform`,
        imports: [
          `import { CloudflareWorkersPlatform } from '@storecraft/core/platform/cloudflare-workers'`
        ],
        deps: [
        ]
      }

    case 'aws-lambda':
      return {
        cls: `AWSLambdaPlatform`,
        imports: [
          `import { AWSLambdaPlatform } from '@storecraft/core/platform/aws-lambda'`
        ],
        deps: [
        ]
      }

    case 'google-functions':
      return {
        cls: `GoogleFunctionsPlatform`,
        imports: [
          `import { GoogleFunctionsPlatform } from '@storecraft/core/platform/google-functions'`
        ],
        deps: [
        ]
      }
  }
}

/**
 * @param {Awaited<ReturnType<collect_database>>} info 
 */
export const infer_database = info => {
  switch (info.id) {
    case 'sqlite':
      return {
        cls: `SQLite`,
        imports: [
          `import { SQLite } from '@storecraft/database-sqlite'`
        ],
        deps: [
          '@storecraft/database-sqlite'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof SQLite.EnvConfig} */ (
            {
              filepath: 'SQLITE_FILEPATH',
            }
          )
        )
      }
    case 'postgres':
      return {
        cls: `Postgres`,
        imports: [
          `import { Postgres } from '@storecraft/database-postgres'`
        ],
        deps: [
          '@storecraft/database-postgres'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof Postgres.EnvConfig} */ (
            {
              pool_config: {
                host: 'POSTGRES_HOST',
                password: 'POSTGRES_PASSWORD',
                port: 'POSTGRES_PORT',
                user: 'POSTGRES_USER'
              }
            }
          )
        )
      }
    case 'mysql':
      return {
        cls: `MySQL`,
        imports: [
          `import { MySQL } from '@storecraft/database-mysql'`
        ],
        deps: [
          '@storecraft/database-mysql'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof MySQL.EnvConfig} */ (
            {
              pool_options: {
                database: 'MYSQL_DATABASE',
                host: 'MYSQL_HOST',
                password: 'MYSQL_PASSWORD',
                port: 'MYSQL_PORT',
                user: 'MYSQL_USER'
              }
            }
          )
        )
      }
    case 'd1':
      return {
        cls: `D1_WORKER`,
        imports: [
          `import { D1_WORKER } from '@storecraft/database-cloudflare-d1'`
        ],
        deps: [
          '@storecraft/database-cloudflare-d1'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof D1_HTTP.EnvConfig} */ (
            {
              account_id: 'CF_ACCOUNT_ID',
              api_token: 'D1_API_TOKEN',
              database_id: 'D1_DATABASE_ID'
            }
          )
        )
      }
    case 'mongo_db':
      return {
        cls: `MongoDB`,
        imports: [
          `import { MongoDB } from '@storecraft/database-mongodb';`
        ],
        deps: [
          '@storecraft/database-mongodb'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof MongoDB.EnvConfig} */ (
            {
              db_name: 'MONGODB_NAME',
              url: 'MONGODB_URL'
            }
          )
        )
      }
    case 'neon_http':
      return {
        cls: `NeonHttp`,
        imports: [
          `import { NeonHttp } from '@storecraft/database-neon';`
        ],
        deps: [
          '@storecraft/database-neon'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof NeonHttp.NeonHttpEnvConfig} */ (
            {
              connectionString: 'NEON_CONNECTION_URL'
            }
          )
        )
      }

    case 'neon_ws':
      return {
        cls: `NeonServerless`,
        imports: [
          `import { NeonServerless } from '@storecraft/database-neon';`
        ],
        deps: [
          '@storecraft/database-neon'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof NeonServerless.NeonServerlessEnvConfig} */ (
            {
              poolConfig: {
                database: 'NEON_DATABASE',
                host: 'NEON_HOST',
                password: 'NEON_PASSWORD',
                port: 'NEON_PORT',
                user: 'NEON_USER'
              }
            }
          )
        )
      }

    case 'planetscale':
      return {
        cls: `PlanetScale`,
        imports: [
          `import { PlanetScale } from '@storecraft/database-planetscale';`
        ],
        deps: [
          '@storecraft/database-planetscale'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof PlanetScale.EnvConfig} */ (
            {
              url: 'PLANETSCALE_CONNECTION_URL'
            }
          )
        )
      }

    case 'libsql-local':
      return {
        cls: `Turso`,
        imports: [
          `import { Turso } from '@storecraft/database-turso';`
        ],
        deps: [
          '@storecraft/database-turso'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof Turso.EnvConfig} */ (
            {
              url: 'LIBSQL_URL',
              authToken: 'LIBSQL_AUTH_TOKEN'
            }
          )
        )
      }

    case 'turso':
      return {
        cls: `Turso`,
        imports: [
          `import { Turso } from '@storecraft/database-turso';`
        ],
        deps: [
          '@storecraft/database-turso'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof Turso.EnvConfig} */ (
            {
              authToken: 'LIBSQL_AUTH_TOKEN',
              url: 'LIBSQL_URL'
            }
          )
        )
      }
    default:
      throw 'implement me !!'
  }
}


/**
 * @param {Awaited<ReturnType<collect_storage>>} info 
 */
export const infer_storage = info => {
  switch (info.id) {
    case 'aws_s3':
      return {
        cls: `S3`,
        imports: [
          `import { S3 } from '@storecraft/storage-s3-compatible'`
        ],
        deps: [
          '@storecraft/storage-s3-compatible'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof S3.AWSS3EnvConfig} */ (
            {
              accessKeyId: 'S3_ACCESS_KEY_ID',
              bucket: 'S3_BUCKET',
              region: 'S3_REGION',
              secretAccessKey: 'S3_SECRET_ACCESS_KEY'
            }
          )
        )
      }
    case 'cloudflare_r2':
      return {
        cls: `R2`,
        imports: [
          `import { R2 } from '@storecraft/storage-s3-compatible'`
        ],
        deps: [
          '@storecraft/storage-s3-compatible'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof R2.R2EnvConfig} */ (
            {
              accessKeyId: 'S3_ACCESS_KEY_ID',
              account_id: 'CF_ACCOUNT_ID',
              bucket: 'S3_BUCKET',
              secretAccessKey: 'S3_SECRET_ACCESS_KEY'
            }
          )
        )
      }
    case 's3_compatible':
      return {
        cls: `S3CompatibleStorage`,
        imports: [
          `import { S3CompatibleStorage } from '@storecraft/storage-s3-compatible'`
        ],
        deps: [
          '@storecraft/storage-s3-compatible'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof S3CompatibleStorage.EnvConfig} */ (
            {
              accessKeyId: 'S3_ACCESS_KEY_ID',
              bucket: 'S3_BUCKET',
              region: 'S3_REGION',
              secretAccessKey: 'S3_SECRET_ACCESS_KEY'
            }
          )
        )
      }
    case 'google_storage':
      return {
        cls: `GoogleStorage`,
        imports: [
          `import { GoogleStorage } from '@storecraft/storage-google'`
        ],
        deps: [
          '@storecraft/storage-google'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof GoogleStorage.EnvConfig} */ (
            {
              bucket: 'GS_BUCKET',
              client_email: 'GS_CLIENT_EMAIL',
              private_key: 'GS_PRIVATE_KEY',
              private_key_id: 'GS_PRIVATE_KEY_ID'
            }
          )
        )
      }
    case 'deno':
      return {
        cls: `DenoLocalStorage`,
        imports: [
          `import { DenoLocalStorage } from '@storecraft/core/storage/deno'`
        ],
        deps: [
        ]
      }
    case 'node':
      return {
        cls: `NodeLocalStorage`,
        imports: [
          `import { NodeLocalStorage } from '@storecraft/core/storage/node'`
        ],
        deps: [
        ]
      }
    case 'bun':
      return {
        cls: `BunLocalStorage`,
        imports: [
          `import { BunLocalStorage } from '@storecraft/core/storage/bun'`
        ],
        deps: [
        ]
      }
  }
}


/**
 * @param {Awaited<ReturnType<collect_mailer>>} info 
 */
export const infer_mailer = info => {
  switch (info.id) {
    case 'sendgrid':
      return {
        cls: `SendGrid`,
        imports: [
          `import { SendGrid } from '@storecraft/mailer-providers-http/sendgrid';`
        ],
        deps: [
          '@storecraft/mailer-providers-http'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof SendGrid.EnvConfig} */ (
            {
              apikey: 'SENDGRID_API_KEY'
            }
          )
        )
      }
    case 'resend':
      return {
        cls: `Resend`,
        imports: [
          `import { Resend } from '@storecraft/mailer-providers-http/resend';`
        ],
        deps: [
          '@storecraft/mailer-providers-http'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof Resend.EnvConfig} */ (
            {
              apikey: 'RESEND_API_KEY'
            }
          )
        )
      }
    case 'mailchimp':
      return {
        cls: `MailChimp`,
        imports: [
          `import { MailChimp } from '@storecraft/mailer-providers-http/mailchimp';`
        ],
        deps: [
          '@storecraft/mailer-providers-http'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof MailChimp.EnvConfig} */ (
            {
              apikey: 'MAILCHIMP_API_KEY'
            }
          )
        )
      }
    case 'mailgun':
      return {
        cls: `Mailgun`,
        imports: [
          `import { Mailgun } from '@storecraft/mailer-providers-http/mailgun';`
        ],
        deps: [
          '@storecraft/mailer-providers-http'
        ],
        env: extract_env_variables(
          info.config, 
          /** @satisfies {typeof Mailgun.EnvConfig} */ (
            {
              apikey: 'MAILGUN_API_KEY'
            }
          )
        )
      }
  }
}


/**
 * @param {Awaited<ReturnType<collect_payments>>} info 
 */
export const infer_payments = info => {
  return info.map(
    (info, idx) => {
      switch (info.id) {
        case 'paypal': {
          const paypal_config = /** @type {import('@storecraft/payments-paypal').Config} */ (
            info.config
          );

          return {
            cls: `Paypal`,
            imports: [
              `import { Paypal } from '@storecraft/payments-paypal';`
            ],
            deps: [
              '@storecraft/payments-paypal'
            ],
            env: extract_env_variables(
              info.config, 
              paypal_config.env==='prod' ? (
                /** @satisfies {typeof Paypal.EnvConfigProd} */ (
                  {
                    client_id: 'PAYPAL_CLIENT_ID_PROD',
                    secret: 'PAYPAL_SECRET_PROD'
                  }
                )
              ) : (
                /** @satisfies {typeof Paypal.EnvConfigTest} */ (
                  {
                    client_id: 'PAYPAL_CLIENT_ID_TEST',
                    secret: 'PAYPAL_SECRET_TEST'
                  }
                )
              )
            )
          }
        }
        case 'stripe': {
          const config = /** @type {import('@storecraft/payments-stripe').Config} */ (
            info.config
          );

          return {
            cls: `Stripe`,
            imports: [
              `import { Stripe } from '@storecraft/payments-stripe';`
            ],
            deps: [
              '@storecraft/payments-stripe'
            ],
            env: extract_env_variables(
              info.config, 
              /** @satisfies {typeof Stripe.EnvConfig} */ (
                {
                  publishable_key: 'STRIPE_PUBLISHABLE_KEY',
                  secret_key: 'STRIPE_SECRET_KEY',
                  webhook_endpoint_secret: 'STRIPE_WEBHOOK_SECRET'
                }
              )
            )
          }
        }
      }
    }
  )
}


/**
 * 
 * @param {string} cls_name 
 * @param {any} config 
 */
const compose_instance_with_config = (cls_name, config) => {
  return `new ${cls_name}(${o2s(config)})`;
}


/**
 * 
 * @param {string} pre 
 * @param {number} idx 
 */
export const counter = (pre, idx) => {
  return idx==0 ? pre : `${pre}-${idx}`;
}



/**
 * 
 * @param {Meta} meta 
 */
export const compile_app = (meta) => {
  const platform = infer_platform(meta.platform);
  const database = infer_database(meta.database);
  const storage = infer_storage(meta.storage);
  const mailer = infer_mailer(meta.mailer);
  const payments = infer_payments(meta.payments);

  const code = `new App(
${o2s(meta.config.config)}
)
.withPlatform(
${compose_instance_with_config(platform.cls, meta.platform.config)}
)
.withDatabase(
${compose_instance_with_config(database.cls, meta.database.config)}
)
.withStorage(
${compose_instance_with_config(storage.cls, meta.storage.config)}
)
.withMailer(
${compose_instance_with_config(mailer.cls, meta.mailer.config)}
)
.withPaymentGateways({
${
  meta.payments.map(
    (m, idx) => {
      return `'${counter(m.id, idx)}': ${compose_instance_with_config(payments[idx].cls, m.config)},`
    }
  ).join('\n')
}
})
.withExtensions(
  {
    'postman': new PostmanExtension()
  }
)
`;

  return {
    code,
    imports: [
      platform.imports, 
      database.imports, 
      storage.imports, 
      mailer.imports, 
      payments.map(p => p.imports),
      `import { App } from '@storecraft/core'`,
      `import { PostmanExtension } from '@storecraft/core/extensions/postman'`,
    ].flat(10),
    deps: [
      platform.deps, 
      database.deps, 
      storage.deps, 
      mailer.deps, 
      payments.map(p => p.deps),
      '@storecraft/core',
      'handlebars'
    ].flat(10),
  }
}


