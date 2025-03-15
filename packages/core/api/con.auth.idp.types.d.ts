import { JWTClaims } from "../crypto/jwt.js"

export type OAuthProvider = {
  provider: string,
  name: string,
  logo_url: string,
  description: string
}

export type OAuthClaims = JWTClaims & {
  email:? string, 
  given_name?: string,
  family_name?: string,
  picture?: string,
  roles?: string[]
}


///

