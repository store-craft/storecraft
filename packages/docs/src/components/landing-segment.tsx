
export type SegmentParams = {
  reverse?: boolean;
} & React.ComponentProps<'div'>;


export const Segment = (
  {
    reverse=false, children, ...rest
  } : SegmentParams
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
  } : React.ComponentProps<'p'>
) => {

  return (
    <p children={children}
    className='text-6xl font-normal w-fit' />

  )
}