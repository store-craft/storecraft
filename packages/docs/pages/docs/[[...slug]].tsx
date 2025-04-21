"use client";
import components from '@/components/mdx-components'
import Layout from '@/components/layout'
import { MDXRemote } from 'next-mdx-remote'
import { 
  _getStaticProps, _getStaticPaths 
} from '@/utils/next-props';
import Head from 'next/head';

  export type PostPageProps = Awaited<ReturnType<typeof _getStaticProps>>["props"]

export default function PostPage(props: PostPageProps) {
  const { data } = props
  const data_ = { 
    ...data, 
    content_hydrated : (
      <MDXRemote 
        {...data.content} 
        components={components as any} 
      />
    ) 
  }

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

export const getStaticProps = async (
  { 
    params 
  }: Parameters<typeof _getStaticProps>[0]
) => {
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
