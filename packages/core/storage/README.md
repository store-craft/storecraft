# Storecraft Local FileSystem Storage for node, deno and bun

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

Local filesystem based **Storage** for `node.js` / `Deno` / `Bun`.

Features:
- Supports streaming `Get` / `Put` / `Delete`

## Node.js

```ts
import { NodePlatform } from '@storecraft/core/platform/node';
import { App } from '@storecraft/core';
 
const app = new App()
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(
  new NodeLocalStorage(join(homedir(), 'storage'))
)
.init();

```

Then, you can upload with

```js
await app.storage.putBlob(
  'folder1/tomer.txt',
  new Blob(['this is some text from tomer :)'])
);
```

or the more recommended way

```js
await app.api.storage.putBlob(
  'folder1/tomer.txt',
  new Blob(['this is some text from tomer :)'])
);
```

## Deno

```ts
import { DenoLocalStorage } from '@storecraft/core/platform/deno';
import { App } from '@storecraft/core';
 
const app = new App()
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(
  new DenoLocalStorage(join(homedir(), 'storage'))
)
.init();

```

Then, you can upload with

```js
await app.storage.putBlob(
  'folder1/tomer.txt',
  new Blob(['this is some text from tomer :)'])
);
```

or the more recommended way

```js
await app.api.storage.putBlob(
  'folder1/tomer.txt',
  new Blob(['this is some text from tomer :)'])
);
```

## Bun

```ts
import { BunLocalStorage } from '@storecraft/core/platform/bun';
import { App } from '@storecraft/core';
 
const app = new App()
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(
  new BunLocalStorage(join(homedir(), 'storage'))
).init();

```

Then, you can upload with

```js
await app.storage.putBlob(
  'folder1/tomer.txt',
  new Blob(['this is some text from tomer :)'])
);
```

or the more recommended way

```js
await app.api.storage.putBlob(
  'folder1/tomer.txt',
  new Blob(['this is some text from tomer :)'])
);
```

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```