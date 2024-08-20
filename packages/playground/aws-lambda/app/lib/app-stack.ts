#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const fn = new NodejsFunction(
      this, 'lambda', 
      {
        entry: 'lib/lambda/index.ts',
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_20_X,
        functionName: 'storecraft',
        environment: process.env as lambda.FunctionOptions["environment"],
        timeout: cdk.Duration.seconds(15)
      }
    );

    fn.addFunctionUrl(
      {
        authType: lambda.FunctionUrlAuthType.NONE,
      }
    );

    new apigw.LambdaRestApi(
      this, 'api', 
      {
        handler: fn,
      }
    );
  }
}

