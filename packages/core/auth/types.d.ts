import { 
  OAuthProviderCreateURIParams, SignWithOAuthProviderParams 
} from "../api/types.api.js";
import { App } from "../types.public.js";

/**
 * @description Auth provider `user`
 */
export type OAuthProviderUser = {
  email: string,
  firstname?: string,
  lastname?: string,
  picture?: string,
}

/**
 * @description Auth provider interface
 */
export interface AuthProvider<Config extends any = any> {
  config: Config

  /**
   * Generate an authentication URI
   * @param redirect_uri The url you registered at the provider
   * @param extra extra params, impl specific
   * @returns auth uri
   */
  generateAuthUri: (redirect_uri: string, extra: any) => Promise<string>;

  /**
   * Get a user based on the auth response that was carried out externally
   * @param params essentialy the `redirect_uri` and the previous `authorization-response`
   * @returns a user
   */
  signWithAuthorizationResponse: (
    params: Omit<SignWithOAuthProviderParams, 'provider'>
  ) => Promise<OAuthProviderUser>

  /**
   * Your chance to read platform specific env-vars for lazy and more secure config
   * @param app app instance
   */
  init?: (app: App) => (any | void)

  /**
   * @description Official readable name of provider
   */
  name: string

  /**
   * @description Official provider logo, `image url` or `svg` or any data uri
   */
  logo_url: string

  /**
   * @description Official description 
   */
  description: string
}