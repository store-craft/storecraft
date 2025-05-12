# Email updates with templates for `storecraft`

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

## Intro

This extension will send transactional emails for customers using [HandleBars](https://handlebarsjs.com/) `templates` on the following events, 

 * - `orders/checkout/complete` via `checkout-complete` template, uses {@link OrderData}
 * - `orders/fulfillment/shipped` via `order-shipped` template, uses {@link OrderData}
 * - `orders/fulfillment/cancelled` via `order-cancelled` template, uses {@link OrderData}
 * - `auth/signup` via `welcome-customer` template, uses {@link AuthUserType}
 * - `auth/change-password` via `general-message` template, uses {@link AuthUserType}  
 * - `auth/forgot-password-token-generated` via `forgot-password` template
 * - `auth/confirm-email-token-generated` via `confirm-email` template

The templates are already seeded into your database and have the following handles, which
`postman` recognizes:
- `welcome-customer`, `forgot-password`, `checkout-complete`, `order-shipped`, `order-cancelled`

You are more than encouraged to peek at the source code to learn how to manipulate these
events and templates and event implement your own extension or override new events like,

```js
conat app = new App(
  {
    ...
  }
).on(
  'auth/confirm-email-token-generated',
  async (event) => {
    event.stopPropagation();
    // Do something with `event.payload`
  }
)
```

## Usage

in your `storecraft` app

```ts
import { PostmanExtension } from "@storecraft/core/extensions/postman";

export const app = new App(
  {
    // ...your app config
  }
)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(new NodeLocalStorage())
.withMailer(new Resend({ apikey: process.env.RESEND_API_KEY }))
.withExtensions(
  {
    postman: new PostmanExtension()
  }
)
.init();

```


```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```