import { IncomingMessage, ServerResponse } from "node:http";

/**
 * @description This is a close approximation minus the `expressjs` methods
 * that google functions augment
 */
export interface GoogleFunctionRequest extends IncomingMessage {
  /**
   * A buffer which provides access to the request's raw HTTP body.
   */
  rawBody?: Buffer;
  /**
   * Request-specified execution ID.
   */
  executionId?: string;
  /**
   * Cloud Trace trace ID.
   */
  traceId?: string;
  /**
   * Cloud Trace span ID.
   */
  spanId?: string;
  /**
   * An AbortController used to signal cancellation of a function invocation (e.g. in case of time out).
   */
  abortController?: AbortController;
}

/**
 * @description This is a close approximation minus the `expressjs` methods
 * that google functions augment
 */
export interface GoogleFunctionResponse extends ServerResponse {}