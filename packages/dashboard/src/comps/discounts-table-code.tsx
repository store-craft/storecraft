import { DiscountType } from "@storecraft/core/api"
import { DiscountApplicationEnum } from "@storecraft/core/api/types.api.enums.js"
import { RiCoupon3Line } from "react-icons/ri"
import { TableSchemaViewContext } from "./table-schema-view"

export type CodeParams = {
  value: string,
  context: TableSchemaViewContext<DiscountType>
}

const Code = (
  { 
    value, context, ...rest 
  }: CodeParams
) => {

  const cls_color = context.item.active ? 'bg-teal-500' : 'bg-red-500';
  const cls = 'whitespace-nowrap pr-2 font-medium font-inter text-base \
        max-w-[150px] sm:max-w-max overflow-clip hover:overflow-x-auto'; // + cls_color
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