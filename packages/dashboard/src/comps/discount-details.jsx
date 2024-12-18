import { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  DiscountMetaEnum, FilterMetaEnum
// @ts-ignore
} from '@storecraft/core/api/types.api.enums.js'
import { BlingInput, HR } from './common-ui.jsx'
import ShowIf from './show-if.jsx'
import DiscountFilters from './discount-filters.jsx'
import { TbMath } from 'react-icons/tb/index.js'

export const discount_details_validator = v => {
  if(v===undefined)
    return [false, 'You have to choose a Discount']
  return [true, undefined]
}

export const discount_types = [
  { 
    id: 0, type: 'regular',          
    name : 'Regular Discount', 
    desc: 'All Filtered products you defined will get the same discount. \
    For Example: Every shirt will have 10% discount' 
  },
  { 
    id: 1, type: 'bulk', name : 'Bulk Discount', 
    desc: 'Set an exact bulk discount on filtered products. \
    for Example, 3 for 100$, 5 for 5% off' 
  },
  { 
    id: 2, type: 'buy_x_get_y', name : 'Buy X Get Y',
    desc: 'Buy some from the filtered products and get Y for discount. \
    For Example: Buy 3 pants, get a Shirt for 50% off' 
  },
  { 
    id: 3, type: 'order', name : 'Order Discount',
    desc: 'Offer a discount on the total order including perks \
    such as Free Shipping' 
  },
  { 
    id: 4, type: 'bundle', name : 'Bundle Discount',
    desc: 'Offer a discount on a bundle of products. For Example, \
    buy a Laptop + Headset at discount 💲' 
  },
]

/**
 * 
 * @typedef {object} DiscountTypesParams
 * @prop {import('@storecraft/core/api').DiscountDetails["meta"]} selectedType
 * @prop {(meta: import('@storecraft/core/api').DiscountDetails["meta"]) => void} onChange
 * 
 * @param {DiscountTypesParams} params
 */
const DiscountTypes = (
  { 
    selectedType, onChange 
  }
) => {
  
  
  const desc = useMemo(
    () => discount_types.find(
      it => it.id === selectedType?.id
    )?.desc
    , [selectedType, discount_types]
  );

  /**
   * 
   * @param {object} params
   * @param {DiscountMetaEnum[keyof DiscountMetaEnum]} params.type
   */
  const Option = ({ type }) => {
    return (
      <div className=''>
        <input type='radio' id={type.type} 
               name='discount_type' 
               value={type.type} 
               className='accent-pink-500'
               checked={type.type===selectedType?.type} 
               // @ts-ignore
               onChange={e => onChange(type)} />
        <label htmlFor={type.type} children={type.name} 
               // @ts-ignore
               onClick={e => onChange(type)}
               className='mx-3' />
      </div>      
    )
  }

  return (
<div className='flex flex-row flex-wrap gap-5 --items-start'>
  <div className='flex flex-col gap-2 --flex-shrink-0 w-fit'>
  {
    Object.values(DiscountMetaEnum).filter(it => it.type).map(
      // @ts-ignore
      (it, ix) => (
        <Option type={it} key={it.type} />
      )
    )
  }
  </div>
  <div className='pl-5 border-l-2 shelf-border-color flex-1 min-w-[13rem]'>
    <p children={desc} 
       className='text-gray-500 text-sm tracking-wide'/>
  </div>
</div>
  )
}


/**
 * 
 * @param {string} prefix 
 * @param {number} percent 
 * @param {number} fixed 
 */
const explain_price = (prefix, percent, fixed) => {
  percent = Number.isNaN(percent) ? 0 : percent;
  fixed = Number.isNaN(fixed) ? 0 : fixed;

  const factor = (100 - percent)/100;
  const fixed_str = (Number.isNaN(fixed)) ? '' : 
    Math.abs(fixed)!=0 ? `${fixed < 0 ? ' - ' : ' + '} ${Math.abs(fixed)}`: '';

  let ff = (100 - percent)/100;

  // @ts-ignore
  ff = (typeof factor === 'number' && !Number.isNaN(factor)) ? factor : `(100 - Percents)/100`

  if(ff==0) {
    return Number.isNaN(fixed) ? 0 : fixed
  } else if (ff==1) {
    return prefix + fixed_str
  } else {
    return prefix + ' * ' + ff + fixed_str
  }
}

