export * from './index.js';

/**
 * gateway config
 */
export type Config = {
  currency_code: string;
  env: 'prod' | 'test';
  client_id: string;
  secret: string;
}
