

/**
 * 
 * @param {React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>} params
 * 
 */
export const Image = (
  { 
    className, ...rest 
  }
) => {

  return (
    <img className={className + ' rounded-xl overflow-clip border-4 border-pink-400/60'} {...rest} />
  )
}




/**
 * 
 * @typedef {object} ImageWithLabel
 * @prop {string} label
 * @prop {string} src
 * @prop {string} imgClass
 * 
 * @param {ImageParams & 
*  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
* } params
* 
*/
export const ImageWithLabel = (
 { 
   label, src, imgClass, ...rest 
 }
) => {

 return (
<div {...rest}>
 <div className='w-full h-full flex flex-col rounded-lg 
                 overflow-clip border-2 border-gray-400/40'>
   {
     label &&
     <div 
         children={`${label}`}
         className='w-full h-fit bg-slate-100 text-gray-500 
                   text-base p-2 font-semibold' />
   }  
   <img src={src} className={imgClass}/>
 </div>
</div>
 )
}