/**
 * 
 * @typedef {object} BulkDiscountParams
 * @prop {'bulk'} type
 * @prop {import('@storecraft/core/api').BulkDiscountExtra} value
 * @prop {(extra: 
 *  import('@storecraft/core/api').BulkDiscountExtra) => void
 * } onChange
 * 
 * 
 * @param {BulkDiscountParams} params
 */
// @ts-ignore
const BulkDiscount = ({ type, value, onChange }) => {

  const [v, setV] = useState(value)
  
  // run this effect once to sync for default values
  // useEffect(() => { onChange(v) }, [])

  const onChangeInternal = useCallback(
    /**
     * @param {string} who 
     * @param {any} val 
     */
    (who, val) => {
      // console.log('val ', val);
      const vvv = { ...v, [who] : val }
      setV(vvv)
      onChange(vvv)
    },
    [v, onChange]
  )

  return (
<div className='shelf-text-title-color'>
  <p children='Quantity Discount' 
     className='text-lg font-bold '/>
  <div className='w-full mt-3 flex flex-row gap-3 items-end 
                  flex-wrap text-base '>
    <p>
      <Dashed>Customer</Dashed> buys a <Dashed>Quantity</Dashed> of
    </p>
    <BlingInput
        type='number' min='1' step='1'
        // @ts-ignore
        onWheel={(e) => e.target.blur()}
        value={v.qty}
        onChange={
          e => onChangeInternal(
            'qty', 
            Math.max(parseInt(e.currentTarget.value), 1)
            )
          }
        inputClsName='h-7'
        stroke='border-b'
        className='rounded-md w-14'/>
    <p>
      <Dashed>products</Dashed> specified by the filters <b>ABOVE ⬆️</b> 
    </p>

  </div>

  <p children={`How to discount a bulk of ${v.qty} items` }
     className='text-lg font-bold  mt-6'/>
  <div className='w-full mt-5 flex flex-row flex-wrap gap-3 items-center '>
    <label children='Percents off' />
    <BlingInput
        type='number' min='0' max='100' step='1' 
        // @ts-ignore
        onWheel={(e) => e.target.blur()}
        value={v.percent}
        onChange={
        e => onChangeInternal(
          'percent', 
          Math.min(parseFloat(e.currentTarget.value),100)
          )
        }
        inputClsName='h-7'
        className='rounded-lg w-16'/>

    <span children='+' className='text-2xl font-bold' />
    <div className='flex flex-row items-center gap-3'>
      <label children='Fixed Price' />
      <BlingInput
          type='number' 
          value={v.fixed}
          // @ts-ignore
          onWheel={(e) => e.target.blur()}
          onChange={
            e => onChangeInternal(
              'fixed', 
              parseFloat(e.currentTarget.value)
            )
          }
          inputClsName='h-7'
          className='rounded-lg w-16'/>

    </div>
  </div>
  <p children={`* Fixed Price may be negative.`} 
     className='text-sm  mt-5 tracking-wider'/>

  <p children='Other Options' 
     className='text-lg font-bold mt-6'/>
  <div className='flex flex-row gap-3 items-center mt-5'>
    <input id='cb_recursive' type='checkbox' 
           checked={v.recursive===true}
           // @ts-ignore
           onChange={e => onChangeInternal('recursive', !v.recursive)}
           className='w-4 h-4 accent-pink-500 border-0 rounded-md 
                      focus:ring-0' />
    <label htmlFor='cb_recursive' children='Recursive' />
    <span children='(Apply the discount as much as possible)' 
          className=' text-sm' />
  </div>

  <ExplainPrice prefix={`total price of ${Number.isNaN(v?.qty) ? 1 : v.qty}`}
        percent={v?.percent} fixed={v?.fixed} />

</div>    
  )
}

/**
 * 
 * @param {import('@storecraft/core/api').Filter} f 
 */
