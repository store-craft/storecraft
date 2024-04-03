import { useCallback, useRef, useState } from "react"
import CapsulesView from "./capsules-view.jsx"
import { BlingInput } from "./common-ui.jsx"
import { BlingButton } from "./common-button.jsx"

/**
 * @param {string} text 
 */
const text2tokens = (text) => {
    return text?.match(/\S+/g)
}

/**
 * 
 * @param {import("./fields-view.jsx").FieldLeafViewParams<
 *  string[]>
 * } param0 
 */
const TagValues = ({field, value, onChange, ...rest}) => {
  const { key, name, comp_params } = field
  const [vs, setVs] = useState(value ?? [])
  /** @type {import("react").LegacyRef<import("react").InputHTMLAttributes>} */
  const ref = useRef()

  const onAdd = useCallback(
    (e) => {
      const tokens = text2tokens(ref.current.value.toString());
      if(!tokens) return
      for (let t of tokens)
        if(vs.indexOf(t) == -1)
          vs.push(t)
      const new_vs = [...vs]
      onChange(new_vs)
      setVs(new_vs)
    },
    [vs, onChange]
  )
  
  const onRemove = useCallback(
    (v) => {
      const idx = vs.indexOf(v)
      if(idx == -1) return
      vs.splice(idx, 1)
      const new_vs = [...vs]
      onChange(new_vs)
      setVs(new_vs)
    },
    [vs, onChange]
  )
  
  return (
<div {...comp_params}>
  <div className='flex flex-row items-center h-9 w-full gap-3 '>

    <BlingInput placeholder='space separated values' 
            className='flex-grow'
            ref={ref} type='text'/>

    <BlingButton children='Add' stroke='p-0.5 h-10' 
                 onClick={onAdd}/>
  </div>
  <CapsulesView tags={vs} onClick={onRemove} 
                clsCapsule='bg-pink-500' className='mt-3' />  
</div>
  )
}

export const values_validator = v => {
  const isValid = Array.isArray(v) && v.length
  return [isValid, isValid ? '' : 'Empty values']
}

export default TagValues