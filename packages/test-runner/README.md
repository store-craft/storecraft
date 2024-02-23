# test runner for storecraft app
A work in progress package to test:
- api and databases integrations
- rest api
- and more


## v-api controller test
Everything prefixed with `api.` tests files within `v-api` folder
of `StoreCraft`. This is just testing the controller and the database.

Currently, I accomplished:
- sanity tests for CRUD operations on all controllers

Todo:
- list and query tests for controllers
- test relations:
  - DONE: product -> collections
  - DONE: product -> discounts
  - product -> products variants
  - DONE: collection -> products
  - DONE: discounts -> products
  - storefronts -> shippping
  - storefronts -> posts
  - storefronts -> collections
  - storefronts -> products
- test side effects:
  - image usage reporting


## v-rest controller
In the future, I will combine rest controller testing with `v-api`