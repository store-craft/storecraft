import { Html, Head, Main, NextScript } from 'next/document.js'
import Link from 'next/link.js'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml"/>
      <body className={'bg-gray-900'}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