const explain_filter = (f) => {
  switch (f.meta.op) {
    case FilterMetaEnum.p_all.op:
      return (
        <>
        <b>any</b> product
        </>
      );
    case FilterMetaEnum.p_in_collections.op:
      {
        const cast = (/** @type {import('@storecraft/core/api').FilterValue_p_in_collections} */(f.value ?? []));
  
        return (
        <>
          a product, that belongs to any of the following <b>collections</b>:
          <ol className='list-disc list-inside'>
          { 
            cast.map(
              (c, ix) => <li 
                key={ix}
                children={c.title} 
                className='font-semibold shelf-text-label-color-second' 
                /> 
            )
          }
          </ol>
        </>
        )
      }
    case FilterMetaEnum.p_not_in_collections.op:
      {
        const cast = (/** @type {import('@storecraft/core/api').FilterValue_p_not_in_collections} */(f.value ?? []));

        return (
          <>
          a product, that <span className='underline'>does not</span>&nbsp; 
          belong to the following <b>collections</b>:
          <ol className='list-disc list-inside'>
          { 
            cast.map(
              (c, ix) => <li children={c.title} key={ix}
                       className='font-semibold shelf-text-label-color-second' /> 
            )
          }
          </ol>
          </>
        )
      }
    case FilterMetaEnum.p_in_tags.op:
      {
        const cast = (/** @type {import('@storecraft/core/api').FilterValue_p_in_tags} */(f.value ?? []));

        return (
        <>
          a product, that has any of the following <b>tags</b>:
          <ol className='list-disc list-inside'>
          { 
            cast.map(
              (c, ix) => <li children={c} key={ix}
                       className='font-semibold shelf-text-label-color-second' /> 
            )
          }
          </ol>
        </>
        )
      }
    case FilterMetaEnum.p_not_in_tags.op:
      {
        const cast = (/** @type {import('@storecraft/core/api').FilterValue_p_not_in_tags} */(f.value ?? []));
        
        return (
        <>
          a product, that has <span className='underline'>does not</span>&nbsp; 
          have any of the following <b>tags</b>:
          <ol className='list-disc list-inside'>
          { 
            cast.map(
              (c, ix) => <li children={c} key={ix}
                      className='font-semibold shelf-text-label-color-second' /> 
            )
          }
          </ol>
        </> 
        )
      }
    case FilterMetaEnum.p_in_products.op:
      {
        const cast = (/** @type {import('@storecraft/core/api').FilterValue_p_in_products} */ (f.value ?? []));

        return (
        <>
          a product, that is any of the <b>following</b>:
          <ol className='list-disc list-inside'>
          { 
            cast.map(
              (c, ix) => <li children={c.title} key={ix}
                    className='font-semibold shelf-text-label-color-second' /> 
            )
          }
          </ol>
        </>
        )
      }
    case FilterMetaEnum.p_not_in_products.op:
      {
        
        const cast = (/** @type {import('@storecraft/core/api').FilterValue_p_not_in_products} */ (f.value ?? []));

        return (
        <>
          a product, that is <span className='underline'>not</span> 
          any of the following <b>products</b>:
          <ol className='list-disc list-inside'>
          { 
            cast.map(
              (c, ix) => <li children={c.title} key={ix}
                  className='font-semibold shelf-text-label-color-second' /> 
            )
          }
          </ol>
        </>   
        )         
      }
    case FilterMetaEnum.p_in_price_range.op:
      {
        const cast = (/** @type {import('@storecraft/core/api').FilterValue_p_in_price_range} */(f.value));

        return (
        <>
          a product, that is <b>priced</b> between 
          <b children={` ${cast?.from ?? 0}`} className='shelf-text-label-color-second'/> to 
          <b className='shelf-text-label-color-second' children={` ${cast?.to ?? 'Infinity'}`}/>
        </>  
        ) 
      }
    default:
      return 'WHAT'         
  }
}

/**
 * 
 * @param {number} ix 
 */
const to_order = (ix) => {
  switch(ix) {
    case 1: return '1st'
    case 2: return '2nd'
    case 3: return '3rd'
    default: return `${ix}th`
  }
}

/**
 * 
 * @param {import('@storecraft/core/api').Filter} f
 */
const filter_legal = f => {
  return (f.meta.type==='product') 
}

