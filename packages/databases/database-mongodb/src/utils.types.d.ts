import type { ID } from "@storecraft/core/database";
import type { ObjectId, WithId } from "mongodb";

export type Relation<T extends any = any> = {
  ids?: ObjectId[];
  entries?: Record<ID, T>;
}

export type WithRelations<T extends any = undefined> = {
  _relations?: Record<string, Relation<any>>
  _id?: ObjectId;
} & T;
