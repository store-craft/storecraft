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
- `entries` are embedding of these documents keyed by id and value is a document
- We use some of this relations to expand relations and return them to the user, 
as long these relations are not too big. For example, product will have on avarage 2 
related colletions, therefore we don't mind embedding the collections inside a product,
so when a user wants a product with expanded related collections, he will get them the fastest.
- In general we favour FAST READS over SLOW WRITES.
- so product-->collections, we don't mind expanding.
- but, collection-->products, we do mind and will use a different strategy.
- In case, we have a large collection, we opt for querying.
For example a collection `shirts` can relate to 5000 products, in this case,
we offer a way to query the products constrained on collection name, which means, that
we don't expand as above and return everything but use a different pathway. We have many ways
to achieve this, either by the built in search terms array.


## product <-> collections
Each product has the following relation:
```js
  _relations.collections: {
    // object ids of related collections
    ids: ObjectId[],
    // the collections documents
    entries: Record<ID_STRING, CollectionType>
  }
```
Each collection has the following relation:
```js
  _relations.products: {
    // object ids of related products
    ids: ObjectId[],
  }
```

`Product SAVE:`
- update internal `_relations` relations with the collections you receive (we reload the collections and will also be using a transaction that will fail if the collections have changed)

`Product DELETE:`

`Collection SAVE:`
- update each related product `_relations.collections.entries[col-id] = c`


## collections
product -> collections

1. delete collection
  1. remove references from products->collection
  2. remove `col:collection` from products search index
  1. remove references from storefronts->collection
  2. remove all collection terms from collections search index

## product
product -> collections

- tags are just projections, so nothing here.
1. delete product
  1. remove references from product->collections
  1. remove references from storefronts->products
  2. remove all search terms from products search index

Variants:
- if we are a variant, let's link to parent at save

Discounts:
on save:
- remove all discounts connections from the product
- test product against all auto discounts
- those who pass are linked to the product

## shipping
storefronts->shipping

1. delete shipping
  1. remove references from storefronts->shipping

## posts
storefronts->posts

1. delete post
  1. remove references from storefronts->posts

## orders
Nothing, orders are snapshots !!! self contained

## tags
tags are just projections and we will not support live connections

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

## discounts
on most databases testing for eligibility of products against a discount
is super easy with a WHERE clause on SQL or Mongo queries, where we can
update tested products with.

mongoDB:
1. On discount save with 
- updateMany products with the discount filters by removing the handle from product.discounts=[]
- updateMany products with the discount filters by adding product.discounts=[discount-handle]
- if there is a linked collection, also do #3

2. on Discount Remove
- updateMany products with the discount filters by removing the handle from product.discounts=[]

3. on save/create collection out of discount:
- create a collection
- updateMany products with the discount filters by adding product.collection=[collection-handle]
- updateMany products with the discount filters by adding product.search=[`col:collection-handle`]
