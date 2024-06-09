import { DiscountApplicationEnum } from "@storecraft/core/v-api/types.api.enums.js"
import { RiCoupon3Line } from "react-icons/ri/index.js"

/**
 * 
 * @param {object} param 
 * @param {string} param.value 
 * @param {import("./table-schema-view.jsx").TableSchemaViewContext<
 * import("@storecraft/core/v-api").DiscountType>} param.context 
 */
const Code = (
  { 
    value, context, ...rest 
  }
) => {

  const cls_color = context.item.active ? 'bg-teal-500' : 'bg-red-500';
  const cls = 'whitespace-nowrap pr-2 font-semibold text-base \
        max-w-[150px] sm:max-w-max overflow-x-auto'; // + cls_color
  const isCoupon = context.item.application.id===DiscountApplicationEnum.Manual.id

  return (
<div className={cls} >
  <span children={value} />
  {
    isCoupon && 
    <RiCoupon3Line 
      className={`block --text-xl text-white --p-0.5 
                  align-middle text-center ${cls_color}`}/>}
  {
    !isCoupon && 
    <span children='AUTO' 
      className={`block text-xs text-white w-fit px-1 border shelf-border-color-blend
                  align-middle text-center ${cls_color}`}/>
  }
</div>
  )
}

export default Code