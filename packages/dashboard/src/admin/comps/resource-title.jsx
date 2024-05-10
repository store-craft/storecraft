import { Title } from "./common-ui.jsx"
import { GradientText } from "./gradient-text.jsx";
import { ResourceOnboardSvg } from "./resource-onboard-svg.jsx"
import ShowIf from "./show-if.jsx"



/**
 * 
 * @typedef {object} ResourceTitleParams
 * @prop {string} resource
 * @prop {boolean} [should_onboard=false]
 * @prop {boolean} [hasLoaded=true]
 * @prop {number} [overallColelctionCount=undefined]
 * 
 * @param {ResourceTitleParams} params
 */
export const ResourceTitle = (
  {
    resource, should_onboard=false, hasLoaded=true, overallColelctionCount: overallCollectionCount
  }
) => {

  return  (
<div className=''>
  
  <ShowIf show={should_onboard}>
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

  <ShowIf show={!should_onboard}>
    <div className='flex flex-col gap-3'>
    
      <GradientText 
          children={resource}
          className='bg-gradient-to-r from-pink-500 to-kf-500 
          dark:from-kf-600 dark:to-pink-500 text-5xl 
          inline-flex tracking-wide' />
      { overallCollectionCount!==undefined &&
        <Title 
          children={`${Math.max(overallCollectionCount ?? 0, 0)} items`} 
          className={hasLoaded ? 'animate-fadein' : 'opacity-0'} /> 
      }      
    </div>
  </ShowIf>

</div>    
  )
}