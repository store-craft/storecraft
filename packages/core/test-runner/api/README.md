# Storecraft Test Runner for `api` layer

This package is used to run tests for the programatic `api` layer of the Storecraft application.

Such as,

```ts
app.api.products.list()
app.api.auth.signup()
```

this is the heart of the Storecraft application.

Do not confuse this with the `rest-api` layer, as storecraft is a programatic framework at first and a REST API at second. We may add more interfaces in the future, such as GraphQL or gRPC.

For them we will only test shadow integrity.

## Where can I find the REST API tests ?

The REST API tests are located in the `packages/core/test-runner/rest-api` package.