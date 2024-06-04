# **Storecraft** Official Dashboard
A `storecraft` dashboard, leveraging static rendering / client side rendering,
so it can be deployed into cost effective **CDN**.

Effectively,  two build targets:
1. A website
2. A `library` with
  - Dashboard as `react` functional component
  - a `mount` function, that you can wrap for any framework of pure DOM.

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
│   ├── index.js
│   ├── index.cjs
│   └── index.umd.cjs
├── website
│   ├── index.html
│   └── assets

```


```txt
Author: Tomer Shalev
```