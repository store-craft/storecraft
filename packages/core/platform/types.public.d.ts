
export type InferPlatformNativeRequest<P> = P extends PlatformAdapter<infer A, infer B, infer C> ? A : any;
export type InferPlatformContext<P> = P extends PlatformAdapter<infer A, infer B, infer C> ? B : any;
export type InferPlatformNativeResponse<P> = P extends PlatformAdapter<infer A, infer B, infer C> ? C : any;

/**
 * 
 * @template PlatformNativeRequest The `native` `http` request in the platform
 * @template PlatformContext Additional `context`
 * @template PlatformNativeResponse Additional `handleResponse` result
 */
export declare interface PlatformAdapter<
    PlatformNativeRequest, PlatformContext={}, PlatformNativeResponse={}
  > {
    
  /**
   * @description convert a platform native request into web api request.
   * 
   * @param from something
   * 
   * @returns {Promise<Request>}
   */
  encode: (from: PlatformNativeRequest, context: PlatformContext)=> Promise<Request>;

  /**
   * @description Handle the computed web response with 
   * context in case it is needed, In node.js for example, 
   * we have to stream it into the native server-response.
   * 
   * @param web_response web standard `response` object
   * @param context additional `context`
   * 
   * 
   * @returns {Promise<PlatformNativeResponse>} 
   */
  handleResponse: (web_response: Response, context: PlatformContext) => Promise<PlatformNativeResponse>;

  /**
   * @description (Optional) crypto implementation for hashing and verifying passwords
   * and hashed passwords
   */
  crypto?: {
    /**
     * @description Given a password, hash it
     * @param password The password to hash
     * @returns a Hash
     */
    hash: (password: string) => Promise<string>,

    /**
     * @description Given a hashed password and a password, verify the hash corresponds to the password.
     * @param hash The hashed password
     * @param password The password to verify
     * @returns a boolean `true` / `false`
     */
    verify: (hash: string, password: string) => Promise<boolean>,
  }

  /**
   * 
   * @description Get the environment variables of a platform
   */
  get env(): Record<string, string | undefined>;

  $from?: PlatformNativeRequest;
  $response?: PlatformNativeResponse;
  $context?: PlatformContext;
}

// export {} from './public.js'