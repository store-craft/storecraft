import { useCallback, useRef, useState } from "react"
import { BlingButton } from "./common-button.jsx"
import { BlingInput } from "./common-ui.jsx"
import CapsulesView from "./capsules-view.jsx"
import { HR } from "./common-ui.jsx"
import useNavigateWithState from "@/admin/hooks/useNavigateWithState.js"
import SelectResource from "./select-resource.jsx"

/** @param {string} text */
const text2tokens = (text) => {
  return text?.match(/\S+/g)
}

/**
 * @typedef {object} InternalManualTagParams
 * @prop {(values: string[]) => void} onAdd 
 * 
 * @param {InternalManualTagParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } param 
 * 
 */
const ManualTag = ({onAdd, ...rest}) => {
  /** @type {import("react").LegacyRef<import("react").InputHTMLAttributes>} */
  const ref_name = useRef();
  /** @type {import("react").LegacyRef<import("react").InputHTMLAttributes>} */
  const ref_value = useRef();

  /** @type {Parameters<BlingButton>["0"]["onClick"]} */
  const onClickAdd = useCallback(
    (e) => {
      const tokens = text2tokens(
        ref_value.current.value.toString()
        );
      const name = ref_name.current.value
      if(!tokens) return
      const tags = tokens.map(v => `${name}_${v}`)      
      onAdd(tags)
    },
    [onAdd]
  )

  return (
<div {...rest}>
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
 * @param {Omit<
 *  import('./select-resource.jsx').SelectResourceParams<
 *      import("@storecraft/core/v-api").TagType,
 *      string
 *    >, 
 *    'resource' | 'transform_fn' | 'name_fn'
 *  >
 * } params
 * 
 */
export const SelectTags = (
 { 
   onSelect, header, limit=100, layout=0,
   className, clsHeader, clsReload, ...rest 
 }
) => {

  /**
   * @type {import("./select-resource.jsx").SelectResourceParams<
   *  import("@storecraft/core/v-api").TagType, string
   * >["transform_fn"]}
   */
 const transform_fn = useCallback(
   (window) => {
     return window ? window.reduce(
       (p, value) => [...p, ...(value?.values ?? []).map(v => `${value.handle}_${v}`)]
       , []) : []
   }, []
 );

 return(
   <SelectResource 
       transform_fn={transform_fn} 
       name_fn={v => v} 
       onSelect={onSelect} 
       header={header}
       resource='tags' 
       limit={limit} 
       layout={layout} 
       className={className} 
       clsHeader={clsHeader} 
       clsReload={clsReload} 
       {...rest} />
 )
}

/**
 * 
 * @param {import("./fields-view.jsx").FieldLeafViewParams<string[], 
 *  import("../pages/index.jsx").BaseDocumentContext> & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } param0 
 */
const TagsEdit = (
  {
    field, context, value, onChange, ...rest
  }
) => {

  const [tags, setTags] = useState(value ?? [])

  const { navWithState } = useNavigateWithState()

  const onAdd = useCallback(
    /** @param {typeof value} new_tags  */
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
    /** @param {string} v  */
    (v) => {
      const where = v.split('_')[0]
      // const all = context?.query.all.get(false)?.data
      const state = context?.getState()
      navWithState(`/pages/tags/${where}/edit`, state)
    },
    [navWithState, context]
  )

  return (
<div {...rest}>
  <ManualTag onAdd={onAdd} />
  <HR className='mt-5' />

  <SelectTags 
      onSelect={t => onAdd([t])} 
      layout={1} 
      className='mt-3' clsReload='text-pink-500 text-3xl' 
      header='Select tags you used' />
  {
    tags?.length>0 && 
    <HR className='my-5' />
  }
  <CapsulesView 
    tags={tags} 
    onClick={onClick} 
    onRemove={onRemove}
    clsCapsule='bg-pink-500 dark:bg-pink-500/80' 
    className='mt-3' />
 
</div>
  )
}

export default TagsEdit