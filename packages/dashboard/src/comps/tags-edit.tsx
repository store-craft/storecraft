import { useCallback, useRef, useState } from "react"
import { BlingButton, BlingButtonParams } from "./common-button"
import { BlingInput } from "./common-ui"
import CapsulesView from "./capsules-view"
import { HR } from "./common-ui"
import useNavigateWithState from "@/hooks/use-navigate-with-state"
import SelectResource, { SelectResourceParams } from "./select-resource"
import { TagType } from "@storecraft/core/api"
import { FieldLeafViewParams } from "./fields-view"
import { BaseDocumentContext } from "@/pages"

const text2tokens = (text: string) => {
  return text?.match(/\S+/g)
}

export type ManualTagParams = {
  onAdd: (values: string[]) => void
} & React.ComponentProps<'div'>;

const ManualTag = (
  {
    onAdd, ...rest
  }: ManualTagParams
) => {

  const ref_name = useRef<HTMLInputElement>(null);
  const ref_value = useRef<HTMLInputElement>(null);

  const onClickAdd: BlingButtonParams["onClick"] = useCallback(
    (e) => {
      const tokens = text2tokens(
        ref_value.current.value.toString()
      );
      
      const name = ref_name.current.value;

      if(!tokens) return;

      const tags = tokens.map(v => `${name}_${v}`);

      onAdd(tags);
    },
    [onAdd]
  );

  return (
<div {...rest}>
  <p 
      children='Name' 
      className='text-gray-500 dark:text-gray-400'/>
  <BlingInput 
      ref={ref_name} 
      placeholder='name of the tag' 
      type='text' 
      className='mt-1' 
       /> 
  <p children='Tag Values' 
     className='mt-3 text-gray-500 dark:text-gray-400'/>
  <div className='flex flex-row items-center h-fit w-full mt-1 gap-3'>
    <BlingInput 
        ref={ref_value} 
        placeholder='values of the tag' 
        type='text' 
        className='mt-1 flex-1' 
        /> 
    <BlingButton 
        children='add' 
        className='h-10 ' 
        onClick={onClickAdd} />
  </div>
</div>
  )
}

export type SelectTagsParams = Omit<
  SelectResourceParams<'tags', TagType, string>, 
  'resource' | 'transform_fn' | 'name_fn'
>

export const SelectTags = (
 { 
   onSelect, header, limit=100, layout=0,
   className, clsHeader, clsReload, ...rest 
 }: SelectTagsParams
) => {

 const transform_fn: SelectResourceParams<'tags', TagType, string>["transform_fn"] = useCallback(
   (window) => {
     return window ? window.reduce(
       (p, value) => [...p, ...(value?.values ?? []).map(v => `${value.handle}_${v}`)]
       , []) : []
   }, []
 );

 return(
   <SelectResource<'tags', TagType, string>
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
      {...rest} 
    />
 )
}

export type TagsEditParams = FieldLeafViewParams<
  string[], 
  BaseDocumentContext
> & React.ComponentProps<'div'>;


const TagsEdit = (
  {
    field, context, value=[], onChange, setError, ...rest
  }: TagsEditParams
) => {

  const [tags, setTags] = useState(value);
  const { navWithState } = useNavigateWithState();

  const onAdd = useCallback(
    (new_tags: typeof value) => {
      let selected_tags = new_tags.filter(
        t => tags.indexOf(t)==-1
      );

      selected_tags = [ ...tags, ...selected_tags ];

      onChange && onChange(selected_tags);
      setTags(selected_tags);
    },
    [tags, onChange]
  );
  
  const onRemove = useCallback(
    (v) => {
      const idx = tags.indexOf(v);

      if(idx == -1) 
        return;

      tags.splice(idx, 1);

      const new_tags = [...tags];

      onChange(new_tags);
      setTags(new_tags);
    },
    [tags, onChange]
  );

  const onClick = useCallback(
    (v: string) => {
      const where = v.split('_')[0];

      // const all = context?.query.all.get(false)?.data
      const state = context?.getState();

      navWithState(`/pages/tags/${where}`, state);
    },
    [navWithState, context]
  );

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