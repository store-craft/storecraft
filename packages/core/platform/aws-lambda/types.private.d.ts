/* eslint-disable @typescript-eslint/no-explicit-any */

export interface CognitoIdentity {
  cognitoIdentityId: string
  cognitoIdentityPoolId: string
}

export interface ClientContext {
  client: ClientContextClient
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Custom?: any
  env: ClientContextEnv
}

export interface ClientContextClient {
  installationId: string
  appTitle: string
  appVersionName: string
  appVersionCode: string
  appPackageName: string
}

export interface ClientContextEnv {
  platformVersion: string
  platform: string
  make: string
  model: string
  locale: string
}

/**
 * {@link Handler} context parameter.
 * See {@link https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html AWS documentation}.
 */
export interface LambdaContext {
  callbackWaitsForEmptyEventLoop: boolean
  functionName: string
  functionVersion: string
  invokedFunctionArn: string
  memoryLimitInMB: string
  awsRequestId: string
  logGroupName: string
  logStreamName: string
  identity?: CognitoIdentity | undefined
  clientContext?: ClientContext | undefined

  getRemainingTimeInMillis(): number
}

type Callback<TResult = any> = (error?: Error | string | null, result?: TResult) => void

export type Handler<TEvent = any, TResult = any> = (
  event: TEvent,
  context: LambdaContext,
  callback: Callback<TResult>
) => void | Promise<TResult>

interface ClientCert {
  clientCertPem: string
  subjectDN: string
  issuerDN: string
  serialNumber: string
  validity: {
    notBefore: string
    notAfter: string
  }
}

interface Identity {
  accessKey?: string
  accountId?: string
  caller?: string
  cognitoAuthenticationProvider?: string
  cognitoAuthenticationType?: string
  cognitoIdentityId?: string
  cognitoIdentityPoolId?: string
  principalOrgId?: string
  sourceIp: string
  user?: string
  userAgent: string
  userArn?: string
  clientCert?: ClientCert
}

export interface ApiGatewayRequestContext {
  accountId: string
  apiId: string
  authorizer: {
    claims?: unknown
    scopes?: unknown
  }
  domainName: string
  domainPrefix: string
  extendedRequestId: string
  httpMethod: string
  identity: Identity
  path: string
  protocol: string
  requestId: string
  requestTime: string
  requestTimeEpoch: number
  resourceId?: string
  resourcePath: string
  stage: string
}

interface Authorizer {
  iam?: {
    accessKey: string
    accountId: string
    callerId: string
    cognitoIdentity: null
    principalOrgId: null
    userArn: string
    userId: string
  }
}

export interface ApiGatewayRequestContextV2 {
  accountId: string
  apiId: string
  authentication: null
  authorizer: Authorizer
  domainName: string
  domainPrefix: string
  http: {
    method: string
    path: string
    protocol: string
    sourceIp: string
    userAgent: string
  }
  requestId: string
  routeKey: string
  stage: string
  time: string
  timeEpoch: number
}

export interface ALBRequestContext {
  elb: {
    targetGroupArn: string
  }
}

export type LambdaEvent = APIGatewayProxyEvent | APIGatewayProxyEventV2 | ALBProxyEvent

// When calling HTTP API or Lambda directly through function urls
export interface APIGatewayProxyEventV2 {
  version: string
  routeKey: string
  headers: Record<string, string | undefined>
  multiValueHeaders?: undefined
  cookies?: string[]
  rawPath: string
  rawQueryString: string
  body: string | null
  isBase64Encoded: boolean
  requestContext: ApiGatewayRequestContextV2
  queryStringParameters?: {
    [name: string]: string | undefined
  }
  pathParameters?: {
    [name: string]: string | undefined
  }
  stageVariables?: {
    [name: string]: string | undefined
  }
}

// When calling Lambda through an API Gateway
export interface APIGatewayProxyEvent {
  version: string
  httpMethod: string
  headers: Record<string, string | undefined>
  multiValueHeaders?: {
    [headerKey: string]: string[]
  }
  path: string
  body: string | null
  isBase64Encoded: boolean
  queryStringParameters?: Record<string, string | undefined>
  requestContext: ApiGatewayRequestContext
  resource: string
  multiValueQueryStringParameters?: {
    [parameterKey: string]: string[]
  }
  pathParameters?: Record<string, string>
  stageVariables?: Record<string, string>
}

// When calling Lambda through an Application Load Balancer
export interface ALBProxyEvent {
  httpMethod: string
  headers?: Record<string, string | undefined>
  multiValueHeaders?: Record<string, string[] | undefined>
  path: string
  body: string | null
  isBase64Encoded: boolean
  queryStringParameters?: Record<string, string | undefined>
  multiValueQueryStringParameters?: {
    [parameterKey: string]: string[]
  }
  requestContext: ALBRequestContext
}

export interface APIGatewayProxyResult {
  statusCode: number
  statusDescription?: string
  body: string
  headers: Record<string, string>
  cookies?: string[]
  multiValueHeaders?: {
    [headerKey: string]: string[]
  }
  isBase64Encoded: boolean
}

