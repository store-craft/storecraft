import { compile_app } from './compile.app.js'
import { compile_migrate } from './compile.migrate.js';
import { 
  combine_and_pretty, Packager 
} from './compile.platform.utils.js';
import { prettify } from './compile.utils.js';


/**
 * 
 * @param {import("./compile.app.js").Meta} meta 
 */
export const compile = async (meta) => {
  const compiled_app = compile_app(meta);
  const post = meta.config.is_typescript ? 'ts' : 'js';
  const pkgr = new Packager(meta.config.config.general_store_name);

  await pkgr.init();
  await pkgr.installDeps(
    [
      ...compiled_app.deps,
      "aws-cdk-lib", "constructs", "source-map-support"
    ]
  );
  await pkgr.installDevDeps(
    [ 
      "dotenv", "@types/node", "@types/jest", "aws-cdk",
      "jest", "ts-jest", "ts-node", "typescript", "dotenv"
    ]
  );
  const package_json = await pkgr.package_json();
  await pkgr.write_package_json(
    { 
      ...package_json, 
      "type": "module",
      "name": "app",
      "bin": {
        "app": "bin/app.js"
      },
      "scripts": {
        "build": "npx tsc",
        "watch": "npx tsc -w",
        "test": "npx jest",
        "cdk": "cdk",
        "all": "npm run build && npx cdk synth --no-staging && sam local start-api --debug --warm-containers EAGER -t ./cdk.out/AppStack.template.json",
        "migrate": `node ./migrate.${post}`
      }
    }
  );
  await pkgr.write_tsconfig_json(tsconfig_json());
  await pkgr.write_file(
    `bin/app.${post}`,
    await prettify(bin_app_ts())
  );
  await pkgr.write_file(
    `lib/app-stack.ts`,
    await prettify(lib_app_stack_ts())
  );
  await pkgr.write_file(
    `lib/lambda/index.ts`,
    await prettify(lib_lambda_index_ts())
  );
  await pkgr.write_file(
    `lib/lambda/app.ts`,
    await combine_and_pretty(
      ...compiled_app.imports, '\r\n',
      'export const app = ' + compiled_app.code
    )
  );
  await pkgr.write_file(
    `migrate.${post}`, compile_migrate(meta)
  );
  await pkgr.write_file(
    'cdk.json', cdk_json()
  );
  await pkgr.write_file(
    'README.md', readme_md()
  );

}

const bin_app_ts = () => `
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';

const app = new cdk.App();
new AppStack(app, 'AppStack', {
  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
`;

const lib_app_stack_ts = () => `
#!/usr/bin/env node
import 'dotenv/config';
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
`;

const lib_lambda_index_ts = () => `
import type { 
  LambdaEvent, LambdaContext, APIGatewayProxyResult 
} from "@storecraft/platforms/aws-lambda";
import { app } from './app';

export const handler = async (event: LambdaEvent, context: LambdaContext): Promise<APIGatewayProxyResult> => {
  // // will only init once
  await app.init();

  // // handler
  const response = await app.handler(event, context);

  return response;
}
`;


const readme_md = () => {
  return `
# Storecraft Example
<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

First, make sure you meet this prerequisits:
- Install the \`aws-cli\`, [instruction](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- Install [SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) for local testing.
- Make sure you have \`docker\` installed and docker deamon is **running**.


\`\`\`zsh
npm install
\`\`\`

Now, migrate database with
\`\`\`zsh
npm run migrate
\`\`\`


Now, run the app
\`\`\`zsh
npm run all
\`\`\`

Now, open 
- \`http://localhost:8080/api/dashboard\`
- \`http://localhost:8080/api/reference\`


\`\`\`text
Author: Tomer Shalev (tomer.shalev@gmail.com)
\`\`\`
`
}

const tsconfig_json = () => `
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": [
      "es2020",
      "dom"
    ],
    "declaration": true,
    "allowJs": true,
    "maxNodeModuleJsDepth": 10,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": false,
    "inlineSourceMap": true,
    "inlineSources": true,
    "experimentalDecorators": true,
    "strictPropertyInitialization": false,
    "typeRoots": [
      "./node_modules/@types"
    ]
  },
  "exclude": [
    "jest.config.js",
    "node_modules",
    "cdk.out"
  ]
}
`;

