# MongoDB data modeling

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


## products --> collections
Each product has the following relation:
```js
product._relations.collections: {
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


## products --> products variants
Each product has the following relation:
```js
product._relations.variants: {
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
- delete the parent


## products --> discounts
Again, a relation, that connects a collection with many entries (`products`) to one with
much fewer (`discounts`). Therefore, we embed documents in.

Each product has the following relation:
```js
product._relations.discounts: {
  // object ids of related discounts
  ids: ObjectId[],
  // the variants documents
  entries: Record<ID_STRING, DiscountType>
}
```

Notes:
- like `variants`, relation connections are made implictly.
- Everytime a discount is saved, it needs to form connection with eligible products.
- Everytime a product is saved, it has to remove all of it's discounts and re-test itself.


`Discount SAVE`:
- Remove discount info from every related product:
  - remove discount `ObjectId` from the product's `_relations.discounts.ids` array
  - unset discount document from the product's `_relations.discounts.entries[discount-id]`
  - remove [`discount:discount-handle`, `discount:discount-id`] from the product's `search`

- query the eligible products of the discount:
  - for each eligible product:
    - add discount `ObjectId` into the product's `_relations.discounts.ids` array
    - update discount document in the product's `_relations.discounts.entries[discount-id]=discount`
    - add [`discount:discount-handle`, `discount:discount-id`] to the product's `search`

`Discount DELETE`:
- Remove discount info from every related product:
  - remove discount `ObjectId` from the product's `_relations.discounts.ids` array
  - unset discount document from the product's `_relations.discounts.entries[discount-id]`
  - remove [`discount:discount-handle`, `discount:discount-id`] from the product's `search`
- remove discount document


`Product SAVE:`
Product might have changed, therefore it needs to be re-tested for discounts, BUT,
it is not OKAY to punish all products saves, usually, it is only required if 
tags/collections/price changes
- delete the product's self relations `_relations.discounts`
- get all discounts of type product, which are active and for each:
  - test eligibility for discount locally,
    - If eligible:
      - add discount `ObjectId` into the product's `_relations.discounts.ids` array
      - update discount document in the product's `_relations.discounts.entries[discount-id]=discount`
      - add [`discount:discount-handle`, `discount:discount-id`] into the product's `search`

`Product DELETE:`
- Do nothing


## storefronts --> products, collections, discounts, shipping, posts
We are going to create explicit connections, (the way `product` connects `collections`).

Each product has the following relation:
```js
storefront._relations: {
  products: {
    ids: ObjectId[],
    entries: Record<ID_STRING, ProductType>
  },
  collections: {
    ids: ObjectId[],
    entries: Record<ID_STRING, CollectionType>
  },
  discounts: {
    ids: ObjectId[],
    entries: Record<ID_STRING, DiscountType>
  },
  shipping: {
    ids: ObjectId[],
    entries: Record<ID_STRING, ShippingMethodType>
  },
  posts: {
    ids: ObjectId[],
    entries: Record<ID_STRING, PostType>
  },
}
```

`Storefront SAVE:`
- For Each product in `storefront.products`:
  - Add `_relations.products.entries[product-id]=product`.
  - Add `ObjectId` to `_relations.products.ids`.

- For Each collection in `storefront.collections`:
  - Add `_relations.collections.entries[collection-id]=collection`.
  - Add `ObjectId` to `_relations.collections.ids`.

- For Each discount in `storefront.discounts`:
  - Add `_relations.discounts.entries[discount-id]=discount`.
  - Add `ObjectId` to `_relations.discounts.ids`.

- For Each shipping method in `storefront.shipping_methods`:
  - Add `_relations.shipping_methods.entries[shipping_method-id]=shipping_method`.
  - Add `ObjectId` to `_relations.shipping_methods.ids`.

- For Each post in `storefront.posts`:
  - Add `_relations.posts.entries[post-id]=post`.
  - Add `ObjectId` to `_relations.posts.ids`.

`Storefront DELETE:`
- Nothing todo

`product/collection/discount/shipping/post SAVE:`
- update each related `storefront` document with `storefront._relations.products.entries[product-id] = product`
- update each related `storefront` document with `storefront._relations.collections.entries[collection-id] = collection`
- update each related `storefront` document with `storefront._relations.discounts.entries[discount-id] = discount`
- update each related `storefront` document with `storefront._relations.shipping_methods.entries[shipping_method-id] = shipping_method`
- update each related `storefront` document with `storefront._relations.posts.entries[post-id] = post`


`product/collection/discount/shipping/post DELETE:`
- on `product delete`:
  - delete in each related `storefront` the entry `storefront._relations.products.entries[product-id]`
  - remove in each related `storefront` the `ObjectId` from array `storefront._relations.products.ids`
- on `collection delete`:
  - delete in each related `storefront` the entry `storefront._relations.collections.entries[collection-id]`
  - remove in each related `storefront` the `ObjectId` from array `storefront._relations.collections.ids`
- on `discount delete`:
  - delete in each related `storefront` the entry `storefront._relations.discounts.entries[discount-id]`
  - remove in each related `storefront` the `ObjectId` from array `storefront._relations.discounts.ids`
- on `shipping_method delete`:
  - delete in each related `storefront` the entry `storefront._relations.shipping_methods.entries[shipping_method-id]`
  - remove in each related `storefront` the `ObjectId` from array `storefront._relations.shipping_methods.ids`
- on `post delete`:
  - delete in each related `storefront` the entry `storefront._relations.posts.entries[post-id]`
  - remove in each related `storefront` the `ObjectId` from array `storefront._relations.posts.ids`



## images
images are immutable, can only be created or deleted. They are not normalized in places used.

**products/collections/discounts/posts/shipping/storefronts**.{media} --> `image.url`

Some collections have `media[]` array, and we use it to keep track of used images in
the system, it is a soft feature. no hard relations on them.

`image DELETE`
- remove from storage if it's there
- for each `products/collections/discounts/posts/shipping/storefronts`, that has image url
in it's `media` array, simply remove it.

`products/collections/discounts/posts/shipping/storefronts GET`:
- fetch storage settings
- for each media url entry, if it has `storage://`, rewrite it for CDN setting

`products/collections/discounts/posts/shipping/storefronts SAVE`:
- for each media url entry:
  - upsert `image` record with the url

## customers --> auth_user
they are related through `customer.auth_id` field

* `au_{id} == cus_{id}`, the postfix is the same

`customer DELETE:`
- delete the auth user references by `customer.auth_id`

`auth_user DELETE:`
- do nothing
