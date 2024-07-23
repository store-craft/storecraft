import React from 'react'
// import Highlight, { 
//   defaultProps } from 'prism-react-renderer'
import {Highlight, themes } from 'prism-react-renderer'
import useDarkMode from '@/hooks/useDarkMode.js';
  // import vsDark from 'prism-react-renderer/themes/vsDark'
// import vsLight from 'prism-react-renderer/themes/dracula'
// import vsLight from 'prism-react-renderer/themes/shadesOfPurple'
// import vsLight from 'prism-react-renderer/themes/shadesOfPurple'

/**
 * @param {string} string    The string to parse
 * @returns {(string | number)[]}  Returns an energetic array.
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

/**
 * 
 * @param {string} v 
 */
const parse = v => {
  const r = (
    v?.replace(/language-/, '') ?? ''
    )
   .split(' ').at(0)
   .split('&')
   .reduce(
    (p, c) => {
      const [key, value] = c.split('=');
      p[key] = value ?? true;

      return p;
    }, {
      lang: 'js',
      lines: ''
    }
   )

   r.lines = parseRange(r.lines ?? '');

   return r;
}

const theme_dark = themes.oneDark;
const theme_light = themes.oneLight;

delete theme_dark.plain.backgroundColor;
delete theme_light.plain.backgroundColor;

/**
 * 
 * @typedef {object} CodeBlockParams
 * @prop {string} className
 * @prop {string} [children='']
 * 
 * 
 * @param {CodeBlockParams} params 
 * 
 */
const CodeBlock = (
  { 
    className, children='' 
  }
) => {

  const { darkMode } = useDarkMode();

  // console.log(themes.shadesOfPurple)
	// if (!children || children.type !== 'code') return null

	// const {
	// 	props: { className, children: code = '' },
	// } = children

  const { lang, showLinesNumbers=true, lines } = parse(className);

  return (
		<Highlight
			theme={darkMode? theme_dark : theme_light}
			// theme={vsLight}
			code={children.trim()}
			language={lang}
		>
			{
        ({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`
            rounded-lg border dark:border-kf-600/30 border-kf-600/10 
            font-light overflow-auto text-[13px] 
            dark:bg-kf-600/20 bg-slate-50 ${className}`
            } 
              style={{ ...style, padding: '10px' }}>
            {
              tokens.map(
                (line, i) => {
                  const lineProps = getLineProps({ line, key: i });
                  const isLineHighlighted = lines.includes(String(i+1))
                  lineProps.className = `
                    ${lineProps.className} table-row ${isLineHighlighted ? 'bg-gray-600' : 'bg-transparent'}
                  `;

                  // console.log('lineProps ', lineProps)

                  return (
                    <div key={i} {...lineProps} >
                      { 
                        (showLinesNumbers || lines.length>0 ) && 
                        <span children={i + 1} 
                              className={`table-cell pr-4 text-right ${isLineHighlighted ? 
                                'border-l-pink-500 border-l-2 ' : ''} `} /> 
                      }
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
