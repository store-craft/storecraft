import { LogoGradient } from "./logo-text"

export const Hero = () => {

  return (
  <div 
    className='w-full h-[140px] sm:h-[230px] overflow-clip 
      rounded-xl relative '>
    <div 
      className='graph absolute w-full h-full 
        -top-1/6 sm:-top-1/12 z-50 ' />
    
    <div className='absolute bottom-0 -right-0 sm:bottom-0 z-100'>
      <div className='bg-fuchsia-500/50 whitespace-pre-line 
        rounded-md border-2 --border-white/20 
        p-0 sm:p-2 --font-mono 
        border-pink-600/50 shadow-[0_2px_5px_rgba(7,217,222,0.75)]
        text-kf-900 font-bold dark:font-normal dark:text-white
        text-[10px] sm:text-sm 
        font-mono '>
        Ai first <br />
        Open Source <br />
        Typescript <br/>
        Commerce <br/>
        Backend
      </div>
    </div>

    <div 
      className='w-fit rounded-2xl px-2 xs:px-4 '>
      <LogoGradient 
        className='w-[300px] sm:w-[500px] md:w-[600px] ' />

      <div 
        className='sm:translate-y-0 md:-translate-y-3 lg:-translate-y-0
          text-2xl/tight sm:text-5xl md:text-5xl'>
        <span 
          children={`Next `} 
          className=' 
            text-kf-900 dark:text-white/90
            whitespace-pre-line 
            font-sans italic
            font-semibold
             -hidden --z-50' />
        <span 
          children={` Generation `} 
          className='  
            text-kf-900/70 dark:text-white/75
            whitespace-pre-line 
            font-inter --italic
            font-extralight
             -hidden --z-50' />        
        <br/>
        <span 
          children={`Headless Commerce `} 
          className=' 
            text-kf-900 dark:text-white/80
            whitespace-pre-line 
            font-sans italic
            font-semibold
             -hidden --z-50' />
        <span 
          children={` As Code`} 
          className=' 
            text-kf-900/70 dark:text-white/75
            whitespace-pre-line 
            font-inter --italic
            font-normal xs:font-light sm:font-light
             -hidden --z-50' />     
        <span 
          children={` x `} 
          className='text-2xl/tight sm:text-2xl  
            text-kf-900 dark:text-white/80
            whitespace-pre-line 
            font-mono --italic
            hidden sm:inline
            --font-bold
             -hidden --z-50' />     
        <span 
          children={` AI`} 
          className='
            text-kf-900 dark:text-white/80
            whitespace-pre-line 
            font-mono italic
            hidden sm:inline
            font-bold
             -hidden --z-50' />                  
      </div>
    </div>
    <div 
      className='absolute bottom-0 left-0 w-full 
        h-[26px] bg-pink-500/20 z-50'/>
  </div>

  )
}
