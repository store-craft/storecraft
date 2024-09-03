
/**
 * @typedef {object} SegmentParams
 * @prop {boolean} [reverse=false]
 * 
 * @param {SegmentParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 */
export const Segment = (
  {
    reverse=false, children, ...rest
  }
) => {

  return (
<div {...rest}>
  <div className={'flex w-full gap-10 items-center justify-between ' + (reverse ? 'flex-col md:flex-row-reverse ' : 'flex-col md:flex-row')}>
    {
      children
    }
  </div>

</div>    
  )
}

export const SegmentHeader = (
  {
    children
  }
) => {

  return (
    <p children={children}
    className='text-6xl font-normal w-fit' />

  )
}