/**
 * 
 * @typedef {object} BundleDiscountParams
 * @prop {'bundle'} meta
 * @prop {import('@storecraft/core/api').BundleDiscountExtra} value
 * @prop {import('./fields-view.jsx').FieldContextData} context
 * @prop {(extra: 
 *  import('@storecraft/core/api').BundleDiscountExtra) => void
 * } onChange
 * 
 * 
 * @param {BundleDiscountParams} params
 */
const BundleDiscount = (
  { 
    // @ts-ignore
    meta, value, context, onChange 
  }
) => {

  /** @type {import('./media.jsx').useStateInfer<import('@storecraft/core/api').Filter[]>} */
  const [filters, setFilters] = useState([]) 
  const [v, setV] = useState(value)
  
  // run this effect once to sync for default values
  // useEffect(() => { onChange(v) }, [])

  useEffect(
    () => {
      const set_filters = () => {
        /**@type {import('@storecraft/core/api').Filter[]} */
        const fs =  context?.query['info.filters']?.get() ?? [];

        setFilters(
          [...fs].filter(filter_legal)
        );
      }

      set_filters();

      return context?.pubsub?.add_sub(
        (event, value=[]) => {

          if(event==='info.filters')
            setFilters(value.filter(filter_legal))
        }
      );
    }, [context]
  );


  const onChangeInternal = useCallback(
    /**
     * 
     * @param {keyof import('@storecraft/core/api').BundleDiscountExtra} who 
     * @param {*} val 
     */
    (who, val) => {
      // console.log('val ', val);
      const vvv = { ...v, [who] : val }

      setV(vvv);
      onChange(vvv);
    },
    [v, onChange]
  )

  return (
<div className='shelf-text-title-color'>

  <p children='Bundle Breakdown' 
     className='text-lg font-bold '/>
  <div className='w-full mt-2 flex flex-col gap-3 --items-end 
                   text-base '>
    <ShowIf show={filters?.length}>
    {
      filters.map(
        (f, ix) => (
          <div key={ix}>
            <div >
              <Dashed children={to_order(ix+1)} 
                      className='text-lg shelf-text-label-color' /> 
              &nbsp;item in bundle is&nbsp;
              { 
                explain_filter(f) 
              }
            </div>         
            <HR/> 
          </div>          
        )
      )
    }
    </ShowIf>                    

    <ShowIf show={!filters?.length}>
      <p className='text-base mt-3'>
        Use the <Dashed>products</Dashed>  filters <b>ABOVE ⬆️</b>. <br/>
        Each <Dashed>filter</Dashed> is a bundle item
      </p>      
    </ShowIf>
  </div>

  <p children={`How to discount a Bundle` }
     className='text-lg font-bold  mt-6'/>
  <div className='w-full mt-5 flex flex-row flex-wrap gap-3 items-center '>
    <label children='Percents off' />
    <BlingInput
        type='number' min='0' max='100' step='1' 
        // @ts-ignore
        onWheel={(e) => e.target.blur()}
        value={v.percent}
        onChange={
        e => onChangeInternal(
          'percent', 
          Math.min(parseFloat(e.currentTarget.value), 100)
          )
        }
        inputClsName='h-7'
        // stroke='pb-px'
        className='rounded-lg w-16'/>

    <span children='+' className='text-2xl font-bold' />
    <div className='flex flex-row items-center gap-3'>
      <label children='Fixed Price' />
      <BlingInput
          type='number' 
          value={v.fixed}
          // @ts-ignore
          onWheel={(e) => e.target.blur()}
          onChange={
            e => onChangeInternal(
              'fixed', 
              parseFloat(e.currentTarget.value)
            )
          }
          inputClsName='h-7'
          // stroke='pb-px'
          className='rounded-lg w-16'/>

    </div>
  </div>
  <p children={`* Fixed Price may be negative. `} 
     className='text-sm  mt-5 tracking-wider'/>


  <p children='Other Options' 
     className='text-lg font-bold mt-6'/>
  <div className='flex flex-row gap-3 items-center mt-5'>
    <input 
        id='cb_recursive' type='checkbox' 
        checked={v.recursive===true}
        // @ts-ignore
        onChange={e => onChangeInternal('recursive', !v.recursive)}
        className='w-4 h-4 accent-pink-500 border-0 rounded-md 
                  focus:ring-0' />
    <label htmlFor='cb_recursive' children='Recursive' />
    <span children='(Apply the discount as much as possible)' 
          className=' text-sm' />
  </div>
       
  <ExplainPrice 
      prefix='Bundle Price' 
      percent={v?.percent} 
      fixed={v?.fixed} />
</div>    
  )
}


