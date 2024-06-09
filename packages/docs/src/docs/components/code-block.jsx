import React from 'react'
// import Highlight, { 
//   defaultProps } from 'prism-react-renderer'
import {Highlight, themes } from 'prism-react-renderer'
  // import vsDark from 'prism-react-renderer/themes/vsDark'
// import vsLight from 'prism-react-renderer/themes/dracula'
// import vsLight from 'prism-react-renderer/themes/shadesOfPurple'
// import vsLight from 'prism-react-renderer/themes/shadesOfPurple'

/**
 * @param {string} string    The string to parse
 * @returns {Array<number>}  Returns an energetic array.
 */
function parseRange(string) {
  let res = [];
  let m;

  for (let str of string.split(",").map((str) => str.trim())) {
    // just a number
    if (/^-?\d+$/.test(str)) {
      res.push(parseInt(str, 10));
    } else if (
      (m = str.match(/^(-?\d+)(-|\.\.\.?|\u2025|\u2026|\u22EF)(-?\d+)$/))
    ) {
      // 1-5 or 1..5 (equivalent) or 1...5 (doesn't include 5)
      let [_, lhs, sep, rhs] = m;

      if (lhs && rhs) {
        lhs = parseInt(lhs);
        rhs = parseInt(rhs);
        const incr = lhs < rhs ? 1 : -1;

        // Make it inclusive by moving the right 'stop-point' away by one.
        if (sep === "-" || sep === ".." || sep === "\u2025") rhs += incr;

        for (let i = lhs; i !== rhs; i += incr) res.push(i);
      }
    }
  }

  return res;
}

const parse = v => {
  const r = (
    v?.replace(/language-/, '') ?? ''
    )
   .split(' ').at(0)
   .split('&')
   .reduce(
    (p, c) => {
      const [key, value] = c.split('=')
      p[key] = value ?? true
      return p
    }, {
      lang: 'js',
      lines: ''
    }
   )

   r.lines = parseRange(r.lines ?? '')
   return r
}

const CodeBlock = ({ className, children='' }) => {
	// if (!children || children.type !== 'code') return null

	// const {
	// 	props: { className, children: code = '' },
	// } = children

  const { lang, showLinesNumbers, lines } = parse(className)

  return (
		<Highlight
			theme={themes.shadesOfPurple}
			// theme={vsLight}
			code={children.trim()}
			language={lang}
      className=''
		>
			{
        ({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`rounded-lg font-code overflow-auto text-sm ${className}`} 
              style={{ ...style, padding: '20px' }}>
            {
              tokens.map(
                (line, i) => {
                  const lineProps = getLineProps({ line, key: i });
                  const isLineHighlighted = lines.includes(i+1)
                  lineProps.className = `${lineProps.className} table-row 
                              ${isLineHighlighted ? 'bg-gray-600' : 'bg-transparent'}`
                  // console.log('lineProps ', lineProps)

                  return (
                    
                  <div key={i} {...lineProps} >
                    { (showLinesNumbers || lines.length>0 ) && 
                      <span children={i + 1} 
                            className={`table-cell px-1 ${isLineHighlighted ? 
                              'border-l-pink-500 border-l-2 ' : ''} `} /> }
                    {
                      line.map(
                        (token, key) => 
                          <span key={key} {...getTokenProps({ token, key })} />
                      )
                    }
                  </div>
                  )
                }
              )
            }
          </pre>
        )
      }
		</Highlight>
	)
}

export default CodeBlock
