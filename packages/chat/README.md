# **Storecraft** Ai Chat

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

<div style='text-align: center'>
  <img src='../assets/ai-2.gif' 
      width='100%' />
</div><hr/><br/>

The Official `storecraft` Ai Chat 🏆,

- Leveraging `static rendering` / `client side rendering` / `swr`
- Can be deployed into cost effective **CDN**
- Also available at **CDN** like `unpkg` for consuming as a component.

Effectively, 
A `library` with
- Chat as `react` functional component
- a `mount` function, that you can wrap for any framework of pure DOM.

Build is handled by `Vite`

```bash
npm i @storecraft/chat
```

## Development

First, run the development server:

```bash
npm run dev
# or
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build / Export

Simply, run any of the following command

```bash
npm run dashboard:build
```

Artifacts are in the `dist` folder
```txt
dist
├── /lib
├───└── /src
│       ├── index.js      // ES module
│       └── index.umd.cjs // UMD

```

## Consuming via `React`

First,

```bash
npm i @storecraft/chat
```

Then, 

```tsx
import { Chat } from '@storecraft/chat'

export const Root = () => {

  return (
    <div className='w-screen h-screen'>
      <Chat 
        chat: {
          threadId: undefined,
          storecraft_config: {
            endpoint: 'http://localhost:8000',
          }
        }
      />
    </div>
  )
} 

```

## Consuming via `unpkg` as **UMD** (smaller bundle)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" sizes="any" type="image/svg+xml" href="/api/dashboard/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Storecraft Chat - Next Gen Commerce-As-Code</title>
  </head>
  <body style="background-color: black">
    <div id="root"></div>
    <script 
      type="application/javascript"
      src="https://www.unpkg.com/@storecraft/chat@latest/dist/lib/src/index.umd.cjs">
    </script>
    <script>
      console.log({StorecraftChat});

      const { threadId } = Object.fromEntries(
        new URLSearchParams(window.location.search)
      );

      console.log({ threadId });

      StorecraftChat.mountStorecraftChat(
        document.getElementById('root'), 
        {
          chat: {
            threadId: undefined,
            storecraft_config: {
              endpoint: 'http://localhost:8000',
            }
          }
        }
      );
    </script>
  </body>
</html>
```

## Consuming via `unpkg` as **ESM** (bigger bundle)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" sizes="any" type="image/svg+xml" href="/api/dashboard/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Storecraft Chat - Next Gen Commerce-As-Code</title>
    <script 
      id='_storecraft_script_' 
      type="module"
    >
      import { mountStorecraftChat } from 'https://www.unpkg.com/@storecraft/chat@latest/dist/lib/src/index.js';

      const { threadId } = Object.fromEntries(
        new URLSearchParams(window.location.search)
      );

      console.log({ threadId });

      mountStorecraftChat(
        document.getElementById('root'), 
        {
          chat: {
            threadId: undefined,
            storecraft_config: {
              endpoint: 'http://localhost:8000',
            }
          }
        }
      );
  </script>
  </head>
  <body style="background-color: black">
    <div id="root"></div>
  </body>
</html>
```


```txt
Author: Tomer Shalev
```