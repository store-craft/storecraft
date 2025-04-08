import { useCallback, useRef, useState } from "react"
import CapsulesView, { CapsulesViewParams } from "./capsules-view.js"
import { BlingInput } from "./common-ui.js"
import { BlingButton, BlingButtonParams } from "./common-button.js"
import { to_handle } from "@storecraft/core/api/utils.func.js"
import { FieldLeafViewParams } from "./fields-view.js"

const text2tokens = (text: string) => {
    return text?.match(/\S+/g)
}

export type TagValuesParams = FieldLeafViewParams<string[]>;

const TagValues = (
  {
    field, value, onChange, ...rest
  }: TagValuesParams
) => {
  
  const { key, name, comp_params } = field
  const [vs, setVs] = useState(value ?? [])
  const ref = useRef<HTMLInputElement>(null)

  const onAdd: BlingButtonParams["onClick"] = useCallback(
    (e) => {
      const tokens = text2tokens(ref.current.value.toString()).map(t => to_handle(t));

      if(!tokens) return;

      for (let t of tokens)
        if(vs.indexOf(t) == -1)
          vs.push(t);

      const new_vs = [...vs];

      onChange(new_vs);
      setVs(new_vs);
    },
    [vs, onChange]
  );
  
  const onRemove: CapsulesViewParams<string>["onClick"] = useCallback(
    (v) => {
      const idx = vs.indexOf(v);

      if(idx == -1) return;

      vs.splice(idx, 1);

      const new_vs = [...vs];

      onChange(new_vs);
      setVs(new_vs);
    },
    [vs, onChange]
  );
  
  return (
<div {...comp_params}>
  <div className='flex flex-row items-center h-9 w-full gap-3 '>

    <BlingInput 
      placeholder='space separated values' 
      className='flex-grow'
      rounded='rounded-md'
      ref={ref} type='text'/>

    <BlingButton 
      children='Add' 
      stroke='border-2 h-10'
      onClick={onAdd}/>
  </div>
  <CapsulesView 
    tags={vs} 
    onClick={onRemove} 
    onRemove={onRemove}
    clsCapsule='bg-pink-500' 
    className='mt-3' />  
</div>
  )
}

export const values_validator = v => {
  const isValid = Array.isArray(v) && v.length
  return [isValid, isValid ? '' : 'Empty values']
}

export default TagValues