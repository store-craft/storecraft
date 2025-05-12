# Storecraft Google Functions Platform support

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>


You can visit the [google functions playground example](https://github.com/store-craft/storecraft/tree/main/packages/playground/google-functions)


## usage with google-cloud functions

Install 

```zsh
npm init

npm i @storecraft/core
npm i @google-cloud/functions-framework
npm i dotenv
```

Add `index.js`

```js
import 'dotenv/config';
import * as functions from '@google-cloud/functions-framework';
import { App } from '@storecraft/core'
import { GoogleFunctionsPlatform } from '@storecraft/core/platform/google-functions';
import { MongoDB } from '@storecraft/database-mongodb'

// console.log('env ', process.env)

const app = new App({})
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB());
.init();
 
http.createServer(app.handler).listen(
  8000,
  () => {
    app.print_banner('http://localhost:8000');
  }
); 

functions.http(
  'storecraft',
  async (req, res) => {
    return app.handler(req, res);
  }
);
 
```

Now, test locally with
```zsh
npx functions-framework --target=storecraft
```

Now, open 
- `http://localhost:8080/api/dashboard`
- `http://localhost:8080/api/reference`


```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```