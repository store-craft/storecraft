import pkg from '../../package.json'
import { Bling } from '@/components/common.jsx'

export const StorecraftText = (
  {
    className='text-[27px]', classNameLines='dark:bg-[rgb(24,31,46)]'
  }
) => {

  return (
<div className={className}>
  <div className='flex flex-row items-center'>
    <div className='relative'>
      <span children='STORE' 
        className='w-fit text-transparent bg-clip-text bg-gradient-to-r 
                 from-pink-500 to-kf-500 italic -tracking-widest 
                 font-extrabold ' />   
      <div className={classNameLines + ' absolute w-full h-px dark:h-px left-0 top-1/2 -translate-y-[2px] bg-white '}/>
      <div className={classNameLines + ' absolute w-full h-px dark:h-px left-0 top-1/2 translate-y-[6px] bg-white '}/>
      <div className={classNameLines + ' absolute w-full h-px dark:h-px left-0 top-1/2 translate-y-[2px] bg-white '}/>
    </div>
    <span children=' CRAFT' 
      className='w-fit text-transparent bg-clip-text bg-gradient-to-r 
               from-pink-500 to-kf-500 -tracking-wider font-extralight' />    

  </div>    
</div>    
  )
}

export const Logo = (
  { 
    ...rest 
  }
) => {

  const Capsule = ({}) => {

    return (
    <div className='rounded-lg my-auto b
                    bg-pink-50 dark:bg-pink-50/10 w-fit text-sm
                    text-pink-500 -tracking-wideset
                    py-0 px-1 --border font-semibold'>
      <div children='docs' className='inline-block -translate-y-px --inline'/>
      <span children=' 📖' />
    </div> 
    )
  }

  return (
<div className='relative w-full h-16 flex flex-row 
                items-start 
                border-b
                shelf-logo
                 text-xl font-bold 
                --pr-3 overflow-x-clip shadow-md' 
                {...rest}>
                  
  <LogoV2 className='h-full object-contain rounded-xl bg-teal-400 
                  scale-90 border-kf-600 --shadow-lg opacity-80' />                  

  <div className='flex flex-col justify-between h-full p-0.5'>
    <StorecraftText />
    <div className='flex flex-row justify-between items-center'>
      <span children={`v${pkg.version}`} 
        className='tracking-wider text-sm font-light font-mono' />
      <a href='docs' >
        <Capsule />
      </a>
  
    </div>              
  </div>                                  
</div>
  )
}



/**
 * 
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>} params
 */
export const LogoV2 = (
  {
    className='w-[512px] h-[512px] bg-slate-100 p-3', ...props
  }
) => {
  
  return (
<div className={className} {...props}>

  <Bling className='w-full h-full' stroke='border-[2px]'
          from='from-pink-600 dark:from-pink-500' 
          to='to-kf-600 dark:to-kf-500'>
    <div className='w-full h-full bg-slate-100 rounded-3xl shadow-xl
                    flex flex-row items-center justify-center rotate-6 scale-[1.0]'>
      <div className='w-full h-full  rounded-lg shadow-xl
                    flex flex-row items-center justify-center --opacity-80
                    --scale-[3.0] -rotate-'>
        <div className='w-full h-full overflow-clip rounded-sm'>
          <img src={'/main.png'}
               className='w-full h-full object-cover scale-[1.05] 
                        bg-teal-100 --bg-slate-300'/>
        </div>                      
      </div>                      
    </div>
  </Bling>

</div>    
  )
};
