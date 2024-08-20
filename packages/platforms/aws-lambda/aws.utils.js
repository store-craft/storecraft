import { decode, encode } from '@storecraft/core/v-crypto/base64.js'

/**
 * @description Implementation is taken from `hono` project and adapted to jsdocs
 * @template {import('./types.private.d.ts').LambdaEvent} E
 * @abstract
 */
class EventProcessor {
  /**
   * @protected
   * @abstract
   * @param {E} event 
   * @returns {string}
   */
  getPath(event) { throw '' }

  /**
   * @protected
   * @abstract
   * @param {E} event 
   * @returns {string}
   */
  getMethod(event) { throw ''};

  /**
   * @protected
   * @abstract
   * @param {E} event 
   * @returns {string}
   */
  getQueryString(event) { throw ' '}

  /**
   * @protected
   * @abstract
   * @param {E} event 
   * @returns {Headers}
   */
  getHeaders(event) { throw '' }

  /**
   * @protected
   * @abstract
   * @param {E} event 
   * @param {Headers} headers 
   * @returns {void}
   */
  getCookies(event, headers) { throw '' }

  /**
   * @protected
   * @abstract
   * @param {E} event 
   * @param {import('./types.private.d.ts').APIGatewayProxyResult} result 
   * @param {string[]} cookies
   * @returns {void}
   */
  setCookiesToResult(
    event,
    result,
    cookies
  ) {
    throw ''
  }

  /**
   * 
   * @param {E} event 
   * @returns {Request}
   */
  createRequest(event) {
    const queryString = this.getQueryString(event)
    const domainName =
      event.requestContext && 'domainName' in event.requestContext
        ? event.requestContext.domainName
        : event.headers?.['host'] ?? event.multiValueHeaders?.['host']?.[0]
    const path = this.getPath(event)
    const urlPath = `https://${domainName}${path}`
    const url = queryString ? `${urlPath}?${queryString}` : urlPath

    const headers = this.getHeaders(event)

    const method = this.getMethod(event)

    /** @type {RequestInit} */
    const requestInit = {
      headers,
      method,
    }

    if (event.body) {
      requestInit.body = event.isBase64Encoded ? decode(event.body) : event.body
    }

    return new Request(url, requestInit)
  }

  /**
   * 
   * @param {E} event 
   * @param {Response} res 
   * @returns {Promise<import('./types.private.d.ts').APIGatewayProxyResult>}
   */
  async createResult(event, res) {
    const contentType = res.headers.get('content-type')
    let isBase64Encoded = contentType && isContentTypeBinary(contentType) ? true : false

    if (!isBase64Encoded) {
      const contentEncoding = res.headers.get('content-encoding')
      isBase64Encoded = isContentEncodingBinary(contentEncoding)
    }

    const body = isBase64Encoded ? encode(await res.arrayBuffer()) : await res.text()

    /** @type {import('./types.private.d.ts').APIGatewayProxyResult} */
    const result = {
      body: body,
      headers: {},
      multiValueHeaders: event.multiValueHeaders ? {} : undefined,
      statusCode: res.status,
      isBase64Encoded,
    }

    this.setCookies(event, res, result)
    res.headers.forEach(
      (value, key) => {
        result.headers[key] = value
        if (event.multiValueHeaders && result.multiValueHeaders) {
          result.multiValueHeaders[key] = [value]
        }
      }
    );

    return result
  }

  /**
   * 
   * @param {E} event 
   * @param {Response} res 
   * @param {import('./types.private.d.ts').APIGatewayProxyResult} result 
   */
  setCookies(event, res, result) {
    if (res.headers.has('set-cookie')) {
      const cookies = res.headers.getSetCookie
        ? res.headers.getSetCookie()
        : Array.from(res.headers.entries())
            .filter(([k]) => k === 'set-cookie')
            .map(([, v]) => v)

      if (Array.isArray(cookies)) {
        this.setCookiesToResult(event, result, cookies)
        res.headers.delete('set-cookie')
      }
    }
  }
}


/**
 * @typedef {EventProcessor<
 *  import('./types.private.d.ts').APIGatewayProxyEventV2
 * >} EventProcessor_EventV2Processor
 * 
 */
class EventV2Processor extends EventProcessor {

  /** @type {EventProcessor_EventV2Processor["getPath"]} */
  getPath(event) { return event.rawPath }

  /** @type {EventProcessor_EventV2Processor["getMethod"]} */
  getMethod(event) {
    return event.requestContext.http.method
  }

  /** @type {EventProcessor_EventV2Processor["getQueryString"]} */
  getQueryString(event) {
    return event.rawQueryString
  }

  /** @type {EventProcessor_EventV2Processor["getCookies"]} */
  getCookies(event, headers) {
    if (Array.isArray(event.cookies)) {
      headers.set('Cookie', event.cookies.join('; '))
    }
  }

