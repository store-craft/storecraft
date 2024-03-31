import React, { 
  useCallback, useEffect, useState } from 'react'
import { GradientFillIcon, 
  GradientStrokeIcon } from './common-button.jsx'
import { MdLightMode, MdNightlight } from 'react-icons/md/index.js'
import useDarkMode from '../hooks/useDarkMode.js'


const DarkMode = 
  ({ ...rest }) => {
  
  const { darkMode, toggle } = useDarkMode()

  return (
<div className='relative'>

  <GradientFillIcon
      Icon={darkMode ? MdLightMode : MdNightlight} 
      className={'cursor-pointer ' + (darkMode ? 'h-6 w-6' : 'h-5 w-5')}
      onClick={toggle} />    

</div>    
  )
}

export default DarkMode
