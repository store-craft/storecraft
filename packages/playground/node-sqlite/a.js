import { AWSLambdaPlatform } from '@storecraft/core/platform/aws-lambda'
import { MongoDB } from '@storecraft/database-mongodb'
import { DummyPayments } from '@storecraft/core/payments/dummy'
import { App } from '@storecraft/core';

export const app = new App(
  {
    auth_secret_access_token: '****',
    auth_secret_refresh_token: '****',
    general_store_name: 'Wush Wush Games',
    general_store_description: 'We sell cool retro video games',
    general_store_website: 'https://wush.games',
    auth_admins_emails: ['john@doe.com']
  }
)
.withPlatform(new AWSLambdaPlatform())
.withDatabase(new MongoDB({ db_name: 'test' }))
.withPaymentGateways(
  {
    'dummy_payments': new DummyPayments({ intent_on_checkout: 'AUTHORIZE' }),
  }
)
