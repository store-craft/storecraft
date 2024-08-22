import type { 
  LambdaEvent, LambdaContext, APIGatewayProxyResult 
} from "@storecraft/platforms/aws-lambda";
import { app } from './app';

export const handler = async (event: LambdaEvent, context: LambdaContext): Promise<APIGatewayProxyResult> => {
  // return {
  //   body: 'hello ' + JSON.stringify(process.env),
  //   statusCode: 200,
  //   isBase64Encoded: false,
  //   headers: {}
  // }
  // // will only init once
  await app.init();

  // // handler
  const response = await app.handler(event, context);
  console.log('tomer', response);
  return response;
}