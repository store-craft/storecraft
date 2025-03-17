export type * from './types.api.d.ts';
export type * from './types.api.query.d.ts';
export type * from '../mailer/types.public.d.ts';
export * from './public.js';

// Auth providers

/**
 * @description The OAuth Identity Provider
 */
export type OAuthProvider = {
  /**
   * @description The unique `handle` of the provider
   */
  provider: string,
  /**
   * @description The readable name of the provider
   */
  name: string,
  /**
   * @description The URL to the logo of the provider, can be a data URL
   * with `data:image/svg+xml;utf8,`
   */
  logo_url?: string,
  /**
   * @description The description of the provider
   */
  description?: string
}

/**
 * @description Parameters for inferring a URI to redirect users
 * when doing a social login. This is a helper method and completely optional
 */
export interface OAuthProviderCreateURIParams {
  /**
   * @description **OAuth** provider identifier/handle
   */
  provider: string,
  /**
   * @description URI that you registered at the provider website
   * to redirect into
   */
  redirect_uri: string,
  extra_parameters?: Record<string, string>
}

/**
 */
export interface OAuthProviderCreateURIResponse {
  /**
   * @description **OAuth** provider identifier/handle
   */
  provider: string,

  /**
   * @description The uri of consent screen for authorization
   */
  uri: string
}

/**
 * @description Signin / Signup with an OAuth provider
 */
export interface SignWithOAuthProviderParams {
  /**
   * @description **OAuth** provider identifier/handle
   */
  provider: string,

  /**
   * @description The URI for which the Idp redirects the user that you 
   * registered at the provider website to redirect into
   */
  redirect_uri: string,
  
  /**
   * @description The Response from the authorization response with the
   * **OAuth** provider. Usually this is communicated to the website as search params
   * with `code` key after the redirect accomplishes
   */
  authorization_response?: Record<string, string>
}

