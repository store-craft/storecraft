/**
 * @import { SeedData } from "./types.js";
 */ 
import { App } from "@storecraft/core";


/**
 * @description Seeds the database with the provided data.
 * @param {import("@storecraft/core").InitializedStorecraftApp} app 
 * @param {any} data 
 */
export const seed = async (app, data) => {

  for (const v of data?.collections ?? []) {
    await app.api?.collections.upsert(v);
  }

  for (const v of data?.posts ?? []) {
    await app.api?.posts.upsert(v);
  }

  for (const v of data?.shipping ?? []) {
    await app.api?.shipping_methods.upsert(v);
  }

  for (const v of data?.tags ?? []) {
    await app.api?.tags.upsert(v);
  }

  for (const v of data?.products ?? []) {
    await app.api?.products.upsert(v);
  }

  for (const v of data?.discounts ?? []) {
    await app.api?.discounts.upsert(v);
  }

  for (const v of data?.storefronts ?? []) {
    await app.api?.storefronts.upsert(v);
  }
 
}