const cdk_json = () => `
{
  "app": "npx ts-node --prefer-ts-exts bin/app.ts",
  "watch": {
    "include": [
      "**"
    ],
    "exclude": [
      "README.md",
      "cdk*.json",
      "**/*.d.ts",
      "**/*.js",
      "tsconfig.json",
      "package*.json",
      "yarn.lock",
      "node_modules",
      "test"
    ]
  },
  "context": {
    "@aws-cdk/aws-lambda:recognizeLayerVersion": true,
    "@aws-cdk/core:checkSecretUsage": true,
    "@aws-cdk/core:target-partitions": [
      "aws",
      "aws-cn"
    ],
    "@aws-cdk-containers/ecs-service-extensions:enableDefaultLogDriver": true,
    "@aws-cdk/aws-ec2:uniqueImdsv2TemplateName": true,
    "@aws-cdk/aws-ecs:arnFormatIncludesClusterName": true,
    "@aws-cdk/aws-iam:minimizePolicies": true,
    "@aws-cdk/core:validateSnapshotRemovalPolicy": true,
    "@aws-cdk/aws-codepipeline:crossAccountKeyAliasStackSafeResourceName": true,
    "@aws-cdk/aws-s3:createDefaultLoggingPolicy": true,
    "@aws-cdk/aws-sns-subscriptions:restrictSqsDescryption": true,
    "@aws-cdk/aws-apigateway:disableCloudWatchRole": true,
    "@aws-cdk/core:enablePartitionLiterals": true,
    "@aws-cdk/aws-events:eventsTargetQueueSameAccount": true,
    "@aws-cdk/aws-ecs:disableExplicitDeploymentControllerForCircuitBreaker": true,
    "@aws-cdk/aws-iam:importedRoleStackSafeDefaultPolicyName": true,
    "@aws-cdk/aws-s3:serverAccessLogsUseBucketPolicy": true,
    "@aws-cdk/aws-route53-patters:useCertificate": true,
    "@aws-cdk/customresources:installLatestAwsSdkDefault": false,
    "@aws-cdk/aws-rds:databaseProxyUniqueResourceName": true,
    "@aws-cdk/aws-codedeploy:removeAlarmsFromDeploymentGroup": true,
    "@aws-cdk/aws-apigateway:authorizerChangeDeploymentLogicalId": true,
    "@aws-cdk/aws-ec2:launchTemplateDefaultUserData": true,
    "@aws-cdk/aws-secretsmanager:useAttachedSecretResourcePolicyForSecretTargetAttachments": true,
    "@aws-cdk/aws-redshift:columnId": true,
    "@aws-cdk/aws-stepfunctions-tasks:enableEmrServicePolicyV2": true,
    "@aws-cdk/aws-ec2:restrictDefaultSecurityGroup": true,
    "@aws-cdk/aws-apigateway:requestValidatorUniqueId": true,
    "@aws-cdk/aws-kms:aliasNameRef": true,
    "@aws-cdk/aws-autoscaling:generateLaunchTemplateInsteadOfLaunchConfig": true,
    "@aws-cdk/core:includePrefixInUniqueNameGeneration": true,
    "@aws-cdk/aws-efs:denyAnonymousAccess": true,
    "@aws-cdk/aws-opensearchservice:enableOpensearchMultiAzWithStandby": true,
    "@aws-cdk/aws-lambda-nodejs:useLatestRuntimeVersion": true,
    "@aws-cdk/aws-efs:mountTargetOrderInsensitiveLogicalId": true,
    "@aws-cdk/aws-rds:auroraClusterChangeScopeOfInstanceParameterGroupWithEachParameters": true,
    "@aws-cdk/aws-appsync:useArnForSourceApiAssociationIdentifier": true,
    "@aws-cdk/aws-rds:preventRenderingDeprecatedCredentials": true,
    "@aws-cdk/aws-codepipeline-actions:useNewDefaultBranchForCodeCommitSource": true,
    "@aws-cdk/aws-cloudwatch-actions:changeLambdaPermissionLogicalIdForLambdaAction": true,
    "@aws-cdk/aws-codepipeline:crossAccountKeysDefaultValueToFalse": true,
    "@aws-cdk/aws-codepipeline:defaultPipelineTypeToV2": true,
    "@aws-cdk/aws-kms:reduceCrossAccountRegionPolicyScope": true,
    "@aws-cdk/aws-eks:nodegroupNameAttribute": true,
    "@aws-cdk/aws-ec2:ebsDefaultGp3Volume": true,
    "@aws-cdk/aws-ecs:removeDefaultDeploymentAlarm": true,
    "@aws-cdk/custom-resources:logApiResponseDataPropertyTrueDefault": false
  }
}

`;