# **Storecraft** Official Chat

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

<div style='text-align: center'>
  <img src='https://storecraft.app/landing/main.webp' 
      width='100%' />
</div><hr/><br/>

The Official `storecraft` AI Chat 🏆,
- Leveraging `static rendering` / `client side rendering` / `swr`
- Can be deployed into cost effective **CDN**
- Also available at `jsDelivr` **CDN**

Effectively, **TWO** Build Targets
1. A `library` with
  - Chat as `react` functional component
  - a `mount` function, that you can wrap for any framework of pure DOM.
2. A website, with configurable backend endpoint.

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
npm run build
```

Artifacts are in the `dist` folder
```txt
dist
├── lib
│   ├── index.js      // ES module
│   ├── index.cjs     // common js
│   └── index.umd.cjs // UMD
│   └── src // folder of ts defintions files
├── website (for testing)
│   ├── index.html
│   └── assets

```

## Consuming via `React`

First,

```bash
npm i @storecraft/chat
```

Then, 

```jsx
import { Chat } from '@storecraft/chat'

export const Root = () => {

  return (
    <div className='w-screen h-screen'>
      <Chat />
    </div>
  )
} 

```

## Consuming via `jsDelivr`

```html
<script id='_storecraft_script_' type="module">
  
  import { mountChat } from 'https://cdn.jsdelivr.net/npm/@storecraft/chat@latest/dist/lib/index.min.js';
  
  mountChat(
    document.getElementById('root'), false
  );

</script>

```


```txt
Author: Tomer Shalev
```