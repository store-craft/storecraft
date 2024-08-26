import { compile_all } from "./index.js"

/** @type {import("./compile.app.js").Meta} */
const meta_test = {
  config: {
    type: 'config',
    snippet: '0',
    config: { general_store_name: 'wush', auth_admins_emails: ['a@a.com'] }
  },
  platform: { type: 'platform', id: 'node', config: {} },
  database: {
    type: 'database',
    id: 'turso',
    config: { 
      prefers_batch_over_transactions: true, 
      libsqlConfig: {
        url: 'libsql://',
        authToken: 'blahblah'
      } 
    }
  },
  storage: { type: 'storage', id: 'node', config: 'test' },
  mailer: { type: 'mailer', id: 'sendgrid', config: { apikey: 'scisidsd' } },
  payments: [
    {
      type: 'payments',
      id: 'stripe',
      config: {
        stripe_intent_create_params: {
          currency: 'USD'
        },
        publishable_key: 'sdcsdcsd',
        secret_key: 'sdvsdv',
        stripe_config: {}
      }
    }
  ]
}

// const app = await prettify(compile_app(meta_test).code)
const p = await compile_all(meta_test)

// console.log(app)