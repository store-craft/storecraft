import { Link } from 'react-router-dom'
import { Bling } from "./common-ui.jsx";
import { LogoGradient } from "./logo-text.jsx";


const LoginMarquee = (
  { 
    ...rest 
  }
) => {

  return (
<div {...rest} >
  <div className='w-full h-full px-3
            flex flex-row items-center
            bg-gradient-to-r from-pink-500/0 to-kf-500
            justify-between text-sm sm:text-base whitespace-nowrap'>
    <LogoGradient className='h-[27px]' />

    <Link to='https://storecraft.app/docs' 
          className='animate-pulse'
          title='Read The Docs'
          alt='Read The Docs'>
      <Capsule />
    </Link>
  </div>
  <div className='w-full bg-gradient-to-r from-pink-500 to-kf-500 h-1 
                  shadow-[0px_0px_10px] shadow-pink-500/80' />
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