/**
 * 
 * @typedef {object} ExplainPriceParams
 * @prop {string} prefix
 * @prop {number} percent
 * @prop {number} fixed
 * 
 * 
 * @param {ExplainPriceParams} params
 */
const ExplainPrice = (
  { 
    prefix, percent, fixed 
  }
) => {

  const explain = explain_price(`(${prefix})`, percent, fixed)
  const percent2 = (Number.isNaN(percent) || percent==0) ? 'Percents' : `${percent}%`

  return (
<>
  <p className='text-lg font-bold mt-6 flex flex-row items-center gap-2' >
    <TbMath />
    <span children='Pricing Explanation'/>
  </p>
  <p children={`(${prefix}) * (100% - ${percent2}) + Fixed = `}
    className='text-base  mt-5 font-mono tracking-wide font-semibold' />
  <p children={explain}
    className='text-base font-mono tracking-wide font-semibold '/>
</>
  )
}



/**
 * 
 * @typedef {object} RegularDiscountParams
 * @prop {'regular'} type
 * @prop {import('@storecraft/core/api').RegularDiscountExtra} value
 * @prop {(extra: import('@storecraft/core/api').RegularDiscountExtra) => void} onChange
 * 
 * 
 * @param {RegularDiscountParams} props
 * 
 */
const RegularDiscount = ( 
  { 
    // @ts-ignore
    type, value, onChange 
  } 
) => {

  const [v, setV] = useState(value)

  // run this effect once to sync for default values
  // useEffect(() => { onChange(v) }, [])

  const onChangeInternal = useCallback(
    /**
     * @param {keyof import('@storecraft/core/api').RegularDiscountExtra} who 
     * @param {any} val 
     */
    (who, val) => {
      const vvv = { ...v, [who] : parseFloat(val) }

      setV(vvv);
      onChange(vvv);
    },
    [v, onChange]
  );


  return (
<div className='shelf-text-title-color'>
  <p children='Eligible Products' 
     className='text-lg font-bold'/>
  <p className='text-base mt-3'>
    <Dashed>products</Dashed> specified by the <b>product</b> filters <b>ABOVE ⬆️</b> 
  </p>

  <p children='How to discount each item' 
     className='text-lg font-bold mt-5'/>
  <div className='w-full mt-5 flex flex-row flex-wrap 
                  gap-3 items-center '>
    <label children='Percents off' />
    <BlingInput
        type='number' 
        // @ts-ignore
        onWheel={(e) => e.target.blur()}
        onChange={
          e => onChangeInternal(
            'percent', 
            Math.min(parseFloat(e.currentTarget.value),100)
          )
        }
        value={v.percent} 
        min='0' max='100' step='1' 
        inputClsName='h-7'
        className='rounded-lg w-14' />

    <span children='+' className='text-2xl font-bold' />
    <div className='flex flex-row items-center gap-3'>
      <label children='Fixed Price' />
      <BlingInput 
          type='number' 
          // @ts-ignore
          onWheel={(e) => e.target.blur()}
          onChange={
            e => onChangeInternal(
              'fixed', 
              parseFloat(e.currentTarget.value)
            )
          }
          value={v?.fixed} 
          inputClsName='h-7'
          className='rounded-lg w-14' />

    </div>
  </div>
  <p children='* Fixed Price may be negative' 
     className='text-sm mt-5 tracking-wider'/>

  <ExplainPrice prefix='Product Price' 
        percent={v?.percent} fixed={v?.fixed} />

</div>    
  )
}


/**
 * 
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>} params
 */
const Dashed = ({ className='', ...rest }) => {
  return (
<span className={`font-semibold border-b-2 
          shelf-border-color border-dashed ${className}`}
      {...rest}  />
  )
}


