import { useCallback, useRef, useState } from "react"
import { BlingButton, Button } from "./common-button"
import { BlingInput } from "./common-ui"
import { SelectTags } from "./select-collection"
import CapsulesView from "./capsules-view"
import { HR } from "./common-ui"
import { FieldContextData, FieldData } from "./fields-view"
import useNavigateWithState from "../hooks/useNavigateWithState"

const text2tokens = (text) => {
  return text?.match(/\S+/g)
}

const ManualTag = ({onAdd, className, ...rest}) => {
  const ref_name = useRef()
  const ref_value = useRef()
  const onClickAdd = useCallback(
    (e) => {
      const tokens = text2tokens(ref_value.current.value.toString())
      const name = ref_name.current.value
      if(!tokens) return
      const tags = tokens.map(v => `${name}_${v}`)      
      onAdd(tags)
    },
    [onAdd]
  )

  return (
<div className={className} {...rest}>
  <p children='Name' className='text-gray-500 dark:text-gray-400'/>
  <BlingInput ref={ref_name} placeholder='name of the tag' 
              type='text' className='mt-1' rounded='rounded-md'  /> 
  <p children='Tag Values' 
     className='mt-3 text-gray-500 dark:text-gray-400'/>
  <div className='flex flex-row items-center h-fit w-full mt-1 gap-3'>
    <BlingInput ref={ref_value} placeholder='values of the tag' 
                type='text' className='mt-1 flex-1' rounded='rounded-md' /> 
    <BlingButton children='add' className='h-10 ' 
                 onClick={onClickAdd} />
  </div>
</div>
  )
}

/**
 * 
 * @param {object} param0 
 * @param {FieldData} param0.field 
 * @param {FieldContextData} param0.context 
 * @param {string[]} param0.value 
 * @param {(v: string[]) => any} param0.onChange 
 * @returns 
 */
const TagsEdit = ({field, context, value, onChange, className, ...rest}) => {
  const [tags, setTags] = useState(value ?? [])

  const { navWithState } = useNavigateWithState()

  const onAdd = useCallback(
    (new_tags) => {
      let selected_tags = new_tags.filter(
        t => tags.indexOf(t)==-1
        )
      selected_tags = [ ...tags, ...selected_tags ];
      onChange && onChange(selected_tags);
      setTags(selected_tags);
    },
    [tags, onChange]
  )
  
  const onRemove = useCallback(
    (v) => {
      const idx = tags.indexOf(v)
      if(idx == -1) return
      tags.splice(idx, 1)
      const new_tags = [...tags]
      onChange(new_tags)
      setTags(new_tags)
    },
    [tags, onChange]
  )

  const onClick = useCallback(
    (v) => {
      const where = v.split('_')[0]
      // const all = context?.query.all.get(false)?.data
      const state = context?.getState()
      navWithState(`/pages/tags/${where}/edit`, state)
    },
    [navWithState, context]
  )

  return (
<div className={className}>
  <ManualTag onAdd={onAdd} />
  <HR className='mt-5' />

  <SelectTags collectionId='tags' 
              onSelect={t => onAdd([t])} 
              layout={1} 
              className='mt-3' clsReload='text-pink-500 text-3xl' 
              header='Select tags you used' />
  {
    tags?.length>0 && 
    <HR className='my-5' />
  }
  <CapsulesView tags={tags} onClick={onClick} onRemove={onRemove}
                clsCapsule='bg-pink-500' className='mt-3' />
 
</div>
  )
}

export default TagsEdit