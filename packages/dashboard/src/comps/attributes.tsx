import { useCallback, useState } from 'react'
import { Bling, BlingInput } from './common-ui'
import { MdClose } from 'react-icons/md'
import { BiMessageSquareAdd } from 'react-icons/bi'
import { GradientFillIcon } from './common-button'
import { FieldLeafViewParams } from './fields-view'
import { AttributeType } from '@storecraft/core/api'

export type AttributeParams = {
  attribute: AttributeType;
  onChange: (attribute: AttributeType) => void;
  onDelete: () => void;
} & FieldLeafViewParams<AttributeType[]> & React.ComponentProps<'div'>;

const Attribute = (
  { 
    attribute, onChange, onDelete, className 
  }: AttributeParams
) => {

  const onChangeInternal = useCallback(
    (key: string, e: React.ChangeEvent<HTMLInputElement>) => {

      const newAtt = { 
        ...attribute, 
        [key]: e.currentTarget.value 
      };

      onChange(newAtt);

    }, [onChange, attribute]
  );

  return (
    
<Bling 
    className={`shadow-md shadow-slate-300 dark:shadow-slate-800 ${className}`} 
    rounded='rounded-lg'>
  <div className='w-full relative rounded-lg
                  shelf-bling-fill
                  p-3 border 
                  dark:border-slate-600'>

    <p children='Key' className=''/>
    <BlingInput 
      className='mt-1' 
      stroke='border-b'
      onChange={e => onChangeInternal('key', e)}
      value={attribute.key}
      placeholder='attribute key' 
      type='text' />

    <p children='Value' className='mt-3'/>
    <BlingInput 
      className='mt-1' stroke='border-b'
      onChange={e => onChangeInternal('value', e)}
      value={attribute.value}
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
 *  import('@storecraft/core/api').AttributeType[]> & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } AttributesParams
 * 
 * @param {AttributesParams} params
 */
const Attributes = (
  {
    field, value=[], onChange, setError, ...rest
  }
) => {
  
  const [atts, setAtts] = useState(value);

  const onAdd = useCallback(
    () => {
      const newAtts = [...atts, { key: '', value: '' }];

      setAtts(newAtts);
      onChange(newAtts);
      
    }, [atts, onChange]
  );

  // console.log(value)

  const onChangeInternal = useCallback(
    /**
     * 
     * @param {number} idx 
     * @param {import('@storecraft/core/api').AttributeType} val 
     */
    (idx, val) => {
      const newAtts = [...atts];

      newAtts[idx] = val;

      setAtts(newAtts);
      onChange(newAtts);
    }, [atts, onChange]
  );

  const onDelete = useCallback(
    /** @param {number} idx */
    (idx) => {
      const newAtts = atts.filter((it, jx) => idx!==jx);

      setAtts(newAtts);
      onChange(newAtts);
    }, [atts, onChange]
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
    atts?.map(
      (it, ix) => 
        <Attribute 
            key={ix} 
            attribute={it} 
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