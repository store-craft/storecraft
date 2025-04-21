import { Bling } from "@/components/common";

export default function LogoPage() {
  return (
<div className={'w-[512px] h-[512px] --bg-slate-100 p-3'} >

  <Bling className='w-full h-full' stroke='border-[2px]'
          from='from-pink-600 dark:from-pink-500' 
          to='to-kf-600 dark:to-kf-500'>
    <div className='w-full h-full --bg-slate-100 rounded-3xl shadow-xl
                    flex flex-row items-center justify-center rotate-6 scale-[1.0]'>
      <div className='w-full h-full  rounded-lg shadow-xl
                    flex flex-row items-center justify-center --opacity-80
                    --scale-[3.0] -rotate-'>
        <div className='w-full h-full overflow-clip rounded-sm'>
          <img src={'/main_big.png'}
              className='w-full h-full object-cover scale-[1.05] 
                        bg-teal-100 --bg-slate-300'/>
        </div>                      
      </div>                      
    </div>
  </Bling>

</div>      )
}