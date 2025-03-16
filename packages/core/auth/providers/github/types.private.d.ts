
export type exchange_authorization_for_token_body = {
  /** 	The client ID obtained from the Cloud Console Clients page. */
  client_id: string
  /** The client secret obtained from the Cloud Console Clients page. */
  client_secret: string
  /** The authorization code returned from the initial request. */
  code: string
  /** As defined in the OAuth 2.0 specification, this field's value must be set to authorization_code. */
  grant_type: 'authorization_code'
  /** One of the redirect URIs listed for your project in the Cloud Console Clients page for the given client_id. */
  redirect_uri: string	
}

export type exchange_authorization_for_token_response = {
  /** The token that your application sends to authorize a Google API request. */
  access_token: string
  /** The remaining lifetime of the access token in seconds. */	
  expires_in: number	
  /** A token that you can use to obtain a new access token. Refresh tokens are valid until the user revokes access or the refresh token expires. Again, this field is only present in this response if you set the access_type parameter to offline in the initial request to Google's authorization server. */
  refresh_token: string	
  /** The remaining lifetime of the refresh token in seconds. This value is only set when the user grants time-based access. */
  refresh_token_expires_in: number	
  /** The scopes of access granted by the access_token expressed as a list of space-delimited, case-sensitive strings. */
  scope: string	
  token_type: 'Bearer',
  id_token: string
}

export type token_info_response = {
  email: string,
  email_verified: boolean,
  name: string,
  picture: string,
  given_name: string,
  family_name: string,
}