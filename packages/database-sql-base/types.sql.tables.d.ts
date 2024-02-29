import { AttributeType, AuthUserType, Role, TagType } from '@storecraft/core'
import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable
} from 'kysely'

export interface Database {
  auth_users: AuthUserTypeTable,
  tags: TagsTable
}


export interface junction_entity_2_media {
  id: Generated<number>,
  entity_id: string,
  url: string
}

export interface junction_entity_2_tag_projection {
  id: Generated<number>,
  entity_id: string,
  tag: string
}

export interface Base {
  attributes: JSONColumnType<AttributeType[] | undefined>;
  description: ColumnType<string | undefined>;
  active: ColumnType<boolean | undefined>;
  created_at: ColumnType<string>;
  updated_at: ColumnType<string>;
  id: string;
}

export interface AuthUserTypeTable extends Base {
  email: string;
  password: string;
  confirmed_mail: boolean
  roles: JSONColumnType<Role[]>;
}

export type AuthUserTypeSelect = Selectable<AuthUserTypeTable>
export type AuthUserTypeInsert = Insertable<AuthUserTypeTable>
export type AuthUserTypeUpdate = Updateable<AuthUserTypeTable>

export interface TagsTable extends Base {
  handle: string;
  values: JSONColumnType<string[]>;
}


// export interface PetTable {
//   id: Generated<number>
//   name: string
//   owner_id: number
//   species: 'dog' | 'cat'
// }

// export type Pet = Selectable<PetTable>
// export type NewPet = Insertable<PetTable>
// export type PetUpdate = Updateable<PetTable>