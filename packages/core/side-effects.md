# Side Effects

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
