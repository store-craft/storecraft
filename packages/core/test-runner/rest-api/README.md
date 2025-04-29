# Storecraft Test Runner for `REST API` and sdk layer

This package is used to run tests for both the 
- JS client SDK.
- REST API layer.

## Goals

- Assert that the javascript SDK and the REST API are invoking the same internal Storecraft API.
- We are not testing the internal Storecraft API, but we are testing the integrity of the calls from the JS client SDK to the REST API and from the REST API to the internal Storecraft API.
- The internal backend `api` is tested in a different package, which is located at `packages/core/test-runner/api` package. 
- Test both the JS client SDK and the REST API at once.

## Why

The javascript SDK invokes http requests at the `rest-api` layer, which in turn invokes the backend `api` layer.

The following diagram holds:

```text
[JS-CLIENT-SDK] -> [REST-API] -> [Internal Programatic Storecraft API]
```

So, we test the integrity of the calls from the JS client SDK 
to the REST API and from the REST API to the internal Storecraft API.


## Strategy

- Patch the `api` layer to 
 - Intercept invocations to the internal Storecraft API.
 - Assert that the internal Storecraft API was invoked with the expected arguments.
 - Patch the `api` layer to return a string response, that acts as a proof, that the
  internal Storecraft API was invoked and was returned from the rest-api.
- Invoke a function in the JS client SDK.
- This will in turn invoke the REST API, which will invoke 
the internal Storecraft API.
- Assert that the internal Storecraft API was invoked with the expected arguments.
- Then test the string proof was correct with the value it expected


## Why dont we just test also the internal Storecraft API?
- The internal Storecraft API is tested in a different package, which is located at `packages/core/test-runner/api` package.
- We decouple because, in the future we may add a GraphQL layer, so we need this decoupling.
- Storecraft is a programatic framework at first and a REST API at second.