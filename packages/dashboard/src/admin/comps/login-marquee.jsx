import { IoLogoFirebase } from "react-icons/io5/index.js";
import Link from 'next/link.js'
import { Bling } from "./common-ui.jsx";


const LoginMarquee = ({ ...rest }) => {

  return (
<div {...rest} >
  <div className='w-full h-full px-3
            flex flex-row items-center
            bg-gradient-to-r from-pink-500 to-kf-500
            justify-between text-sm sm:text-base whitespace-nowrap'>
    <div className='flex flex-row items-center text-white flex-wrap'>
      <div className='hidden md:flex flex-row items-center text-white
                      '>
        <span children='🥳 SHELF' className='tracking-widest font-bold'/>
        &nbsp;
        <span children={`is HERE`} className=''/>
        &nbsp;
        <span children='>' className='font-extrabold text-white'/>
        &nbsp;
        <span children='Turn your' className=''/>
        &nbsp;
      </div>
      <IoLogoFirebase className='text-amber-400 scale-125' />
      &nbsp;
      <Link 
          href='https://firebase.google.com/' 
          target='_blank' 
          className='border-b border-dashed 
                border-yellow-300 px-0 border-'>
        <span 
            children='FIREBASE' 
            className='tracking-widest text-yellow-300 font-bold'/>
      </Link>
      &nbsp;
      <span children='project into a' className=''/>
      &nbsp;
      <span children='HEADLESS CMS' className='tracking-widest font-bold'/>
    </div>
    <Link href='docs' className='animate-pulse'
          title='Read The Docs'
          alt='Read The Docs'>
      <Capsule />
    </Link>
  </div>
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
