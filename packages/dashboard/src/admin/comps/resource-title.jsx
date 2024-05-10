import { Title } from "./common-ui.jsx"
import { GradientText } from "./gradient-text.jsx";
import { ResourceOnboardSvg } from "./resource-onboard-svg.jsx"
import ShowIf from "./show-if.jsx"


/**
 * 
 * @typedef {object} ResourceTitleParams
 * @prop {number} [count=0]
 * @prop {boolean} [hasLoaded=false]
 * @prop {string} resource
 * 
 * @param {ResourceTitleParams} params
 */
export const ResourceTitle = (
  {
    resource, count, hasLoaded
  }
) => {

  const show_onboarding = hasLoaded && count!==undefined && count<=0;

  return  (
<div className=''>
  
  <ShowIf show={show_onboarding}>
    <div className='flex flex-row items-center justify-between relative'>
      <div className='flex flex-col flex-wrap items-baseline gap-3 --w-3/4'>
        <div className='flex flex-row gap-3 flex-wrap items-baseline'>
          <Title children='Welcome'/>
          <Title children='👋' className='animate-waving-hand' />
          <Title children='to your empty' />
        </div>
        <GradientText 
            children={resource} 
            className='bg-gradient-to-r from-kf-500 to-pink-500 
                      dark:from-kf-600 dark:to-pink-500 
                        text-6xl font-inter inline-flex' />
        <Title 
            children={`let's create something `}
            className='animate-fadein'  />
      </div>
      <ResourceOnboardSvg 
          className='w-[150px] scale-[3.0] duration-300 transition-transform
          translate-x-[75px] translate-y-[55px] -rotate-[30deg] overflow-clip
          opacity-30 right-0 top-0 flex-shrink-0 absolute' />
    </div>    
  </ShowIf>

  <ShowIf show={!show_onboarding}>
    <div className='flex flex-col gap-3'>
    
      <GradientText 
          children={resource}
          className='bg-gradient-to-r from-pink-500 to-kf-500 
          dark:from-kf-600 dark:to-pink-500 text-5xl 
          inline-flex tracking-wide' />
      {
        count!==undefined &&
        <Title 
          children={`${count} items`} 
          className={count > 0 ? 'animate-fadein' : 'opacity-0'} /> 
      }      
    </div>
  </ShowIf>

</div>    
  )
}