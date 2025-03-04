export { GoogleStorage } from './adapter.js';

export type ServiceFile = {
  type?: string;
  project_id?: string;
  private_key_id?: string;
  private_key?: string;
  client_email?: string;
  client_id?: string;
  auth_uri?: string;
  token_uri?: string;
  auth_provider_x509_cert_url?: string;
  client_x509_cert_url?: string;
  universe_domain?: string;
}

export type Config = {
  /** bucket name, if missing will be inferred by env variable `GS_BUCKET` */
  bucket?: string;
  /** client email from the service file, if missing will be inferred by env variable `GS_CLIENT_EMAIL` */
  client_email?: string;
  /** private key, if missing will be inferred by env variable `GS_PRIVATE_KEY` */
  private_key?: string;
  /** private key id, if missing will be inferred by env variable `GS_PRIVATE_KEY_ID` */
  private_key_id?: string;
}