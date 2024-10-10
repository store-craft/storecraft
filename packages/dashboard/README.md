# **Storecraft** Official Dashboard

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

<div style='text-align: center'>
  <img src='https://storecraft.app/landing/main.webp' 
      width='100%' />
</div><hr/><br/>

The Official `storecraft` Dashboard 🏆,
- Leveraging `static rendering` / `client side rendering` / `swr`
- Can be deployed into cost effective **CDN**
- Also available at `jsDelivr` **CDN**

Effectively, **TWO** Build Targets
1. A `library` with
  - Dashboard as `react` functional component
  - a `mount` function, that you can wrap for any framework of pure DOM.
2. A website, with configurable backend endpoint.

Build is handled by `Vite`


```bash
npm i @storecraft/dashboard
```

## Development

First, run the development server:

```bash
npm run dashboard:dev
# or
yarn dashboard:dev
# or
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build / Export

Simply, run any of the following command

```bash
npm run dashboard:build
# or
yarn dashboard:build
```

Artifacts are in the `dist` folder
```txt
dist
├── lib
│   ├── index.js      // ES module
│   ├── index.cjs     // common js
│   └── index.umd.cjs // UMD
├── website
│   ├── index.html
│   └── assets

```

## Consuming via `React`

First,

```bash
npm i @storecraft/dashboard
```

Then, 

```jsx
import { Dashboard } from '@storecraft/dashboard'

export const Root = () => {

  return (
    <div className='w-screen h-screen'>
      <Dashboard />
    </div>
  )
} 

```

## Consuming via `jsDelivr`

```html
<script id='_storecraft_script_' type="module">
  
  import { mountStorecraftDashboard } from 'https://cdn.jsdelivr.net/npm/@storecraft/dashboard@latest/dist/lib/index.min.js';
  
  mountStorecraftDashboard(
    document.getElementById('root'), false
  );

</script>

```


```txt
Author: Tomer Shalev
```