  /** @type {EventProcessor_EventV2Processor["setCookiesToResult"]} */
  setCookiesToResult(
    _,
    result,
    cookies
  ) {
    result.cookies = cookies
  }

  /** @type {EventProcessor_EventV2Processor["getHeaders"]} */
  getHeaders(event) {
    const headers = new Headers()
    this.getCookies(event, headers)
    if (event.headers) {
      for (const [k, v] of Object.entries(event.headers)) {
        if (v) {
          headers.set(k, v)
        }
      }
    }
    return headers
  }
}

const v2Processor = new EventV2Processor();

/**
 * @typedef {EventProcessor<
 *  Exclude<
 *    import('./types.private.d.ts').LambdaEvent, 
 *    import('./types.private.d.ts').APIGatewayProxyEventV2
 *  >
 * >} EventProcessor_EventV1Processor
 * 
 */
class EventV1Processor extends EventProcessor {

  /** @type {EventProcessor_EventV1Processor["getPath"]} */
  getPath(event) { return event.path }

  /** @type {EventProcessor_EventV1Processor["getMethod"]} */
  getMethod(event) {
    return event.httpMethod
  }

  /** @type {EventProcessor_EventV1Processor["getQueryString"]} */
  getQueryString(event) {
    return Object.entries(event.queryStringParameters || {})
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
  }

  /** @type {EventProcessor_EventV1Processor["getCookies"]} */
  getCookies(event, headers) {
    return;
  }

  /** @type {EventProcessor_EventV1Processor["setCookiesToResult"]} */
  setCookiesToResult(
    _,
    result,
    cookies
  ) {
    result.multiValueHeaders = {
      'set-cookie': cookies,
    }
  }

  /** @type {EventProcessor_EventV1Processor["getHeaders"]} */
  getHeaders(event) {
    const headers = new Headers()
    this.getCookies(event, headers)
    if (event.headers) {
      for (const [k, v] of Object.entries(event.headers)) {
        if (v) {
          headers.set(k, v)
        }
      }
    }
    if (event.multiValueHeaders) {
      for (const [k, values] of Object.entries(event.multiValueHeaders)) {
        if (values) {
          // avoid duplicating already set headers
          const foundK = headers.get(k)
          values.forEach((v) => (!foundK || !foundK.includes(v)) && headers.append(k, v))
        }
      }
    }
    return headers
  }
}


const v1Processor = new EventV1Processor();


/**
 * @typedef {EventProcessor<import('./types.private.d.ts').ALBProxyEvent>} EventProcessor_ALBProcessor
 * 
 */
class ALBProcessor extends EventProcessor {

  /** @type {EventProcessor_ALBProcessor["getPath"]} */
  getPath(event) { return event.path }

  /** @type {EventProcessor_ALBProcessor["getMethod"]} */
  getMethod(event) {
    return event.httpMethod
  }

