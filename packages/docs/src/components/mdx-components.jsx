import dynamic from 'next/dynamic.js'
import Head from 'next/head.js'
import CustomLink from './md-href.jsx'
import CodeBlock from './code-block.jsx'
import BlockQuote from './block-quote.jsx'
import Table from './table.jsx'
import Drawer from './drawer.jsx'
import { JsDocTables } from './js-doc-table.jsx'
import { Image } from './image.jsx'
import { Pink, Lime, Purple } from './labels.jsx'

const components = {
  h1: (props) => <h1 {...props} />,
  h2: (props) => <h2  {...props} />,
  h3: (props) => <h3 {...props} />,
  h4: (props) => <h4  {...props} />,
  hr: (props) => <hr {...props} />,
  strong: (props) => <strong fontWeight="semibold" className='text-kf-500 dark:text-kf-400' {...props} />,
  br: (props) => <span {...props} />,
  // a: (props) => <a  {...props} />,
  p: (props) => <p  {...props} />,
  ul: (props) => <ul  {...props} />,
  ol: (props) => <ol  {...props} />,
  li: (props) => <li className='--pb-4' {...props} />,
  // pre: props => <CodeBlock {...props} />,
  pre: props => <CodeBlock {...props?.children?.props} />,
  code: props => <code className='inline --bg-white border dark:border-none 
                                text-pink-600 dark:text-pink-400
                                bg-pink-600/5 dark:bg-pink-400/10
                                px-0.5 rounded-md' 
                                {...props} />,
  blockquote: props => <BlockQuote {...props} />,
  a: CustomLink,
  // TestComponent: dynamic(() => import('./TestComponent')),
  Head,
  Table,
  Drawer,
  CodeBlock,
  JsDocTables,
  Image,
  Pink, Purple, Lime
}

export default components
