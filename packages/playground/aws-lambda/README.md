# aws-lambda

We followed this 
- [Official Guide](https://docs.aws.amazon.com/cdk/v2/guide/hello_world.html#hello_world_prerequisites)
- [Example](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-cdk-getting-started.html)

First, install the `aws-cli`, [instruction](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

Next, install [SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) for local testing.

Next, install `cdk`

```zsh
npm install -g aws-cdk
```

Now, init

```zsh
mkdir app
cd app
cdk init app -l typescript
```

Add this to your `tsconfig.json`
```json
{
  "allowJs": true,
}

```
Add `app.ts`

```ts
import { AWSLambdaPlatform } from '@storecraft/platforms/aws-lambda'
import { MongoDB } from '@storecraft/database-mongodb-node'
import { DummyPayments } from '@storecraft/payments-dummy'
import { App } from '@storecraft/core';

export const app = new App(
  {
    storage_rewrite_urls: undefined,
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
```


Add `index.ts`

```ts
import type { 
  LambdaEvent, LambdaContext 
} from "@storecraft/platforms/aws-lambda";
import { app } from './app';

export const handler = async (event: LambdaEvent, context: LambdaContext) => {
  // will only init once
  await app.init();

  // handler
  return app.handler(event, context);
}
```

Now, Deploy locally

```zsh
npm run build
cdk synth --no-staging

# locally
sam local start-lambda -t ./cdk.out/AppStack.template.json
```