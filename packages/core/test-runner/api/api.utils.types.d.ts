import { type BaseType } from "../../api/types.api.js"
import { type ApiQuery } from "../../api/types.api.query.js"
import { type PubSubEvent } from "../../pubsub/types.public.js"
import { InitializedStorecraftApp, type App } from "../../types.public.js"

export type PartialBase = Partial<BaseType>

export type CrudTestContext<G = PartialBase, U = PartialBase> = {
  items: Partial<U>[]
  ops: {
    upsert?: (item: Partial<U>) => Promise<string>
    get?: (id: string) => Promise<G>
    remove?: (id: string) => Promise<boolean>
  }
  events: {
    upsert_event: PubSubEvent
    get_event: PubSubEvent
    remove_event: PubSubEvent
  }
  app: App
}


export type QueryTestContext<G extends Partial<BaseType>, U extends Partial<BaseType>> = {
  items: U[]
  resource: keyof Omit<App["__show_me_everything"]["db"]["resources"], 'search'>
  ops: {
    upsert?: (item: U) => Promise<string>
    get?: (id: string) => Promise<G>
    remove?: (id: string) => Promise<boolean>
    list?: (q: ApiQuery<any>) => Promise<G[]>
    count?: (q: ApiQuery<G>) => Promise<number>
  }
  events?: {
    list_event: PubSubEvent
  }
  app: App
}

export type ExtractFullApp<T> = T extends InitializedStorecraftApp<infer U> ? U : (T extends App ? T : never);

