import { LogoGradient } from "./logo-text.jsx"

export const Hero = () => {

  return (
  <div className='w-full h-[180px]  sm:h-[280px] overflow-clip relative '>
    <div className='graph absolute w-full h-full -top-1/4 z-50 ' />

    <div className='w-fit rounded-2xl px-2 xs:px-4'>
      <LogoGradient className='w-[300px] sm:w-[500px] md:w-[600px] ' />
      <div children={`
Next Generation 
Commerce As Code 
      `}
        className='text-4xl sm:text-5xl font-normal 
        whitespace-pre-line left-2 xs:left-4 bottom-8 
        absolute -hidden --z-50
        ' />

    </div>
    <div className='absolute bottom-0 left-0 w-full h-[26px] bg-pink-500/20 z-50'/>
  </div>

  )
}
