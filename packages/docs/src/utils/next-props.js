import path from 'path'
import fs from 'fs'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import components from '../components/mdx-components.jsx'
import doc from './docs-config.js'


/**
 * getHeadings credit: Josh W. Comeau
 * 
 * @param {string} source 
 */
export function parseHeadings(source) {
  // Get each line individually, and filter out anything that
  // isn't a heading.
  const headingLines = source.split("\n").filter(
    (line) => {
      return line.match(/^#+\s/);
    }
  );

  // Transform the string '## Some text' into an object
  // with the shape '{ text: 'Some text', level: 2 }'
  return headingLines.map(
    (raw) => {
      const text = raw.replace(/^#+\s/, "");
      // const text = marked.parse(strip_tags(raw));


      const level = raw.indexOf(' ');
      // I only care about h2 and h3.
      // If I wanted more levels, I'd need to count the
      // number of #s.
      // const level = raw.slice(0, 3) === "###" ? 3 : 2;

      return { text, level };
    }
  );

}

/**
 * 
 */
const import_folder = function() {

  const paths = doc.groups.map(
    group => group.items
  ).flat();

  let __map = {};

  paths.forEach(
    item => {
      if(__map[item.route]!==undefined) {
        console.log(
          `processor warning:: route ${item.route} is overriden`
        );
      }

      __map[item.route] = item.path;
    }
  );

  // __map[""] = document.groups[0].items[0].path
  // __map["/"] = document.groups[0].items[0].path
  // __map["b"] = document.groups[0].items[0].path
  return { ...doc, __map }
}


/**
 * 
 * 
 * @param {object} params
 * @param {Awaited<ReturnType<_getStaticPaths>>["paths"]["0"]["params"]} params.params
 * @returns 
 */
export const _getStaticProps = async (
  { 
    params 
  }
) => {
  
  const docs = import_folder();
  const { slug } = params;
  const route = slug?.reduce(
    (acc, curr) => path.join(acc, curr)
    , ''
  ) ?? docs.groups[0].items[0].route;

  const path_of_file = docs.__map[route];
  const source = fs.readFileSync(path_of_file);
  const { content, data } = matter(source);
  const headings = parseHeadings(source.toString());

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
  );

  // console.log(docs)

  return {
    props: {
      data : {
        slug : route,
        content: mdxSource,
        headings,
        frontMatter: data,
        document: docs  
      }
    },
  }
}

/**
 * 
 */
export const _getStaticPaths = async () => {
  // console.log('creating docs pages')
  const docs = import_folder();

  /**
   * 
   * @param {string} path 
   */
  const to_optional = (path) => path.replace(/\.mdx?$/, '').split('/');

  const paths = Object
    .keys(docs.__map)
    .map(
      item => (
        { 
          params: { 
            slug: to_optional(item),
          }
        }
      )
    );

  paths.push(
    { 
      params: { 
        slug: [""],
      }
    }
  );

  return {
    paths,
    fallback: false,
  }
}
