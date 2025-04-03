import { App } from "@storecraft/core";
import { StringReference } from "kysely";
import { Database } from "../types.sql.tables.js";
import { type ApiQuery } from "@storecraft/core/api";

export type NoActive<T> = T extends {active:number} ? Omit<T, 'active'> & {active: boolean} : T;
export type ReplaceValues<T, Find extends any=any, ReplaceWith extends any=any> = {
  [K in keyof T]: T[K] extends Find ? ReplaceWith : T[K]
};

export type ReplaceValuesOfKeys<T, Find extends keyof T=keyof T, ReplaceWith extends any=any> = {
  [K in keyof T]: K extends Find ? ReplaceWith : T[K]
};

export type ReplaceValuesOfKeys2<T, Find extends keyof T=keyof T, ReplaceWith extends any=any> = {
  [K in keyof T]: K extends Find ? ReplaceWith : ReplaceValuesOfKeys2<T[K], Find, ReplaceWith>
};

// export type ENV<T> = Partial<
//   {
//     readonly [K in keyof T]: T[K] extends (number | string | boolean | Function | any[]) ? string : ENV<T[K]>
//     // readonly [K in keyof T]: T[K] extends (any[] | Function) ? string : T[K] extends Record<string, any> ? ENV<T[K]> : (string)
//   }
// >;

  
export type NO<T> = {
  [P in keyof T]: T[P]
}

export type OrderByDirection = 'asc' | 'desc';
export type DirectedOrderByStringReference<DB, TB extends keyof DB, O> = `${StringReference<DB, TB> | (keyof O & string)} ${OrderByDirection}`;

/**
 * Those that are queryable with {@link ApiQuery} object
 */
export type QueryableTables = Exclude<
  keyof Database,
  'storefronts_to_other' | 'entity_to_media' | 'entity_to_tags_projections' | 
  'entity_to_search_terms' | 'products_to_collections' | 'products_to_discounts' | 
  'products_to_variants' | 'products_to_related_products'
>;
