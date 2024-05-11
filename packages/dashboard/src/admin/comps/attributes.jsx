import { useCallback, useState } from 'react'
import { Bling, BlingInput } from './common-ui.jsx'
import { MdClose } from 'react-icons/md/index.js'
import { BiMessageSquareAdd } from 'react-icons/bi/index.js'
import { GradientFillIcon } from './common-button.jsx'

/**
 * 
 * @typedef {object} InnerAttrParams
 * @prop {import('@storecraft/core/v-api').AttributeType} attribute
 * @prop {(attribute: import('@storecraft/core/v-api').AttributeType) => void} onChange
 * @prop {() => void} onDelete
 * 
 * 
 * @param {InnerAttrParams &
 *  Omit<
 *    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 
 *    'onChange'
 *  >
 * } params
 * 
 */
const Attribute = (
  { 
    attribute, onChange, onDelete, className 
  }
) => {

  const onChangeInternal = useCallback(
    /**
     * @param {string} key 
     * @param {React.ChangeEvent<HTMLInputElement>} e 
     */
    (key, e) => {

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
  
  const [atts, setAtts] = useState(value);

  const onAdd = useCallback(
    () => {
      const newAtts = [...atts, { key: '', value: '' }];

      setAtts(newAtts);
      onChange(newAtts);
      
    }, [atts, onChange]
  );

  console.log(value)

  const onChangeInternal = useCallback(
    /**
     * 
     * @param {number} idx 
     * @param {import('@storecraft/core/v-api').AttributeType} val 
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