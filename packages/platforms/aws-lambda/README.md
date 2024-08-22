# Storecraft AWS Lambda Platform support

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

## What does it do exactly ?

So, AWS Lambda is a serverless 
platform, there are three request types,
- APIGatewayProxyEvent 
- APIGatewayProxyEventV2 
- ALBProxyEvent

Basically, this adapter translates to and from this events into web request / response.

Most of the implementation is based on `hono` and adapted to `jsdocs` and pure js.


```bash
npm i @storecraft/platforms
```

## usage

```ts
import { App } from '@storecraft/core'
import { AWSLambdaPlatform } from '@storecraft/platforms/aws-lambda';
import { MongoDB } from '@storecraft/database-mongodb-node'
import { S3 } from '@storecraft/storage-s3-compatible'

const app = new App(
    config
  )
  .withPlatform(new AWSLambdaPlatform())
  .withDatabase(new MongoDB())
  .withStorage(new S3())


export const handler = async (event: LambdaEvent, lambdaContext?: LambdaContext): Promise<APIGatewayProxyResult> {
  // will be init only once
  await app.init();

  // react
  return app.handler(event);
}

```

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```