import type { LambdaEvent, LambdaContext } from "@storecraft/platforms/aws-lambda";
import { app } from './app';

export const handler = async (event: LambdaEvent, context: LambdaContext) => {
  await app.init();
  return app.handler(event, context);
}