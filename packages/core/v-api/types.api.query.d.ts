// Query types
import type { VQL } from '../v-ql/types.js';
export type ApiQuerySortOrder = 'asc' | 'desc';
export type Tuple<T extends string> = [key: string, value: T];
export type Cursor = Tuple<string>[];
export type SortCursor = string[];
export type SortOrder = 'asc' | 'desc';

/** Expend several relations */
export type ExpandQuery = string[];

/**
 * Query url base type for most collections
 */
export type ApiQuery = {
  expand?: ExpandQuery;
  /**
   * boolean DSL for filtering the terms
   * (whatever-indexed tag:a -(tag:b | tag:c) handle:product*)
   */
  vql?: VQL.AST;

  /**
   * 
   */
  sortBy?: SortCursor;
  order?: SortOrder;

  /**
   * limit of items returned
   */
  limit?: number;

  /**
   * (updated:2012-09)
   * (updated:2012-09,id:aokaoskox)
   * (created:2012-09,id:aokaoskox)
   */
  startAt?: Cursor;
  startAfter?: Cursor;

  /**
   * (updated:2012-09)
   * (updated:2012-09,id:aokaoskox)
   * (created:2012-09,id:aokaoskox)
   */
  endAt?: Cursor;
  endBefore?: Cursor;
}
