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
  - product -> products variants
- test side effects:
  - image usage reporting

## checkout
- todo

## storage integration
storage is tested in it's own package, but integration test should be made available here

## v-rest controller
In the future, I will combine rest controller testing with `v-api`