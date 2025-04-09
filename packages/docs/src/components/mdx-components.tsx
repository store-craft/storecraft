import CustomLink from './md-href.tsx'
import { CodeBlock } from './code-block.tsx'
import BlockQuote from './block-quote.tsx'
import Table from './table.tsx'
import Drawer from './drawer.tsx'
import { Image } from './image.tsx'
import { Pink, Lime, Purple } from './labels.tsx'
import { to_handle } from '@/utils/func.utils.ts'
import { EventsTable } from './event-table.tsx'
import RestApiReference from './rest-api-reference.tsx'
import { useEffect } from 'react'
import { SimpleTable } from './simple-table.tsx'

const getNodeText = (node: React.ReactNode) => {
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


export const sanitize_and_handle = (node: React.ReactNode) => {
  return to_handle(getNodeText(node));
}

const components = {
  h1: (props) => <h1 {...props} id={sanitize_and_handle(props.children)}/>,
  h2: (props) => <h2 {...props} id={sanitize_and_handle(props.children)}/>,
  h3: (props) => <h3 {...props} id={sanitize_and_handle(props.children)} />,
  h4: (props) => <h4 {...props} id={sanitize_and_handle(props.children)}/>,
  hr: (props) => <hr {...props} />,
  strong: (props) => <strong className='text-kf-500 dark:text-inherit' {...props} />,
  br: (props) => <span {...props} />,
  // a: (props) => <a  {...props} />,
  div: (props) => <div  {...props} />,
  img: (props) => <img  {...props} />,
  p: (props) => <p  {...props} />,
  ul: (props) => <ul  {...props} />,
  ol: (props) => <ol  {...props} />,
  li: (props) => <li className='--pb-4 ' {...props} />,
  // pre: props => <CodeBlock {...props} />,
  pre: props => <CodeBlock {...props?.children?.props} />,
  code: props => <code 
    className='inline --bg-white border dark:border-none 
      text-pink-600 dark:text-gray-400 font-mono
      bg-pink-600/5 dark:bg-gray-400/10
      p-1 rounded-md' 
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
  SimpleTable
} as Record<string, React.FC<{ className?: string, children?: React.ReactNode }>>

export default components
