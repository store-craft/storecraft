// Query types
import type { BOOLQL } from './bool-ql/types.d.ts';

type legal_value_types = string | boolean | number;

type PickByValue<T, V> = Pick<T, { 
    [K in keyof T]: T[K] extends V ? K : never 
  }[keyof T]
>

type PickKeysByValueType<T, V> = keyof PickByValue<T, V>


export type VQL<T extends any = any> = {
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
} & {
  [K in PickKeysByValueType<T, legal_value_types>]?: {
    /**
     * @description Equal to
     */
    $eq?: T[K],

    /**
     * @description Greater than
     */
    $gt?: T[K],

    /**
     * @description Greater than or equal to
     */
    $gte?: T[K],

    /**
     * @description Less than
     */
    $lt?: T[K],

    /**
     * @description Less than or equal to
     */
    $lte?: T[K],

    /**
     * @description Not equal to
     */
    $ne?: T[K],

    /**
     * @description In
     */
    $in?: T[K][],

    /**
     * @description Not in
     */
    $nin?: T[K][],

    /**
     * @description Like
     */
    $like?: string,
  } & {
    /**
     * @description Search for a term 
     */
    search?: string
  }
}