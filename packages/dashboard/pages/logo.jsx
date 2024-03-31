import { useRouter } from 'next/navigation.js'
import { useEffect } from 'react'
import { Bling } from '../src/admin/comps/common-ui.jsx'

const Logo = () => {
  
  return (
<div className='w-[512px] h-[512px] bg-slate-100 p-3'>

  <Bling className='w-full h-full' stroke='p-3'
          from='from-pink-500 dark:from-pink-500' 
          to='to-kf-600 dark:to-kf-500'>
    <div className='w-full h-full bg-slate-100 rounded-3xl shadow-xl
                    flex flex-row items-center justify-center rotate-6'>
      <div className='w-full h-full  rounded-lg shadow-xl
                    flex flex-row items-center justify-center --opacity-80
                    --scale-[3.0] -rotate-'>
        <div className='w-full h-full overflow-clip rounded-xl'>
          <img src='main/main.png' 
               className='w-full h-full object-cover scale-[1.05] bg-teal-100 --bg-slate-300'/>
        </div>                      
        {/* <p children='Sh' 
              className='w-fit  --text-xl --tracking-tighter
                        text-transparent 
                        bg-clip-text bg-gradient-to-r to-pink-600 from-kf-600 
                        font-extrabold flex flex-row items-center' >
          <span children='S' className='text-9xl '
                style={{ fontSize: '160px'}}/>   

          <div className='h-42 flex flex-col --justify-between -translate-x-pxss pr-1'>
            <span children='helf' className='text-4xl text border-b-4 border-gray-400 border-dashed'/>                          
            <span children='CMS' className='text-4xl text-gray-800'/>                          
          </div>                  
        </p>                       */}
        {/* <p children='S' className='text-9xl font-bold  origin-center' /> */}
        {/* <p children='H' className='text-8xl font-bold --scale-[3.0] origin-center' /> */}
      </div>                      
    </div>
  </Bling>

</div>    
  )
};


export default Logo;