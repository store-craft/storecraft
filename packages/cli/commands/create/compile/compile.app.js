import { o2s } from '../../utils.js'
import { collect_config } from '../collect.config.js'
import { collect_database } from '../collect.database.js'
import { collect_mailer } from '../collect.mailer.js'
import { collect_payments } from '../collect.payments.js'
import { collect_platform } from '../collect.platform.js'
import { collect_storage } from '../collect.storage.js'


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
const infer_platform = platform => {
  switch (platform.id) {
    case 'node':
      return {
        cls: `NodePlatform`,
        imports: [
          `import { NodePlatform } from '@storecraft/platforms/node'`
        ],
        deps: [
          '@storecraft/platforms'
        ]
      }
    case 'bun':
      return {
        cls: `BunPlatform`,
        imports: [
          `import { BunPlatform } from '@storecraft/platforms/bun'`
        ],
        deps: [
          '@storecraft/platforms'
        ]
      }
    case 'deno':
      return {
        cls: `DenoPlatform`,
        imports: [
          `import { DenoPlatform } from '@storecraft/platforms/deno'`
        ],
        deps: [
          '@storecraft/platforms'
        ]
      }

    case 'cloudflare-workers':
      return {
        cls: `CloudflareWorkersPlatform`,
        imports: [
          `import { CloudflareWorkersPlatform } from '@storecraft/platforms/cloudflare-workers'`
        ],
        deps: [
          '@storecraft/platforms'
        ]
      }

    case 'aws-lambda':
      return {
        cls: `AWSLambdaPlatform`,
        imports: [
          `import { AWSLambdaPlatform } from '@storecraft/platforms/aws-lambda'
`
        ],
        deps: [
          '@storecraft/platforms'
        ]
      }

    case 'google-functions':
      return {
        cls: `GoogleFunctionsPlatform`,
        imports: [
          `import { GoogleFunctionsPlatform } from '@storecraft/platforms/google-functions''
`
        ],
        deps: [
          '@storecraft/platforms'
        ]
      }
  }
}

/**
 * @param {Awaited<ReturnType<collect_database>>} info 
 */
const infer_database = info => {
  switch (info.id) {
    case 'd1':
      return {
        cls: `D1_WORKER`,
        imports: [
          `import { D1_WORKER } from '@storecraft/database-cloudflare-d1'`
        ],
        deps: [
          '@storecraft/database-cloudflare-d1'
        ]
      }
    case 'mongo_db':
      return {
        cls: `MongoDB`,
        imports: [
          `import { MongoDB } from '@storecraft/database-mongodb-node';`
        ],
        deps: [
          '@storecraft/database-mongodb-node'
        ]
      }
    case 'neon_http':
      return {
        cls: `NeonHttp`,
        imports: [
          `import { NeonHttp } from '@storecraft/database-neon';`
        ],
        deps: [
          '@storecraft/database-neon'
        ]
      }

    case 'neon_ws':
      return {
        cls: `NeonServerless`,
        imports: [
          `import { NeonServerless } from '@storecraft/database-neon';`
        ],
        deps: [
          '@storecraft/database-neon'
        ]
      }

    case 'planetscale':
      return {
        cls: `PlanetScale`,
        imports: [
          `import { PlanetScale } from '@storecraft/database-planetscale';`
        ],
        deps: [
          '@storecraft/database-planetscale'
        ]
      }

    case 'turso':
      return {
        cls: `Turso`,
        imports: [
          `import { Turso } from '@storecraft/database-turso';`
        ],
        deps: [
          '@storecraft/database-turso'
        ]
      }
    case 'sqlite':
    case 'postgres':
    case 'mysql':
      throw 'implement me !!'
  }
}


/**
 * @param {Awaited<ReturnType<collect_storage>>} info 
 */
