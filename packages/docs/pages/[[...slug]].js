import components from '@/components/mdx-components.jsx'
import Layout from '@/components/layout.jsx'
import { MDXRemote } from 'next-mdx-remote'
import { 
  _getStaticProps, _getStaticPaths 
} from '@/utils/next-props.js';
import Head from 'next/head.js';

/**
 * @typedef {Awaited<ReturnType<getStaticProps>>["props"]} PostPageProps
 */

/**
 * 
 * @param {PostPageProps} props 
 */
export default function PostPage(props) {
  const { data } = props
  const data_ = { 
    ...data, 
    content_hydrated : <MDXRemote {...data.content} components={components} /> 
  }


  console.log(props)

  return (
  <>
    <Head>
      <title>
      Storecraft Official Documentation Website
      </title>
      <meta
        name="description"
        content="Storecraft Official Documentation Website."
        key="desc"
      />
    </Head>
    <Layout data={data_}/>
  </>
  )
}

export const getStaticProps = async ({ params }) => {
  // console.log('getStaticProps')
  return _getStaticProps(
    {
      params
    }
  );
}

export const getStaticPaths = async () => {
  // console.log('creating docs pages')
  return _getStaticPaths();
}
