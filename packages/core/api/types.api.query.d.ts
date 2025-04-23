// Query types
import type { BOOLQL } from '../vql/bool-ql/types.d.ts';
import { VQL } from '../vql/types.js';

type legal_value_types = string | boolean | number;
export type ApiQuerySortOrder = 'asc' | 'desc';
export type Tuple<
  K extends any=any, 
  V extends any=legal_value_types
> = [K, V];

export type Cursor<T extends any = undefined> = T extends undefined ? 
  Tuple<string, legal_value_types>[] : 
  TupleFromType<T>[];

export type SortCursor<T extends any = undefined> = T extends undefined ? 
  string[] : 
  (PickKeysByValueType<T, legal_value_types>)[];

export type SortOrder = 'asc' | 'desc';

/** 
 * @description Expend several relations 
 */
export type ExpandQuery<T extends any = undefined> = T extends undefined ? 
  string[] : 
  Exclude<
    'none' | '*' | PickKeysByValueType<T, any[]>, 
    'tags' | 'media' | 'attributes'
  >[];

/**
 * @description Fully typed query for **API**
 * @template T any object, which will be used to infer the types and schema
 */
export type ApiQuery<T extends any = undefined> = {
  /**
   * @description Expand connections of items returned from Query
   * @example ['products', 'tags', 'none']
   * @default ['*']
   */
  expand?: ExpandQuery<T>;

  /**
   * @description boolean `DSL` for querying using terms
   */
  vql?: VQL<T>;
  /**
   * @description `vql` as compiled string for internal usage
   * @example 
   * `(whatever-indexed tag:a -(tag:b | tag:c | "couple of words") handle:product*)`
   */
  vql_as_string?: string;

  /**
   * @description internal usage Abstract Syntx Tree (AST)
   * @deprecated
   */
  vqlParsed?: BOOLQL.AST;

  /**
   * @description Sort by cursor, should correlate with 
   * `startAt` / `endAt` cursors
   * @example 
   * ['updated_at']
   * ['updated_at', 'id']
   */
  sortBy?: SortCursor<T>;

  /**
   * @description `asc` | `desc`
   */
  order?: SortOrder;

  /**
   * @description Limit of items returned
   */
  limit?: number;
  /**
   * @description Limit to last items returned from the tail of the query
   */
  limitToLast?: number;

  /**
   * @description Lower Bound Filter Cursors on the properties of the items
   * @example 
   * [['updated_at', '2012-09']]
   * [['updated_at', '2012-09'], ['id', 'id_wiwq09j2023j']]
   * @deprecated use `vql` instead
   */
  startAt?: Cursor<T>;
  /**
   * @deprecated use `vql` instead
   */
  startAfter?: Cursor<T>;

  /**
   * @description Upper Bound Filter Cursors on the properties of the items
   * @example 
   * [['updated_at', '2015-09']]
   * [['updated_at', '2015-09'], ['id', 'id_wiwq09j2023j']]
   * @deprecated use `vql` instead
   */
  endAt?: Cursor<T>;
  /**
   * @deprecated use `vql` instead
   */
  endBefore?: Cursor<T>;

  /**
   * @description A shortcut for using `endAt` and `startAt` to query an
   * exact value. For example getting all the items which have `active=true`
   * @example 
   * [['active', false]]
   * @deprecated use `vql` instead
   */
  equals?: Cursor<T>
}


/**
 * @description Generate a tuple union of `(key, value)` by an object
 * confined to values which are `string | number | boolean`
 */
type TupleFromType<T> = {
  [K in keyof T]: Tuple<K, T[K]>;
}[PickKeysByValueType<T, string | number | boolean>];

type PickByValue<T, V> = Pick<
  T, 
  { 
    [K in keyof T]: T[K] extends V ? K : never 
  }[keyof T]
>

type PickKeysByValueType<T, V> = keyof PickByValue<T, V>
