import { PaymentOptionsEnum } from '@storecraft/core';

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

export type BB = {
  [P in keyof PaymentOptionsEnum]: PaymentOptionsEnum[P]
}

type Rea<T> = {
  readonly [P in keyof T]: T[P];
};
