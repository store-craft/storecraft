# Side Effects

We embed some relation info in documents to model relations.
```js
{
  _relations: {
    [collection_name]: {
      ids: [ objectId(0), objectId(1)....],
      entries: {
        0: {
          ... data
        },
        1: {
          ... more data
        }
      }
    }    
  }
}
```

- `ids` array list all the ids of the related documents and 
help with querying a relation if we need.
- `entries` are embedding of these documents keyed by id and value is a document, this 
is used for super fast read.
- We use some of this relations to expand relations and return them to the user, 
as long these relations are not too big. For example, product will have on avarage 2 
related colletions, therefore we don't mind embedding the collections inside a product,
so when a user wants a product with expanded related collections, he will get them the fastest.
- In general we favour FAST READS over FAST WRITES.
- so product-->collections, we don't mind expanding.
- but, collection-->products, we do mind and will use a different strategy.
- In case, we have a large collection, we opt for querying.
For example a collection `shirts` can relate to 5000 products, in this case,
we offer a way to query the products constrained on collection name, which means, that
we don't expand as above and return everything but use a different pathway. We have many ways
to achieve this, either by the built in search terms array.


## products <-> collections
Each product has the following relation:
```js
  _relations.collections: {
    // object ids of related collections
    ids: ObjectId[],
    // the collections documents
    entries: Record<ID_STRING, CollectionType>
  }
```

How connections intentions from product to collections are formed ?
Connections are given in the `product.collections = [ { id:'id1' }, ..]` property.
We use these as user intention to form a connection in the database. super convenient

`Product SAVE:`
- for each related collection add the entry `_relations.collections.entries[col-id]=col` in the product document.
- for each related collection add the collection `ObjectId` to array `_relations.collections.ids` in the product document.

`Product DELETE:`
- Nothing todo

`Collection SAVE:`
- update each related product document with `_relations.collections.entries[col-id] = c`

`Collection DELETE:`
- delete in each related product the entry `_relations.collections.entries[col-id]`
- remove in each related product the `ObjectId` from array `_relations.collections.ids`
- remove in each related product the `[col:col-handle, col:col-id` from array `search` in the products documents.


## products <-> products variants
Each product has the following relation:
```js
  _relations.variants: {
    // object ids of related collections
    ids: ObjectId[],
    // the variants documents
    entries: Record<ID_STRING, ProductType>
  }
```

Variant is any product, that has 
- `parent_handle` property
- `parent_id` property
- `variant_hint` property

How connections intentions from product to variants are formed ?
As opposed to `products <--> collections`, connections are made implicitly, because of
the async nature of connecting and creating variants. In the future, I will add possibility
to add variants like collections, i.e, explicitly.
- async a product is created with `parent_handle` property set.

Notes:
- Currently, I have no use for the `ids`, but it might change (because each sub variant has one parent).
- Variants are always created by a product, that specify he has a parent. i.e, we rely on
integrity, so use it with care.


`Variant SAVE`:
- save the product ofcourse
- use `parent_id` to:
  - add variant `ObjectId` into the parent's `_relations.variants.ids` 
  - update variant document in the parent's `_relations.collections.entries[variant-id]=variant`

`Variant DELETE:`
- use `parent_id` to:
  - delete in parent the entry `_relations.variants.entries[variant-id]`
  - remove in parent the `ObjectId` from array `_relations.variants.ids`

`Product (parent) SAVE:`
- nothing, we don't support explicit relations yet

`Product (parent) DELETE:`
- delete all the children products
- delete the parnt


## images
images are immutable, can only be created or deleted.
They are not normalized in places used.

everything->images

1. delete image
  1. try to supply as best as possible


## customers
customer->auth_user

1. on delete
  1. delete the auth user
