import { to_handle } from '@/utils/func.utils.js'

/**
 * @typedef {object} TOCParams
 * @prop {string} [className]
 * @prop {import('../../pages/[[...slug]].js').PostPageProps["data"]["headings"]} [headings]
 * 
 * @param {TOCParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 * 
 */
export const TOC = (
  { 
    headings, ...rest
  }
) => {


  return (
  <div {...rest}>
    <div className='px-4'>
    {
      headings.map(
        h => (
          <a href={'#' + to_handle(h.text)} children={h.text} className='' />
        )
      )
    }
    </div>
  </div>
  )
}

export default TOC
