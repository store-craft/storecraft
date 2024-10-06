# Email updates with templates for `storecraft`

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

## Intro

This extension will help you send emails for customers using [HandleBars](https://handlebarsjs.com/) `templates` on
- `orders/checkout/complete` event
- `orders/fulfillment/shipped` event
- `orders/fulfillment/cancelled` event
- `auth/signup` event
- `auth/change-password` event
- `auth/forgot-password-token-generated` event

You are more than encouraged to peek at the source code to learn how to manipulate these
events and templates

## Usage

First, install

```bash
npm i @storecraft/extension-postman
```

Then, in your `storecraft` app

```ts
export const app = new App(
  {
    auth_secret_access_token: 'auth_secret_access_token',
    auth_secret_refresh_token: 'auth_secret_refresh_token',
    storage_rewrite_urls: undefined,
    general_store_name: 'Wush Wush Games',
    general_store_description: 'We sell cool retro video games',
    general_store_website: 'https://wush.games',
    auth_admins_emails: ['john@doe.com'],
    general_confirm_email_base_url: 'localhost:8000/api/auth/confirm-email',
    general_forgot_password_confirm_base_url: 'localhost:8000/api/auth/forgot-password-request-confirm'
  }
)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(new NodeLocalStorage())
.withMailer(new Resend({ apikey: process.env.RESEND_API_KEY }))
.withExtensions(
  {
    'postman': new PostmanExtension()
  }
);

```

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```