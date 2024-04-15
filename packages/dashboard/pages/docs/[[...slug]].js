import components from '../../src/docs/components/mdx-components.jsx'
import Layout from '../../src/docs/components/layout.jsx'
import { MDXRemote } from 'next-mdx-remote'
import { _getStaticProps, 
  _getStaticPaths } from '../../src/docs/utils/next_props.js'
import ClientOnly from '../../src/docs/components/client-only.jsx'
import Head from 'next/head.js';

export default function PostPage( props ) {
  const { data } = props
  const data_ = { 
    ...data, 
    content : <MDXRemote {...data.content} components={components} /> 
  }

  return (
    <>
    <Head>
      <title>
        SHELF Commerce CMS Docs
      </title>
      <meta
        name="description"
        content="SHELF CMS Official Docs website. SHELF transforms your Firebase project into a Headless store CMS and it's FREE"
        key="desc"
      />
    </Head>
    {/* <ClientOnly> */}
      <Layout data={data_}/>
    {/* </ClientOnly> */}
    </>
  )
}

export const getStaticProps = async ({ params }) => {
  // console.log('getStaticProps')
  return _getStaticProps('content/docs/microgl', {params})
}

export const getStaticPaths = async () => {
  // console.log('creating docs pages')
  return _getStaticPaths('content/docs/microgl')
}
