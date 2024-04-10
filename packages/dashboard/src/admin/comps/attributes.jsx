import { useCallback } from 'react'
import { Bling, BlingInput } from './common-ui.jsx'
import { MdClose } from 'react-icons/md/index.js'
import { BiMessageSquareAdd } from 'react-icons/bi/index.js'
import { GradientFillIcon } from './common-button.jsx'

/**
 * 
 * @typedef {object} InnerAttrParams
 * @prop {import('@storecraft/core/v-api').AttributeType} val
 * @prop {(attribute: import('@storecraft/core/v-api').AttributeType) => void} onChange
 * @prop {() => void} onDelete
 * 
 * @param {InnerAttrParams &
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 * 
 */
const Attr = (
  { 
    val, onChange, onDelete, className 
  }
) => {

  const onChangeInternal = useCallback(
    /**
     * @param {string} key 
     * @param {React.ChangeEvent<HTMLInputElement>} e 
     */
    (key, e) => {
      onChange({ ...val, [key]: e.currentTarget.value })
    }, [onChange, val]
  );

  return (
    
<Bling 
    className={`shadow-md shadow-slate-300 dark:shadow-slate-800 ${className}`} 
    stroke='p-px' 
    rounded='rounded-lg'>
  <div className='w-full relative rounded-lg
                  shelf-bling-fill
                  p-3 border 
                  dark:border-slate-600'>

    <p children='Key' className=''/>
    <BlingInput 
        className='mt-1' stroke='pb-px'
        onChange={e => onChangeInternal('key', e)}
        value={val.key}
        placeholder='attribute key' 
        type='text' />

    <p children='Value' className='mt-3'/>
    <BlingInput 
        className='mt-1' stroke='pb-px'
        onChange={e => onChangeInternal('val', e)}
        value={val.value}
        placeholder='attribute value' 
        type='text' 
        />

    <MdClose 
        className='absolute top-3 right-3 cursor-pointer text-lg' 
        onClick={onDelete} />

  </div>    
</Bling>    
  )
}

/**
 * @typedef {import('./fields-view.jsx').FieldLeafViewParams<
 *  import('@storecraft/core/v-api').AttributeType[]> & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } AttributesParams
 * 
 * @param {AttributesParams} params
 */
const Attributes = (
  {
    field, value=[], onChange, ...rest
  }
) => {
  
  const onAdd = useCallback(
    () => {
      onChange([ { key: '', value: '' }, ...value])
    }, [value, onChange]
  );

  const onChangeInternal = useCallback(
    /**
     * 
     * @param {number} idx 
     * @param {import('@storecraft/core/v-api').AttributeType} val 
     */
    (idx, val) => {
      value[idx] = val
      onChange([ ...value ])
    }, [value, onChange]
  );

  const onDelete = useCallback(
    /** @param {number} idx */
    (idx) => {
      onChange(value.filter((it, jx) => idx!==jx))      
    }, [value, onChange]
  );

  return (
<div {...rest} >
  <div className='w-full flex flex-col justify-center 
                  items-center gap-5'>
    <GradientFillIcon 
        onClick={onAdd}
        Icon={BiMessageSquareAdd} 
        className='cursor-pointer text-6xl hover:scale-110 
                  transition-transform' /> 
    {
    value?.map(
      (it, ix) => 
        <Attr 
            val={it} 
            key={`${it.key}_${it.value}_${ix}`} 
            className='w-full'
            onDelete={() => onDelete(ix)}
            onChange={(val) => onChangeInternal(ix, val)} />
    )
    }
  </div>
</div>
  )
}

export default Attributes