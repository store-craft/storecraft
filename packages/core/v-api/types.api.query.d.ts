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
   * boolean `DSL` for filtering the terms
   * `(whatever-indexed tag:a -(tag:b | tag:c) handle:product*)`
   */
  vql?: VQL.AST;
  vqlString?: string;

  /**
   * `(updated_at)`
   * `(updated_at, id)`
   */
  sortBy?: SortCursor;
  /**
   * `asc` / `desc`
   */
  order?: SortOrder;

  /**
   * limit of items returned
   */
  limit?: number;
  /**
   * limit to last items returned from the last
   */
  limitToLast?: number;

  /**
   * `(updated_at:2012-09)`
   * `(updated_at:2012-09,id:aokaoskox)`
   * `(updated_at:2012-09,id:aokaoskox)`
   */
  startAt?: Cursor;
  startAfter?: Cursor;

  /**
   * `(updated_at:2012-09)`
   * `(updated_at:2012-09,id:aokaoskox)`
   * `(created:2012-09,id:aokaoskox)`
   */
  endAt?: Cursor;
  endBefore?: Cursor;
}
