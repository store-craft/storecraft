// import type { StorecraftConfig as StorecraftConfig_ } from './api/types.api.d.ts';
// import { App as App_ } from './index.js';


// export declare namespace Storecraft {
//   type StorecraftConfig = StorecraftConfig_;
//   type App = App_;
// }

export { type StorecraftConfig } from './api/types.api.js';
export { type App } from './index.js';


/**
 * @description A small utility type to rewrite any record type
 * recursively with string values. Will be used to map env variables
 * names
 */
export type ENV<T> = Partial<
  {
    readonly [K in keyof T]: T[K] extends (number | string | boolean | Function | any[]) ? string : ENV<T[K]>
    // readonly [K in keyof T]: T[K] extends (any[] | Function) ? string : T[K] extends Record<string, any> ? ENV<T[K]> : (string)
  }
>;

  