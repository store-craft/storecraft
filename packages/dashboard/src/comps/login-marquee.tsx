import { Link } from 'react-router-dom'
import { Bling } from "./common-ui.js";
import { LogoGradient } from "./logo-text.jsx";
import React from 'react';


const LoginMarquee = (
  { 
    ...rest 
  }: React.ComponentProps<'div'>
) => {

  return (
<div {...rest} >
  <div className='w-full h-full px-3
            flex flex-row items-center
            bg-gradient-to-r from-transparent to-kf-500
            justify-between text-sm sm:text-base whitespace-nowrap'>
    <a href='https://storecraft.app'>
      <LogoGradient className='h-[27px] pl-6' />
    </a>

    <Link to='https://storecraft.app/docs' 
          className='animate-pulse'
          title='Read The Docs'>
      <Capsule />
    </Link>
  </div>
  <div className='w-full bg-gradient-to-r 
                from-kf-500 to-pink-500 
                dark:from-pink-500 dark:to-kf-500 h-1 
                  dark:shadow-[0px_0px_10px] dark:shadow-pink-500/80' />
</div>    
  )
}


export default LoginMarquee;


const Capsule = ({}) => {

  return (
<Bling 
    rounded='rounded-full' stroke='border-2' 
    from='from-pink-400' to='to-pink-500'>
  <div 
      className='rounded-full my-auto bg-kf-800 w-fit text-sm
                 py-1 px-2 --border text-white font-semibold'>
   <span children='Read The docs' />
  </div> 
</Bling>       
  )
}
