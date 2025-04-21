export const GradStroke = (
  { 
    direction='bg-gradient-to-tr', 
    from='from-transparent', via='via-kf-300', to='to-transparent', 
    from_stop='from-50%', to_stop='to-100%', 
    blur='blur-3xl', ...rest 
  }
) => {

  return (
    <div {...rest} >
      <div className={`
        ${direction} ${from} ${via} ${to}
        ${from_stop} ${to_stop} 
        ${blur}
        `
        } />
    </div>    
  )
}

export const GradStrokeV2 = (
  { 
    ...rest 
  }
) => {

  return (
    <div {...rest} >
      <div 
        className='w-full h-full 
          bg-linear-[25deg,transparent_50%,white_70%,transparent_90%]
          --blur-3xl'
        // cclassName='w-full h-full 
        //   --blur-xl bg-gradient-to-tr 
        //   from-transparent via-white --via-kf-300 to-transparent
        //   from-50% via-50% to-100%'
      />
    </div>    
  )
}
