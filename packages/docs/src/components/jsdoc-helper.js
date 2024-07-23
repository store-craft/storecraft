import fs from 'fs'
const jsdoc = `
/** 
 * @typedef {object} ProductData - product data schema
 * @property {AttributeData[]} attributes - custom key value attributes
 * @property {string[]} collections - handles of collection this product belongs to
 * @property {string} video - video media url
 * 
* @typedef {object} ProductData - product data schema
* @property {AttributeData[]} attributes - custom key value attributes
* @property {string[]} collections - handles of collection this product belongs to
* @property {string} video - video media url
* 
* @enum
*/

/** 
 * @typedef {object} ProductData - product data schema
 * @property {AttributeData[]} attributes - custom key value attributes
 * @property {string[]} collections - handles of collection this product belongs to
 * @property {string} video - video media url
 * 
* @typedef {object} ProductData
* @property {AttributeData[]} attributes - custom key value attributes
* @property {string[]} collections - handles of collection this product belongs to
* @property {string} video - video media url
* 
* @enum
*/
`

/**
 * 
 * @param {string} l 
 */
const parseLine = (l) => {
  const t1 = l.indexOf('@typedef')
  const t2 = l.indexOf('@property')
  const tag = t1>=0 ? '@typedef' : (t2>=0 ? '@property' : undefined)
  const a1 = l.indexOf('{')
  const a2 = l.indexOf('}') 
  const type = l.substring(a1+1, a2).trim()

  const n_d = l?.substring(a2+1)?.trim() ?? ''
  // const n_d = n_d_0?.substring(0, n_d_0.search(/[^\s]/g))?.trim() ?? ''
  // console.log(n_d_0);
  const space = n_d.search(/(\s|$)/g)
  // console.log(n_d);
  // console.log(n_d.search(/(\s|$)/g));
  const name = n_d?.substring(0, space)?.trim() ?? ''
  const desc = n_d?.substring(space)?.trim() ?? ''
  return {
    tag,
    name, type, desc
  }
}

/**
 * 
 * @typedef {object} JsDocLine
 * @property {string} name
 * @property {string} type
 * @property {string} desc
 * @property {string} tag
 * 
 * @typedef {object} ADD_PROPERTIES
 * @property {JsDocLine[]} properties
 * 
 * @typedef {JsDocLine & ADD_PROPERTIES} JsDocBlock
 * 
 * @param {string} s 
 * @returns {JsDocBlock}
 */
const parseTypedefBlock = (s) => {
  const ss = s.split('\n').filter(
    l => l.search(/(@typedef|@property)/g) >= 0
    ).reduce(
    (p, l) => {
      const all = parseLine(l)
      if(all.tag==='@typedef') {
        return {
          ...all,
          jsdoc: s,
          properties: p.properties
        }
      }
      
      if(all.tag==='@property') {
        p.properties.push(all)
      }
      
      return p
    }, {
      name: undefined,
      type: undefined,
      desc: undefined,
      tag: undefined,
      properties: []
    }
  )
  return ss
}

/**
 * 
 * @param {string} jsdoc 
 * @returns {JsDocBlock}
 */
export const parseJsDoc = (jsdoc) => {
  const sp = jsdoc.split(/(?=@typedef)/g).map(
    parseTypedefBlock
  ).filter(
    it => it.tag
  )
  return sp
}

import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);


// let js = fs.readFileSync(__dirname + '/js-docs-types.js', { encoding: 'utf8' })
// console.log(__dirname)
// console.log(js)
// const parse = parseJsDoc(jsdoc)
// const parse = parseJsDoc(js)
// console.log(parse);