const infer_storage = info => {
  switch (info.id) {
    case 'aws_s3':
      return {
        cls: `S3`,
        imports: [
          `import { S3 } from '@storecraft/storage-s3-compatible'`
        ],
        deps: [
          '@storecraft/storage-s3-compatible'
        ]
      }
    case 'cloudflare_r2':
      return {
        cls: `R2`,
        imports: [
          `import { R2 } from '@storecraft/storage-s3-compatible'`
        ],
        deps: [
          '@storecraft/storage-s3-compatible'
        ]
      }
    case 's3_compatible':
      return {
        cls: `S3CompatibleStorage`,
        imports: [
          `import { S3CompatibleStorage } from '@storecraft/storage-s3-compatible'`
        ],
        deps: [
          '@storecraft/storage-s3-compatible'
        ]
      }
    case 'google_storage':
      return {
        cls: `GoogleStorage`,
        imports: [
          `import { GoogleStorage } from '@storecraft/storage-google'`
        ],
        deps: [
          '@storecraft/storage-google'
        ]
      }
    case 'deno':
      return {
        cls: `DenoLocalStorage`,
        imports: [
          `import { DenoLocalStorage } from '@storecraft/storage-local/deno'`
        ],
        deps: [
          '@storecraft/storage-local'
        ]
      }
    case 'node':
      return {
        cls: `NodeLocalStorage`,
        imports: [
          `import { NodeLocalStorage } from '@storecraft/storage-local/node'`
        ],
        deps: [
          '@storecraft/storage-local'
        ]
      }
    case 'bun':
      return {
        cls: `BunLocalStorage`,
        imports: [
          `import { BunLocalStorage } from '@storecraft/storage-local/bun'`
        ],
        deps: [
          '@storecraft/storage-local'
        ]
      }
  }
}


/**
 * @param {Awaited<ReturnType<collect_mailer>>} info 
 */
const infer_mailer = info => {
  switch (info.id) {
    case 'sendgrid':
      return {
        cls: `MailerSendGrid`,
        imports: [
          `import { MailerSendGrid } from '@storecraft/mailer-providers-http/sendgrid';`
        ],
        deps: [
          '@storecraft/mailer-providers-http'
        ]
      }
    case 'resend':
      return {
        cls: `MailerResend`,
        imports: [
          `import { MailerResend } from '@storecraft/mailer-providers-http/resend';`
        ],
        deps: [
          '@storecraft/mailer-providers-http'
        ]
      }
    case 'mailchimp':
      return {
        cls: `MailerMailChimp`,
        imports: [
          `import { MailerMailChimp } from '@storecraft/mailer-providers-http/mailchimp';`
        ],
        deps: [
          '@storecraft/mailer-providers-http'
        ]
      }
    case 'mailgun':
      return {
        cls: `MailerMailgun`,
        imports: [
          `import { MailerMailgun } from '@storecraft/mailer-providers-http/mailgun';`
        ],
        deps: [
          '@storecraft/mailer-providers-http'
        ]
      }
  }
}


/**
 * @param {Awaited<ReturnType<collect_payments>>} info 
 */
const infer_payments = info => {
  return info.map(
    (info, idx) => {
      switch (info.id) {
        case 'paypal':
          return {
            cls: `PayPal`,
            imports: [
              `import { PayPal } from '@storecraft/payments-paypal';`
            ],
            deps: [
              '@storecraft/payments-paypal'
            ]
          }
        case 'stripe':
          return {
            cls: `Stripe`,
            imports: [
              `import { Stripe } from '@storecraft/payments-stripe';`
            ],
            deps: [
              '@storecraft/payments-stripe'
            ]
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
`;

  return {
    code,
    imports: [
      platform.imports, database.imports, storage.imports, 
      mailer.imports, payments.map(p => p.imports),
      `import { App } from '@storecraft/core'`
    ].flat(10),
    deps: [
      platform.deps, database.deps, storage.deps, 
      mailer.deps, payments.map(p => p.deps),
      '@storecraft/core'
    ].flat(10),
  }
}

