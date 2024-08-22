export { GoogleStorage } from './index.js';

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
  /** bucket name */
  bucket: string;
  /** client email from the service file */
  client_email: string;
  /** private key */
  private_key: string;
  /** private key id */
  private_key_id: string;
}