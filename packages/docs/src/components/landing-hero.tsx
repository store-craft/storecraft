import { LogoGradient } from "./logo-text"

export const Hero = () => {

  return (
  <div 
    className='w-full h-[140px] sm:h-[230px] overflow-clip 
      rounded-xl relative '>
    <div 
      className='graph absolute w-full h-full 
        -top-1/6 sm:-top-1/12 z-50 ' />

    <div 
      className='w-fit rounded-2xl px-2 xs:px-4'>
      <LogoGradient 
        className='w-[300px] sm:w-[500px] md:w-[600px] ' />

<div className=''>
        <span 
          children={`Next `} 
          className='text-2xl/tight sm:text-5xl  
            text-kf-900 dark:text-white/90
            whitespace-pre-line 
            left-3 xs:left-5 sm:left-6 
            bottom-7 sm:bottom-8 
            font-sans italic
            font-semibold
             -hidden --z-50' />
        <span 
          children={` Generation `} 
          className='text-2xl/tight sm:text-5xl  
            text-kf-900/70 dark:text-white/75
            whitespace-pre-line 
            left-3 xs:left-5 sm:left-6 
            bottom-7 sm:bottom-8 
            font-inter --italic
            font-extralight
             -hidden --z-50' />        
        <br/>
        <span 
          children={`Commerce `} 
          className='text-2xl/tight sm:text-5xl  
            text-kf-900 dark:text-white/80
            whitespace-pre-line 
            left-3 xs:left-5 sm:left-6 
            bottom-7 sm:bottom-8 
            font-sans italic
            font-semibold
             -hidden --z-50' />
        <span 
          children={` As Code`} 
          className='text-2xl/tight sm:text-5xl  
            text-kf-900/70 dark:text-white/75
            whitespace-pre-line 
            left-3 xs:left-5 sm:left-6 
            bottom-7 sm:bottom-8 
            font-inter --italic
            font-normal xs:font-light sm:font-light
             -hidden --z-50' />     
        <span 
          children={` AI`} 
          className='text-2xl/tight sm:text-5xl  
            text-kf-900 dark:text-white/80
            whitespace-pre-line 
            left-3 xs:left-5 sm:left-6 
            bottom-7 sm:bottom-8 
            font-mono --italic
            font-bold
             -hidden --z-50' />     
</div>
      {/* <span 
        children={`Next`}
        className='text-2xl/tight sm:text-5xl  
          text-kf-900 dark:text-white/80
          whitespace-pre-line 
          left-3 xs:left-5 sm:left-6 
          bottom-7 sm:bottom-8 
          font-inter --italic
          font-normal xs:font-normal sm:font-light
          absolute -hidden --z-50' /> */}
    
      {/* <span 
        children={`
Next Generation 
Commerce As Code Ai
       `}
        className='text-2xl/tight sm:text-5xl  
          text-kf-900 dark:text-white/80
          whitespace-pre-line 
          left-3 xs:left-5 sm:left-6 
          bottom-7 sm:bottom-8 
          font-inter --italic
          font-normal xs:font-normal sm:font-light
          absolute -hidden --z-50' /> */}
    </div>
    <div 
      className='absolute bottom-0 left-0 w-full 
        h-[26px] bg-pink-500/20 z-50'/>
  </div>

  )
}