/**
 * 
 * @typedef {object} BuyXGetYDiscountParams
 * @prop {'buy_x_get_y'} type
 * @prop {import('@storecraft/core/api').BuyXGetYDiscountExtra} value
 * @prop {(extra: import('@storecraft/core/api').BuyXGetYDiscountExtra) => void} onChange
 * @prop {import('../pages/discount.jsx').Context} context
 * 
 * 
 * @param {BuyXGetYDiscountParams} props
 */
const BuyXGetYDiscount = (
  { 
    // @ts-ignore
    type, value, onChange, context
  }
) => {

  const [v, setV] = useState(value)
  
  // run this effect once to sync for default values
  // useEffect(() => { onChange(v) }, [])

  const onChangeInternal = useCallback(
    /**
     * @param {keyof import('@storecraft/core/api').BuyXGetYDiscountExtra} who 
     * @param {any} val 
     */
    (who, val) => {
      // console.log('val ', val);
      const vvv = { ...v, [who] : val }

      setV(vvv);
      onChange && onChange(vvv);
    },
    [v, onChange]
  );

  return (
<div className='shelf-text-title-color'>
  <p children='Customer Buys X' 
     className='text-lg font-bold '/>
  <div className='w-full mt-1 flex flex-row flex-wrap gap-3 items-end text-base
                   '>
    <p>
      <Dashed>Customer</Dashed> buys a <Dashed>Quantity</Dashed> of
    </p>
    <BlingInput
        type='number' 
        min='1' step='1'
        // @ts-ignore
        onWheel={(e) => e.target.blur()}
        value={v.qty_x}
        onChange={
          e => onChangeInternal(
            'qty_x', 
            Math.max(parseInt(e.currentTarget.value), 1)
          )
        }
        inputClsName='h-7'
        stroke='border-b'
        className='rounded-lg w-14 inline-block'/>
    <p>
      <Dashed>products</Dashed> specified by the filters <b>ABOVE ⬆️</b> 
    </p>

  </div>

  <p children='Customer Gets Y' 
     className='text-lg font-bold mt-5 '/>
  <div className='w-full mt-1 flex flex-row gap-3 items-end 
                  flex-wrap text-base'>
    <p>
      <Dashed>Customer</Dashed> gets a <Dashed>Quantity</Dashed> of
    </p>
    <BlingInput
        inputClsName='h-7 rounded-md'
        type='number' min='1' step='1'
        // @ts-ignore
        onWheel={(e) => e.target.blur()}
        value={v.qty_y}
        onChange={
          e => onChangeInternal(
            'qty_y', 
            Math.max(parseInt(e.currentTarget.value), 1)
          )
        }
        stroke='border-b'
        className='w-14'/>
    <p>
      <Dashed>products</Dashed> specified by the filters <b>BELOW ⬇️</b> 
    </p>

  </div>

  <DiscountFilters 
      types={['product']} 
      context={context}
      value={v.filters_y}
      onChange={fs => onChangeInternal('filters_y', fs)} />

  <p children={`How to discount the ${v.qty_y} items` }
     className='text-lg font-bold  mt-6'/>
  <div className='w-full mt-5 flex flex-row flex-wrap gap-3 items-center '>
    <label children='Percents off' />
    <BlingInput
        type='number' min='0' max='100' step='1' 
        // @ts-ignore
        onWheel={(e) => e.target.blur()}
        value={v.percent}
        onChange={
        e => onChangeInternal(
          'percent', 
          Math.min(parseFloat(e.currentTarget.value),100)
          )
        }
        inputClsName='h-7'
        className='rounded-lg w-16'/>

    <span children='+' className='text-2xl font-bold' />
    <div className='flex flex-row items-center gap-3'>
      <label children='Fixed Price' />
      <BlingInput
          type='number' 
          value={v.fixed}
          // @ts-ignore
          onWheel={(e) => e.target.blur()}
          onChange={
            e => onChangeInternal(
              'fixed', 
              parseFloat(e.currentTarget.value)
            )
          }
          inputClsName='h-7'
          className='rounded-lg w-16'/>

    </div>
  </div>
  <p children={`* Fixed Price may be negative.`} 
     className='text-sm  mt-5 tracking-wider'/>

  <p children='Other Options' 
     className='text-lg font-bold mt-6'/>
  <div className='flex flex-row gap-3 items-center mt-5'>
    <input id='cb_recursive' type='checkbox' 
           checked={v.recursive===true}
           // @ts-ignore
           onChange={e => onChangeInternal('recursive', !v.recursive)}
           className='w-4 h-4 accent-pink-500 border-0 rounded-md 
                      focus:ring-0' />
    <label htmlFor='cb_recursive' children='Recursive' />
    <span children='(Apply the discount as much as possible)' 
          className=' text-sm' />
  </div>

  <ExplainPrice 
      prefix={`total price of ${Number.isNaN(v?.qty_y) ? 1 : v.qty_y}`}
      percent={v?.percent} 
      fixed={v?.fixed} />

</div>    
  )
}

