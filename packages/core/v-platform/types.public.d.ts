
export declare interface PlatformAdapter<PlatformNativeRequest, PlatformContext, H> {
  /**
   * convert a platform native request into web api request.
   * @param from something
   * @returns 
   */
  encode: (from: PlatformNativeRequest)=> Promise<Request>;

  /**
   * Handle the computed web response with context in case it is needed,
   * In node.js for example, we have to stream it into the native server-response.
   * @param web_response 
   * @param context 
   * @returns 
   */
  handleResponse: (web_response: Response, context: PlatformContext) => Promise<H>;

  /**
   * Get the environment variables of a platform
   */
  get env(): Record<string, string>;

  $from?: PlatformNativeRequest;
  $context?: PlatformContext;
}

export * from './public.js'