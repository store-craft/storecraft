import { Title } from "./common-ui"
import { GradientText } from "./gradient-text";
import { ResourceOnboardSvg } from "./resource-onboard-svg"
import ShowIf from "./show-if"

export type ResourceTitleParams = {
  resource: string;
  should_onboard?: boolean;
  hasLoaded?: boolean;
  overallCollectionCount?: number;
};

export const ResourceTitle = (
  {
    resource, should_onboard=false, hasLoaded=true, 
    overallCollectionCount
  }: ResourceTitleParams
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
                      uppercase font-extrabold italic tracking-tighter
                      -translate-x-2
                      text-5xl font-inter inline-flex' />
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
    
      <div className='flex flex-row items-baseline text-3xl/none'>
        <GradientText 
            children={resource.slice(0,3)}
            className='bg-gradient-to-r from-kf-600 to-pink-500 
            dark:from-kf-600 dark:to-pink-500 --text-5xl 
            uppercase font-medium italic tracking-tighter
            inline-flex --tracking-wide' />
        <GradientText 
            children={resource.slice(3)}
            className='bg-gradient-to-r from-pink-600 to-pink-500 
            dark:from-pink-600 dark:to-pink-500 --text-5xl 
            uppercase font-extralight italic tracking-tighter --hidden --text-[34px]
            -translate-x-[3px]
            inline-flex --tracking-wide' />

      </div>
      { 
        overallCollectionCount!==undefined &&
        <Title 
          children={`${Math.max(overallCollectionCount ?? 0, 0)} items`} 
          className={hasLoaded ? 'animate-fadein' : 'opacity-0'} /> 
      }      
    </div>
  </ShowIf>

</div>    
  )
}