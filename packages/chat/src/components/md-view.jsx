import { useMemo } from 'react'
import Markdown from 'markdown-to-jsx'
import { LoadingImage } from './loading-image'

const options = {
  overrides: {
    img: {
      component: (props) => <LoadingImage {...props}  />,
      props: {
        className: 'h-40 w-full rounded-lg border chat-border-overlay',
      },
    },
  }
}

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
    () => (
      <div {...rest}>
        <Markdown
          options={options}
          children={value}/>
      </div>
    ), [value, rest.className]
  );

  return Comp;
}
