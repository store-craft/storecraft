// Query types
import type { VQL } from '../vql/types.d.ts';
export type ApiQuerySortOrder = 'asc' | 'desc';
export type Tuple<T extends string> = [key: string, value: T];
export type Cursor = Tuple<string>[];
export type SortCursor = string[];
export type SortOrder = 'asc' | 'desc';

/** 
 * @description Expend several relations 
 */
export type ExpandQuery = string[];

/**
 * @description Query base type for most collections
 * 
 */
export type ApiQuery = {
  /**
   * @description Expand connections of items returned from Query
   * @example ['products', 'tags']
   * @default ['*']
   */
  expand?: ExpandQuery;

  /**
   * @description boolean `DSL` for querying using terms
   * @example 
   * `(whatever-indexed tag:a -(tag:b | tag:c | "couple of words") handle:product*)`
   */
  vql?: string;
  /**
   * @description internal usage Abstract Syntx Tree (AST)
   */
  vqlParsed?: VQL.AST;

  /**
   * @description Sort by cursor, should correlate with `startAt` / `endAt` cursors
   * @example 
   * ['updated_at']
   * ['updated_at', 'id']
   */
  sortBy?: SortCursor;

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
   */
  startAt?: Cursor;
  startAfter?: Cursor;

  /**
   * @description Upper Bound Filter Cursors on the properties of the items
   * @example 
   * [['updated_at', '2015-09']]
   * [['updated_at', '2015-09'], ['id', 'id_wiwq09j2023j']]
   */
  endAt?: Cursor;
  endBefore?: Cursor;
}
