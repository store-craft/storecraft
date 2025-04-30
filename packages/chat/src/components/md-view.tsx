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

export type MDViewParams = {
  /**
   * @description The markdown content to be rendered
   */
  value?: string,
} & Omit<React.ComponentProps<'div'>, 'value'>;


export const MDView = (
  {
    value, ...rest
  }: MDViewParams
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
