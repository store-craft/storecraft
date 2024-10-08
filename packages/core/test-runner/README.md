# Offical **Test Runner** for `storecraft` app

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

**Storecraft** core package has a [test-runner](https://github.com/store-craft/storecraft/tree/main/packages/core/test-runner), that tests:
- **Application API** (not restful api) 
- **Resources** CRUD logic
- **Search** logic
- **Authentication** logic
- **Pricing** logic
- **Checkout** logic
- **Database** integration
- **Storage** integration (soon)
- **Events**

This package is used by the core storecraft engine for dev testing, but also
for new database integrations.

When developing a new database integration, you are encouraged to use this package to verify,
that you pass the tests for database integration as expected.


```ts
import { api } from '@storecraft/core/test-runner'
```

The **api** object is made up of many tests (we are using [uvu](https://github.com/lukeed/uvu)).

## Example

So, suppose you want to test your new application with a database integration you have written,

```ts
const app = new App()
.withPlatform(new NodePlatform())
.withDatabase(
  new SQLite({ filepath: ':memory:' })
);
```

Simply, import the **api** `test-runner`

```ts
import { api as api_test_runner } from '@storecraft/core/test-runner'
```

Each property of the `api_test_runner` is a test suite with the following signature

```ts
interface ITestRunner {
  create: (app: App) => { run: () => any }
}
```

Therefore, if you wanted just to run `authentication` tests, you will

```ts
async function test() {
  await app.init();

  // test auth logic
  api_test_runner.auth.create(app).run();

  // test crud for products
  api_test_runner.products_crud.create(app).run();
}
```

If you want to run all of the tests, then,

```ts

async function test() {

  await app.init();

  Object.entries(api).forEach(
    ([name, runner]) => {
      runner.create(app).run();
    }
  );
}

```


```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```