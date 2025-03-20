import { marked } from 'marked'
import { useMemo } from 'react'
import Markdown from 'markdown-to-jsx'

/**
 * @typedef {object} InternalMDViewParams
 * @prop {string} [value]
 * 
 * @typedef {InternalMDViewParams & 
 *  Omit<React.ComponentProps<'div'>, 'value'>
 * } MDViewParams
 * 
 * @param {MDViewParams} param
 */
export const MDView = (
  {
    value, ...rest
  }
) => {
  const Comp = useMemo(
    () => () => (
      <Markdown
        options={{
          overrides: {
            Price: {
              component: () => <div children="Price"/>,
              props: {
                className: 'foo',
              },
            },
          },
        }}
        children={value}/>
    ), [value]
  );

  return (
    <div {...rest}>
      <Markdown
        options={{
          overrides: {
            Price: {
              component: () => <div children="Price"/>,
              props: {
                className: 'foo',
              },
            },
          },
        }}
        children={value}/>
    </div>    
  )
}