  /** @type {EventProcessor_ALBProcessor["getQueryString"]} */
  getQueryString(event) {
    // In the case of ALB Integration either queryStringParameters or 
    // multiValueQueryStringParameters can be present not both
    /* 
      In other cases like when using the serverless framework, the event 
      object does contain both queryStringParameters and multiValueQueryStringParameters:
      Below is an example event object for this URL: /payment/b8c55e69?select=amount&select=currency
      {
        ...
        queryStringParameters: { select: 'currency' },
        multiValueQueryStringParameters: { select: [ 'amount', 'currency' ] },
      }
      The expected results is for select to be an array with two items. 
      However the pre-fix code is only returning one item ('currency') in the array.
      A simple fix would be to invert the if statement and check the 
      multiValueQueryStringParameters first.
    */
    if (event.multiValueQueryStringParameters) {
      return Object.entries(event.multiValueQueryStringParameters || {})
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}=${value.join(`&${key}=`)}`)
        .join('&')
    } else {
      return Object.entries(event.queryStringParameters || {})
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')
    }  
  }

  /** @type {EventProcessor_ALBProcessor["getCookies"]} */
  getCookies(event, headers) {
    let cookie
    if (event.multiValueHeaders) {
      cookie = event.multiValueHeaders['cookie']?.join('; ')
    } else {
      cookie = event.headers ? event.headers['cookie'] : undefined
    }
    if (cookie) {
      headers.append('Cookie', cookie)
    }
  }

  /** @type {EventProcessor_ALBProcessor["setCookiesToResult"]} */
  setCookiesToResult(
    event,
    result,
    cookies
  ) {
    // when multi value headers is enabled
    if (event.multiValueHeaders && result.multiValueHeaders) {
      result.multiValueHeaders['set-cookie'] = cookies
    } else {
      // otherwise serialize the set-cookie
      result.headers['set-cookie'] = cookies.join(', ')
    }
  }

 /** @type {EventProcessor_ALBProcessor["getHeaders"]} */
  getHeaders(event) {
    const headers = new Headers()
    // if multiValueHeaders is present the ALB will use it instead of the headers field
    // https://docs.aws.amazon.com/elasticloadbalancing/latest/application/lambda-functions.html#multi-value-headers
    if (event.multiValueHeaders) {
      for (const [key, values] of Object.entries(event.multiValueHeaders)) {
        if (values && Array.isArray(values)) {
          // https://www.rfc-editor.org/rfc/rfc9110.html#name-common-rules-for-defining-f
          headers.set(key, values.join('; '))
        }
      }
    } else {
      for (const [key, value] of Object.entries(event.headers ?? {})) {
        if (value) {
          headers.set(key, value)
        }
      }
    }
    return headers
  }
}


const albProcessor = new ALBProcessor();

/**
 * 
 * @param {import('./types.private.d.ts').LambdaEvent} event 
 * @returns {EventProcessor<import('./types.private.d.ts').LambdaEvent>}
 */
export const getProcessor = (event) => {
  if (isProxyEventALB(event)) {
    return albProcessor
  }
  if (isProxyEventV2(event)) {
    return v2Processor
  }
  return v1Processor
}

/**
 * @param {import('./types.private.d.ts').LambdaEvent} event 
 */
const isProxyEventALB = (event) => {
  return Object.hasOwn(event.requestContext, 'elb')
}

/**
 * @param {import('./types.private.d.ts').LambdaEvent} event 
 */
const isProxyEventV2 = (event) => {
  return Object.hasOwn(event, 'rawPath')
}

/**
 * @param {string} contentType 
 */
export const isContentTypeBinary = (contentType) => {
  return !/^(text\/(plain|html|css|javascript|csv).*|application\/(.*json|.*xml).*|image\/svg\+xml.*)$/.test(
    contentType
  )
}

/**
 * 
 * @param {string} [contentEncoding] 
 */
export const isContentEncodingBinary = (contentEncoding) => {
  if (contentEncoding === null) {
    return false
  }
  return /^(gzip|deflate|compress|br)/.test(contentEncoding)
}


// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
// globalThis.crypto ??= crypto

// const getRequestContext = (
//   event: LambdaEvent
// ): ApiGatewayRequestContext | ApiGatewayRequestContextV2 | ALBRequestContext => {
//   return event.requestContext
// }

// const streamToNodeStream = async (
//   reader: ReadableStreamDefaultReader<Uint8Array>,
//   writer: NodeJS.WritableStream
// ): Promise<void> => {
//   let readResult = await reader.read()
//   while (!readResult.done) {
//     writer.write(readResult.value)
//     readResult = await reader.read()
//   }
//   writer.end()
// }

// export const streamHandle = <
//   E extends Env = Env,
//   S extends Schema = {},
//   BasePath extends string = '/'
// >(
//   app: Hono<E, S, BasePath>
// ): Handler => {
//   // @ts-expect-error awslambda is not a standard API
//   return awslambda.streamifyResponse(
//     async (event: LambdaEvent, responseStream: NodeJS.WritableStream, context: LambdaContext) => {
//       const processor = getProcessor(event)
//       try {
//         const req = processor.createRequest(event)
//         const requestContext = getRequestContext(event)

//         const res = await app.fetch(req, {
//           event,
//           requestContext,
//           context,
//         })

//         const headers: Record<string, string> = {}
//         const cookies: string[] = []
//         res.headers.forEach((value, name) => {
//           if (name === 'set-cookie') {
//             cookies.push(value)
//           } else {
//             headers[name] = value
//           }
//         })

//         // Check content type
//         const httpResponseMetadata = {
//           statusCode: res.status,
//           headers,
//           cookies,
//         }

//         // Update response stream
//         // @ts-expect-error awslambda is not a standard API
//         responseStream = awslambda.HttpResponseStream.from(responseStream, httpResponseMetadata)

//         if (res.body) {
//           await streamToNodeStream(res.body.getReader(), responseStream)
//         } else {
//           responseStream.write('')
//         }
//       } catch (error) {
//         console.error('Error processing request:', error)
//         responseStream.write('Internal Server Error')
//       } finally {
//         responseStream.end()
//       }
//     }
//   )
// }


// /**
//  * Accepts events from API Gateway/ELB(`APIGatewayProxyEvent`) and directly through Function Url(`APIGatewayProxyEventV2`)
//  */
// export const handle = <E extends Env = Env, S extends Schema = {}, BasePath extends string = '/'>(
//   app: Hono<E, S, BasePath>
// ): ((event: LambdaEvent, lambdaContext?: LambdaContext) => Promise<APIGatewayProxyResult>) => {
//   return async (event, lambdaContext?) => {
//     const processor = getProcessor(event)

//     const req = processor.createRequest(event)
//     const requestContext = getRequestContext(event)

//     const res = await app.fetch(req, {
//       event,
//       requestContext,
//       lambdaContext,
//     })

//     return processor.createResult(event, res)
//   }
// }
