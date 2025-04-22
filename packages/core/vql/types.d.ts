// Query types
import type { BOOLQL } from './bool-ql/types.d.ts';

type legal_value_types = string | boolean | number;

type PickByValue<T, V> = Pick<T, { 
    [K in keyof T]: T[K] extends V ? K : never 
  }[keyof T]
>

type PickKeysByValueType<T, V> = keyof PickByValue<T, V>;

export type OPS<T extends any = any> = {
  /** @description Equal to */
  $eq?: T,
  /** @description Not equal to */
  $ne?: T,

  /** @description Greater than */
  $gt?: T,
  /** @description Greater than or equal to */
  $gte?: T,

  /** @description Less than */
  $lt?: T,
  /** @description Less than or equal to */
  $lte?: T,

  /** @description In */
  $in?: T[],
  /** @description Not in */
  $nin?: T[],

  /** @description Like */
  $like?: string,
}

export type VQL<T extends Record<string, any> = Record<string, any>> = {
  /**
   * @description Logical AND
   */
  $and?: VQL<T>[],

  /**
   * @description Logical OR
   */
  $or?: VQL<T>[],

  /**
   * @description Logical NOT
   */
  $not?: VQL<T>,
} | {
  [K in PickKeysByValueType<T, legal_value_types>]?: OPS<T[K]>
} | {
  /**
   * @description Search for a term in the search index
   */
  search?: string
}


// type CreateObjHelper<T> = {
//   [K in keyof T]: {
//       [K2 in keyof T]?: K2 extends K ? T[K2] : never
//   }
// }
// type CreateObjOneKey<T> = CreateObjHelper<T>[keyof CreateObjHelper<T>]

// type MyKeys = 'a' | 'b' | 'c'

// type SingleKey3<T> = CreateObjOneKey<T>


// type SingleKey2<T> = keyof T extends infer A | infer B ? never : T;


// // From https://stackoverflow.com/a/50375286
// type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

// // From: https://stackoverflow.com/a/53955431
// type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;

// // Here we come!
// type SingleKey<T> = IsUnion<keyof T> extends true ? never : {} extends T ? never : T;
