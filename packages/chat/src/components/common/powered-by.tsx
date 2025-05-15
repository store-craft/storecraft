import { LogoGradient } from "./logo-text"

export const PoweredBy = () => {

  return (
    <div className='flex flex-row justify-end --items-baseline gap-0.5 w-fit h-fit 
                text-[9px] tracking-wider uppercase italic --scale-200 font-bold '>
      <div className=''>powered</div>
      <div className=''>by</div>
      {/* <img src={banner} className='inline-block h-[14px] -translate-y-[2px]' /> */}
      <LogoGradient className='h-[15px] -translate-y-[3px]' />
    </div>
  )
}