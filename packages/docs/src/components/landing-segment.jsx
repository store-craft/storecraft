
export const Segment = (
  {
    children, ...rest
  }
) => {

  return (
<div {...rest}>
  <div className='flex flex-col md:flex-row w-full md:w-fit gap-10 items-center --mx-auto justify-between'>
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