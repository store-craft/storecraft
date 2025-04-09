export const GradStroke = (
  { 
    direction='bg-gradient-to-tr', 
    from='from-transparent', via='via-kf-300', to='to-transparent', 
    from_stop='from-50%', to_stop='to-100%', 
    blur='blur-xl', ...rest 
  }
) => {

  return (
<div {...rest} >
  <div className={
    `w-full h-full
    ${direction} ${from} ${via} ${to}
    ${from_stop} ${to_stop} 
    ${blur}
    `
    } />
</div>    

  )
}
