import { useCallback } from 'react'
import { Bling, BlingInput } from './common-ui.jsx'
import { MdClose } from 'react-icons/md/index.js'
import { BiMessageSquareAdd } from 'react-icons/bi/index.js'
import { GradientFillIcon } from './common-button.jsx'
import { FieldData } from './fields-view.jsx'
// import { AttributeData } from '@/admin/js-docs-types'

/**
 * @param {object} p
 * @param {import('@storecraft/core/v-api').AttributeType} p.val
 * @param {(attribute: import('@storecraft/core/v-api').AttributeType) => void} p.onChange
 * @param {() => void} p.onDelete
 */
const Attr = ({ val = {}, onChange, onDelete, className }) => {

  const onChangeInternal = useCallback(
    (key, e) => {
      onChange({ ...val, [key]: e.currentTarget.value })
    }, [onChange, val]
  )

  return (
    
<Bling className={`shadow-md shadow-slate-300  dark:shadow-slate-800
                  ${className}`} 
       stroke='p-px' rounded='rounded-lg'>
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
          value={val.val}
          placeholder='attribute value' 
          type='text' 
          />

    <MdClose className='absolute top-3 right-3 cursor-pointer text-lg' 
            onClick={onDelete} />

  </div>    
</Bling>    
  )
}

/**
 * 
 * @param {object} p
 * @param {FieldData} p.field
 * @param {AttributeData[]} p.value
 * @param {(attributes: AttributeData[]) => void} p.onChange
 */
const Attributes = 
  ({field, value=[], onChange, className, ...rest}) => {
  
  const onAdd = useCallback(
    () => {
      onChange([ { key: '', val: '', createdAt: Date.now() }, ...value])
    }, [value, onChange]
  )

  const onChangeInternal = useCallback(
    (idx, val) => {
      value[idx] = val
      onChange([ ...value ])
    }, [value, onChange]
  )

  const onDelete = useCallback(
    (idx) => {
      onChange(value.filter((it, jx) => idx!==jx))      
    }, [value, onChange]
  )

  return (
<div className={className} >
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
          <Attr val={it} key={`${it.createdAt}`} 
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