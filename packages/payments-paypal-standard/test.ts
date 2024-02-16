import { CheckoutStatusEnum } from '@storecraft/core';

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

export type BB = {[P in keyof PaymentOptionsEnum]: PaymentOptionsEnum[P]}

type Rea<T> = {
  readonly [P in keyof T]: T[P];
};

let a: BB;
a.a = 5
type ReturnType<T extends any> = T extends (...args: any) => infer R ? R : any;

type a = typeof CheckoutStatusEnum.authorized