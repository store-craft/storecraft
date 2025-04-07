import LazyCarousel from './lazy-carousel.jsx'



const LoginContent = (
  {}
) => {

  return (
<LazyCarousel className=' --bg-red-100 order-2 md:flex-1 
                w-full md:w-fit
                h-[624px] md:h-full
                -translate-y-24 md:translate-y-0
                md:-ml-20
                flex flex-row items-start
                md:py-0
                --bg-gradient-to-t --md:bg-gradient-to-r 
                from-slate-100 to-teal-50 --bg-green-400'>

  <div className='pt-10 md:pt-0 mx-auto w-fit h-auto '>
    <Paragraph />
  </div>  
  <ImageItem src='login/col-1.webp' 
              text='Easily Create collection of products' />
  <ImageItem src='login/dash-1.webp' 
              text='Beautiful dashboard will reveal your income and trends' />
  <ImageItem src='login/orders-1.webp' 
              text='Watch your orders and handle payments' />
  <ImageItem src='login/mob-1.webp' 
              text='Slick mobile experience' 
              className='max-w-[350px] md:w-[350px]'/>
  <ImageItem src='login/mob-2.webp' 
              text='Slick mobile experience' 
              className='max-w-[350px] md:w-[350px]'/>
  <ImageItem src='login/mob-3.webp' 
              text='Slick mobile experience' 
              className='max-w-[350px] md:w-[350px]'/>
  <ImageItem src='login/noti-1.webp' 
              text='Notifications are always there for you' />
  <ImageItem src='login/dis-1.webp' 
              text='Create Five types of layered discounts' />
  <ImageItem src='login/dis-2.webp' 
              text='With slick UI and explanations' />
  <ImageItem src='login/media-1.webp' 
              text='Edit your media images with Crop, Rotations, 
              Scaling, Translations and more' />
  <ImageItem src='login/sf-1.webp' 
              text='Create amazing store fronts' />
  <ImageItem src='login/storage-1.webp' 
              text='Connect your favorite storage' />
  <ImageItem src='login/light-1.webp' 
              text='Choose between Dark and Light mode' />
  <ImageItem src='login/tag-1.webp' 
              text='Create special tags easily and use them everywhere' />
  <ImageItem src='login/va-1.webp' 
              text='Create variants of products with few clicks' />
  <ImageItem src='login/gal-1.webp' 
              text='A rich images gallery' />
  <ImageItem src='login/docs-1.webp' 
              text="Up to date docs to keep you learning " />
</LazyCarousel>
    
  )
}

export default LoginContent;

/**
 * 
 * @typedef {object} ImageItemParams
 * @prop {string} src
 * @prop {string} text
 * @prop {string} [className]
 * 
 * @param {ImageItemParams} params
 */
const ImageItem = (
  {
    src, text, className='max-w-[768px] md:w-[768px]'
  }
) => {

  return (
<div className={`p-10 flex flex-col-reverse gap-5 mx-auto w-full 
                 h-fit  ${className} `}>
  
  <img src={src} 
        className='object-center object-contain rounded-xl 
                  shadow-xl border w-full h-auto' /> 
   <p className='text-4xl font-extrabold text-pink-600' 
      children={text} />     
</div>  
  )
}


const Paragraph = ({}) => {

  return (
<div className='flex flex-col justify-start mx-auto 
                      items-center text-6xl md:text-5xl'>
  <p children='welcome' 
      className='w-fit pl-0.5 text-6xl md:text-9xl 
                 tracking-widest 
                  text-transparent bg-clip-text bg-gradient-to-r 
                  from-kf-600 to-kf-200 font-thin' />

  <p children='to' 
     className='w-fit pl-0.5 mt-0 font-thin text-4xl 
                text-transparent bg-clip-text 
                bg-gradient-to-r from-pink-500 to-pink-200' />

  <div className='w-fit h-fit mt-1 --translate-y-6 --scale-125'>
    <span children='#' 
          className='hidden font-bold sm:inline 
                   text-gray-800 text-6xl md:text-6xl' /> 
    <div children='shelf//CMS' 
      className=' break-words inline pl-0.5 font-mono font-normal 
                text-5xl sm:text-7xl md:text-7xl text-transparent 
                tracking-wide bg-clip-text bg-gradient-to-r 
                from-kf-600 to-pink-400' >
    </div>
  </div>

  <img src='/main/main_half.png' draggable='false'
       className='mt-7 max-w-[16rem] sm:max-w-none'/>

  <p children='Commerce' 
      className='w-fit pl-0.5 mt-3 font-thin text-transparent 
                bg-clip-text bg-gradient-to-r 
                from-pink-400 to-pink-400' />
</div>
  )
}
