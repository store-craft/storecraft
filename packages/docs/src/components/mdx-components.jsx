import dynamic from 'next/dynamic.js'
import Head from 'next/head.js'
import CustomLink from './md-href.jsx'
import {CodeBlock} from './code-block.jsx'
import BlockQuote from './block-quote.jsx'
import Table from './table.jsx'
import Drawer from './drawer.jsx'
// import { JsDocTables } from './js-doc-table.jsx'
import { Image } from './image.jsx'
import { Pink, Lime, Purple } from './labels.jsx'
import { to_handle } from '@/utils/func.utils.js'
import {EventsTable} from './event-table.jsx'
import RestApiReference from './rest-api-reference.jsx'
import { useEffect } from 'react'

/**
 * 
 * @param {React.ReactNode} node 
 * 
 * @returns {string}
 */
const getNodeText = node => {
  if (node == null) return '';

  switch (typeof node) {
    case 'string':
    case 'number':
      return node.toString()

    case 'boolean':
      return ''

    case 'object': {
      if (node instanceof Array)
        return node.map(getNodeText).join(' ')

      if ('props' in node)
        return getNodeText(node.props.children)
    } // eslint-ignore-line no-fallthrough

    default: 
      console.warn('Unresolved `node` of type:', typeof node, node)
      return ''
  }
}


/**
 * 
 * @param {React.ReactNode} node 
 * 
 * @returns {string}
 */
export const sanitize_and_handle = node => {
  return to_handle(getNodeText(node));
}
/**
 * @type {Record<string, React.FC<{ [x:? string]: any }>>}
 */
const components = {
  h1: (props) => <h1 {...props} id={sanitize_and_handle(props.children)}/>,
  h2: (props) => <h2 {...props} id={sanitize_and_handle(props.children)}/>,
  h3: (props) => <h3 {...props} id={sanitize_and_handle(props.children)} />,
  h4: (props) => <h4 {...props} id={sanitize_and_handle(props.children)}/>,
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
  Table,
  Drawer,
  CodeBlock,
  // JsDocTables,
  Image,
  Pink, Purple, Lime,
  EventsTable,
  RestApiReference,
}

export default components
