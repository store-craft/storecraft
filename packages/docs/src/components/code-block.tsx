import React from 'react'
// import Highlight, { 
//   defaultProps } from 'prism-react-renderer'
import {Highlight, themes } from 'prism-react-renderer'
import useDarkMode from '@/hooks/use-dark-mode';
  // import vsDark from 'prism-react-renderer/themes/vsDark'
// import vsLight from 'prism-react-renderer/themes/dracula'
// import vsLight from 'prism-react-renderer/themes/shadesOfPurple'
// import vsLight from 'prism-react-renderer/themes/shadesOfPurple'

function parseRange(string: string) {
  let res: string[] = [];
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

const parse = (v?: string) => {
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

   const lines = parseRange(r.lines ?? '');
  //  console.log(r)
   return {
    ...r,
    lines
   };
}

const theme_dark = themes.oneDark;
const theme_light = themes.oneLight;

theme_dark.plain.backgroundColor = 'transparent';
theme_light.plain.backgroundColor = 'transparent';
// delete theme_light.plain.backgroundColor;

export type CodeBlockParams = {
  className?: string;
  outerClassName?: string;
  children?: string;
  showLinesNumbers?: boolean;
};

export type CodeBlockCoreParams = {
  lightTheme?: import("prism-react-renderer").PrismTheme;
  darkTheme?: import("prism-react-renderer").PrismTheme;
  className?: string;
  children?: string;
  showLinesNumbers?: boolean;
};

export const CodeBlock = (
  { 
    className, outerClassName='w-full', children='', 
    showLinesNumbers=false
  } : CodeBlockParams
) => {

  return (
    <div 
      className={`
        rounded-lg border
        font-light overflow-auto text-[10px] sm:text-[13px] 
        dark:border-kf-600/30 border-kf-600/10 
        dark:bg-kf-600/5 bg-slate-50 p-5 ${outerClassName}`
      }>
      <CodeBlockCore 
        children={children} 
        className={className} 
        showLinesNumbers={showLinesNumbers} 
      />
		</div>
	)
}


export const CodeBlockCore = (
  { 
    className, children='', showLinesNumbers=true,
    lightTheme=theme_light, darkTheme=theme_dark
  } : CodeBlockCoreParams
) => {

  const { darkMode } = useDarkMode();
  const { lang, lines } = parse(className);

  return (
		<Highlight
			theme={darkMode ? darkTheme : lightTheme}
			// theme={vsLight}
			code={children.trim()}
			language={lang}
		>
			{
        ({ className: cls, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={cls} 
              style={{ ...style, padding: '0px', margin: '0px' }}>
            {
              tokens.map(
                (line, i) => {
                  const lineProps = getLineProps({ line, key: i });
                  const isLineHighlighted = lines.includes(String(i+1)) || 
                    lines.includes(i+1);

                  lineProps.className = `
                    ${lineProps.className} table-row ${isLineHighlighted ? 'bg-black/20 dark:bg-white/20' : 'bg-transparent'}
                  `;

                  // console.log('lineProps ', lineProps)

                  return (
                    <div key={i} {...lineProps} >
                      { 
                        (showLinesNumbers || lines.length>0 ) && 
                        <span 
                          children={i + 1} 
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

