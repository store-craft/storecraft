import path from 'path'
import fs from 'fs'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import components from '../components/mdx-components'
import doc from './docs-config'

const import_folder = function(folder_path) {

  const paths = doc.groups.map(group => group.items).flat() 
  let __map = {}
  paths.forEach(item => {
    if(__map[item.route]!==undefined)
      console.log(`processor warning:: route ${item.route} is overriden`)
    __map[item.route] = item.path
  })
  // __map[""] = document.groups[0].items[0].path
  // __map["/"] = document.groups[0].items[0].path
  // __map["b"] = document.groups[0].items[0].path
  return { ...doc, __map }
}

export const _getStaticProps = 
async (path_of_content_folder, { params }) => {
  // console.log('getStaticProps')
  const docs = import_folder(
    path.join(process.cwd(), 
    path_of_content_folder)
  )
  const { slug } = params
  const route = slug?.reduce(
    (acc, curr) => path.join(acc, curr)
    , ''
  ) ?? docs.groups[0].items[0].route

  const path_of_file = docs.__map[route]
  const source = fs.readFileSync(path_of_file)
  const { content, data } = matter(source)

  const mdxSource = await serialize(
    content, {
      components,
      // Optionally pass remark/rehype plugins
      mdxOptions: {
        remarkPlugins: [],
        rehypePlugins: [],
      },
      scope: data,
    }
  ) 
  // console.log(docs)

  return {
    props: {
      data : {
        slug : route,
        content: mdxSource,
        frontMatter: data,
        document: docs  
      }
    },
  }
}

export const _getStaticPaths = async (path_of_content_folder) => {
  // console.log('creating docs pages')
  const docs = import_folder(path.join(process.cwd(), path_of_content_folder))
  const to_optional = (path) => path.replace(/\.mdx?$/, '').split('/')
  const paths = Object.keys(docs.__map)
                       .map(item => (
                        { params: { 
                            slug: to_optional(item),
                          }}));
  paths.push({ params: { 
    slug: [""],
  }})

  return {
    paths,
    fallback: false,
  }
}