/**
 * 
 * @typedef {object} OrderDiscountParams
 * @prop {'order'} type
 * @prop {import('@storecraft/core/api').OrderDiscountExtra} value
 * @prop {(extra: import('@storecraft/core/api').OrderDiscountExtra) => void} onChange
 * 
 * 
 * @param {OrderDiscountParams} props
 */
const OrderDiscount = ( 
  { 
    // @ts-ignore
    type, value, onChange 
  } 
) => {

  const [v, setV] = useState(value)

  // run this effect once to sync for default values
  // useEffect(() => { onChange(v) }, [])

  const onChangeInternal = useCallback(
    /**
     * @param {keyof typeof value} who 
     * @param {any} val 
     */
    (who, val) => {
      const vvv = { ...v, [who] : val }

      setV(vvv);
      onChange(vvv);
    },
    [v, onChange]
  );

  return (
<div className='shelf-text-title-color'>
  <p children='Eligible Orders' 
     className='text-lg font-bold'/>
  <p className='text-base mt-3'>
    <Dashed>Orders</Dashed> specified by the <b>order</b> filters <b>ABOVE ⬆️</b> 
  </p>
  
  <p children='How to discount Total Price' 
     className='text-lg font-bold mt-5'/>
  <div className='w-full mt-5 flex flex-row flex-wrap gap-3 items-center 
                '>
    <label children='Percents off' />
    <BlingInput
          type='number' 
          // @ts-ignore
          onWheel={(e) => e.target.blur()}
          onChange={
            e => onChangeInternal(
              'percent', 
              Math.min(parseFloat(e.currentTarget.value),100)
            )
          }
          value={v.percent} 
          min='0' max='100' step='1' 
          inputClsName='h-7'
          className='rounded-lg w-14' />
          
    <span children='+' className='text-2xl font-bold' />
    <div className='flex flex-row items-center gap-3'>
      <label children='Fixed Price' />
      <BlingInput 
          min='-10000'
          type='number' 
          // @ts-ignore
          onWheel={(e) => e.target.blur()}
          onChange={
            e => onChangeInternal(
              'fixed', 
              parseFloat(e.currentTarget.value)
            )
          }
          inputClsName='h-7'
          value={v.fixed} 
          className='rounded-lg w-14'/>
    
    </div>
  </div>
  <p children='More Options' 
     className='text-lg font-bold mt-5'/>
  <div className='flex flex-row gap-3 items-center mt-5'>
    <input 
        id='cb' type='checkbox' 
        checked={v.free_shipping==true}
        onChange={
          // @ts-ignore
          e => onChangeInternal(
            'free_shipping', 
            !v.free_shipping
          )
        }
        className='w-4 h-4 accent-pink-500 border-0 rounded-md 
                      focus:ring-0' />
    <label htmlFor='cb' children='Free Shipping' />
  </div>

  <p children='* Fixed Price may be negative.' 
     className='text-sm mt-5 tracking-wider'/>

  <ExplainPrice 
      prefix={`Order Total`}
      percent={v?.percent} 
      fixed={v?.fixed} />

</div>    
  )
}



const discount_types_comps = [
  { 
    type: 'regular', 
    Comp: RegularDiscount, CompParams : {} 
  },
  { 
    type: 'bulk', 
    Comp: BulkDiscount, CompParams : {} 
  },
  { 
    type: 'buy_x_get_y', 
    Comp: BuyXGetYDiscount, 
    CompParams : {} 
  },
  { 
    type: 'order', 
    Comp: OrderDiscount, CompParams : {} 
  },
  { 
    type: 'bundle', 
    Comp: BundleDiscount, CompParams : {} 
  },
]



