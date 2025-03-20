import { marked } from 'marked'
import { useMemo } from 'react'

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
  const memo = useMemo(
    () => marked.parse(
      value ?? '', { 
        // @ts-ignore
        mangle: false, 
        headerIds: false, 
        sanitize:false,
      }
    ), [value]
  );

  const Memo = useMemo(
    () => () => (
      <div className='--mdx md-view overflow-auto' 
        dangerouslySetInnerHTML={
          {
            __html : marked.parse(
              value ?? '', { 
                // @ts-ignore
                mangle: false, 
                headerIds: false, 
                sanitize:false,
              }
            )
          }
        }
      />
    ), 
    [value]
  );

  return (
    <div {...rest}>
      <Memo />
    </div>    
  )
}
