import { StringReference } from "kysely";

export type NoActive<T> = T extends {active:number} ? Omit<T, 'active'> & {active: boolean} : T;
export type ReplaceValues<T, Find extends any=any, ReplaceWith extends any=any> = {
  [K in keyof T]: T[K] extends Find ? ReplaceWith : T[K]
};

export type ReplaceValuesOfKeys<T, Find extends keyof T=keyof T, ReplaceWith extends any=any> = {
  [K in keyof T]: K extends Find ? ReplaceWith : T[K]
};

export type NO<T> = {
  [P in keyof T]: T[P]
}

export type OrderByDirection = 'asc' | 'desc';
export type DirectedOrderByStringReference<DB, TB extends keyof DB, O> = `${StringReference<DB, TB> | (keyof O & string)} ${OrderByDirection}`;