/**
 * 
 * @typedef {object} Type2CompParams
 * @prop {import('@storecraft/core/api').DiscountDetails["meta"]} meta
 * @prop {Parameters<DiscountDetailsView>["0"]["context"]} context
 * @prop {(extra: import('@storecraft/core/api').DiscountDetails["extra"]) => void} onChange
 * @prop {import('@storecraft/core/api').DiscountDetails["extra"]} value
 * 
 * 
 * @param {Type2CompParams} params 
 * 
 */
const Type2Comp = (
  { 
    meta, context, onChange, value, ...rest 
  }
) => {
  
  const record = discount_types_comps.find(
    it => it.type===meta?.type
  )

  if (!record)
    return (<></>)
  const { Comp, CompParams } = record;

  return (
    <Comp 
        {...CompParams} 
        // @ts-ignore
        onChange={onChange} 
        // @ts-ignore
        value={value} 
        // @ts-ignore
        meta={meta} 
        // @ts-ignore
        type={meta.type} 
        // @ts-ignore
        context={context} 
        {...rest} />
  );
}

/**
 * @param {import('@storecraft/core/api').DiscountDetails["meta"]} m 
 */
const getDefaultExtraByMeta = m => {
  switch(m.id) {
    case DiscountMetaEnum.regular.id:
      return { 
        percent: 0.0, fixed : 0.0 
      };
    case DiscountMetaEnum.bulk.id:
      return { 
        percent: 0.0, fixed : 0.0, 
        qty: 3,  recursive: false 
      };
    case DiscountMetaEnum.order.id:
      return { 
        percent: 0.0, fixed : 0.0, 
        free_shipping: false 
      };
    case DiscountMetaEnum.buy_x_get_y.id:
      return { 
        percent: 0.0, fixed : 0.0, 
        qty_x: 1, qty_y: 1,
        filters_y: [] 
      };    
    case DiscountMetaEnum.bundle.id:
      return { 
        percent: 0.0, fixed : 0.0 
      };
    default:
      return undefined;    
  }
}

/**
 * 
 * @param {import('./fields-view.jsx').FieldLeafViewParams<
 *  import('@storecraft/core/api').DiscountDetails,
 *  import('../pages/discount.jsx').Context,
 *  import('@storecraft/core/api').DiscountType
 * >
 * } params
 */
const DiscountDetailsView = (
  { 
    // @ts-ignore
    field, value, context, onChange, ...rest 
  }
) => {

  const [meta, setType] = useState(value?.meta)
  // @ts-ignore
  const [extra, setExtra] = useState(value?.extra)

  const notify = useCallback(
    /**
     * @param {import('@storecraft/core/api').DiscountDetails["meta"]} t 
     * @param {import('@storecraft/core/api').DiscountDetails["extra"]} e 
     */
    (t, e) => {
      setType(t);
      setExtra(e);
      onChange && onChange({
        meta : t,
        extra : e
      });
    }, [onChange]
  );

  const onTypeSelected = useCallback(
    /** @param {import('@storecraft/core/api').DiscountDetails["meta"]} t */
    (t) => {
      
      notify(t, getDefaultExtraByMeta(t))
    }, [notify]
  );

  const onExtraChange = useCallback(
    /**
     * @param {import('@storecraft/core/api').DiscountDetails["extra"]} e
     */
    (e) => {
      notify(meta, e)
    }, [meta, notify]
  );

  return (
<div className='w-full'>
  <DiscountTypes 
      onChange={onTypeSelected} 
      selectedType={meta} />
  <ShowIf show={meta}>
    <p children='' 
       className='border-b-g mt-5 h-0.5 mb-5 bg-gradient-to-r 
                from-pink-400 to-kf-300'/>
  </ShowIf>
  <Type2Comp 
      meta={meta} 
      context={context}
      onChange={onExtraChange} 
      value={value?.extra} />

</div>
  )
}

export default DiscountDetailsView;