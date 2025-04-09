import path from 'path'
import fs from 'fs'
import matter from 'gray-matter'
// @ts-ignore
import { serialize } from 'next-mdx-remote/serialize'
import components from '../components/mdx-components.tsx'
import doc, { DocGroup } from './docs-config.ts'


/**
 * getHeadings credit: Josh W. Comeau
 */
export function parseHeadings(source: string) {
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

const compute_map = () => {
  const map = {};

  const recurse_g = (g: DocGroup) => {

    if(g.route && g.path) {
      map[g.route] = g.path;// ?? g.groups[0].path;
    }

    for(const g_child of g?.groups ?? []) {
      recurse_g(g_child)
    }
  }

  for(const g of (doc?.groups ?? [])) {
    recurse_g(g)
  }

  return map;
}

const doc_map = compute_map();

console.log(doc_map);

/**
 * 
 */
const import_folder = function() {

  const paths = doc.groups.map(
    group => group.groups
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


export const _getStaticProps = async (
  { 
    params 
  }: {
    params: Awaited<ReturnType<typeof _getStaticPaths>>["paths"]["0"]["params"]
  }
) => {
  
  // const docs = import_folder();
  const { slug } = params;
  const route = slug?.reduce(
    (acc, curr) => path.join(acc, curr)
    , ''
  ) ?? doc.groups[0].groups[0].route;

  const path_of_file = doc_map[route];
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
        document: {
          ...doc, 
          __map: doc_map
        }  
      }
    },
  }
}


/**
 * 
 */
export const _getStaticPaths = async () => {

  const to_optional = (path: string) => path.replace(/\.mdx?$/, '').split('/');

  const paths = Object
    .keys(doc_map)
    .map(
      item => (
        { 
          params: { 
            slug: to_optional(item),
          }
        }
      )
    );
  
  // console.log(JSON.stringify(paths, null, 2))

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
