import { RiCoupon3Line } from "react-icons/ri/index.js"

const Code = ({ value, className, context, ...rest }) => {

  const cls_color = context.item[1].enabled ? 'bg-teal-500' : 'bg-red-500'
  const cls = 'whitespace-nowrap pr-2 font-semibold text-base \
        max-w-[150px] sm:max-w-max overflow-x-auto' // + cls_color
  const isCoupon = String(context.item[1].application.id)==='1'

  return (
<div className={cls} children={value} >
  <span children={value} />
  {
    isCoupon && 
    <RiCoupon3Line 
      className={`block --text-xl text-white --p-0.5 
                  align-middle text-center ${cls_color}`}/>}
  {
    !isCoupon && 
    <span children='AUTO' 
      className={`block text-xs text-white w-fit px-1 
                  align-middle text-center ${cls_color}`}/>
  }
</div>
  )
}

export default Code