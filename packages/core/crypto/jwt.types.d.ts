export type JWTClaims = {
  /** (issuer): Issuer of the JWT */
  iss: string;
  /** (subject): Subject of the JWT (the user) */
  sub: string;
  /** (audience): Recipient for which the JWT is intended */
  aud: string;
  /** (expiration time): Time after which the JWT expires */
  exp: number;
  /** (not before time): Time before which the JWT must not be accepted for processing */
  nbf: number;
  /** (issued at time): Time at which the JWT was issued; can be used to determine age of the JWT */
  iat: number;
  /** (JWT ID): Unique identifier; can be used to prevent the JWT from being replayed (allows a token to be used only once) */
  jti: string;
  [x: string]: any;
}