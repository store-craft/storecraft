import { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  DiscountMetaEnum, FilterMetaEnum
} from '@storecraft/core/v-api/types.api.enums.js'
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
  { id: 0, type: 'regular',          
    name : 'Regular Discount', 
    desc: 'All Filtered products you defined will get the same discount. \
    For Example: Every shirt will have 10% discount' },
  { id: 1, type: 'bulk', name : 'Bulk Discount', 
    desc: 'Set an exact bulk discount on filtered products. \
    for Example, 3 for 100$, 5 for 5% off' },
  { id: 2, type: 'buy_x_get_y', name : 'Buy X Get Y',
    desc: 'Buy some from the filtered products and get Y for discount. \
    For Example: Buy 3 pants, get a Shirt for 50% off' },
  { id: 3, type: 'order', name : 'Order Discount',
    desc: 'Offer a discount on the total order including perks \
    such as Free Shipping' },
  { id: 4, type: 'bundle', name : 'Bundle Discount',
    desc: 'Offer a discount on a bundle of products. For Example, \
    buy a Laptop + Headset at discount 💲' },
]

/**
 * 
 * @param {object} param
 * @param {import('@storecraft/core/v-api').DiscountDetails["meta"]} param.selectedType
 * @param {(meta: 
 *  import('@storecraft/core/v-api').DiscountDetails["meta"]) => void
 * } param.onChange
 */
const DiscountTypes = ({ selectedType, onChange }) => {

  const desc = useMemo(
    () => discount_types.find(
      it => it.id === selectedType?.id
      )?.desc
    , [selectedType, discount_types]
  )

  const Option = ({ type }) => {
    return (
      <div className=''>
        <input type='radio' id={type.type} 
               name='discount_type' 
               value={type.type} 
               className='accent-pink-500'
               checked={type.type===selectedType?.type} 
               onChange={e => onChange(type)} />
        <label htmlFor={type.type} children={type.name} 
               className='mx-3' />
      </div>      
    )
  }

  return (
<div className='flex flex-row flex-wrap gap-5 --items-start'>
  <div className='flex flex-col gap-2 --flex-shrink-0 w-fit'>
  {
    Object.values(DiscountMetaEnum)
          .map(
            (it, ix) => (
              <Option type={it} key={ix} />
            )
          )
  }
  </div>
  <div className='pl-5 border-l-2 shelf-border-color --ml-5 flex-1 min-w-[13rem]'>
    <p children={desc} 
       className='text-gray-500 text-sm tracking-wide'/>
  </div>
</div>
  )
}

const explain_price = (prefix, percent, fixed) => {
  percent = Number.isNaN(percent) ? 0 : percent
  fixed = Number.isNaN(fixed) ? 0 : fixed
  const factor = (100 - percent)/100
  const fixed_str = (Number.isNaN(fixed)) ? '' : 
    Math.abs(fixed)!=0 ? `${fixed < 0 ? ' - ' : ' + '} ${Math.abs(fixed)}`: '';
  let ff = (100 - percent)/100;
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
 * @param {object} props
 * @param {'bulk'} props.type
 * @param {import('@storecraft/core/v-api').BulkDiscountExtra} props.value
 * @param {(extra: 
 *  import('@storecraft/core/v-api').BulkDiscountExtra) => void
 * } props.onChange
 */
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
        onWheel={(e) => e.target.blur()}
        value={v.qty}
        onChange={
          e => onChangeInternal(
            'qty', 
            Math.max(parseInt(e.currentTarget.value), 1)
            )
          }
        inputClsName='h-7'
        stroke='pb-px'
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
        onWheel={(e) => e.target.blur()}
        value={v.percent}
        onChange={
        e => onChangeInternal(
          'percent', 
          Math.min(parseFloat(e.currentTarget.value),100)
          )
        }
        inputClsName='h-7'
        className='rounded-md w-16'/>

    <span children='+' className='text-2xl font-bold' />
    <div className='flex flex-row items-center gap-3'>
      <label children='Fixed Price' />
      <BlingInput
          type='number' 
          value={v.fixed}
          onWheel={(e) => e.target.blur()}
          onChange={
            e => onChangeInternal(
              'fixed', 
              parseFloat(e.currentTarget.value)
            )
          }
          inputClsName='h-7'
          className='rounded-md w-16'/>

    </div>
  </div>
  <p children={`* Fixed Price may be negative.`} 
     className='text-sm  mt-5 tracking-wider'/>

  <p children='Other Options' 
     className='text-lg font-bold mt-6'/>
  <div className='flex flex-row gap-3 items-center mt-5'>
    <input id='cb_recursive' type='checkbox' 
           checked={v.recursive===true}
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
 * @param {import('@storecraft/core/v-api').Filter} f 
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
      return (
      <>
      a product, that belongs to any of the following <b>collections</b>:
      <ol className='list-disc list-inside'>
      { f.value?.map(
          c => <li 
            children={c} 
            className='font-semibold shelf-text-label-color-second' 
            /> 
        )
      }
      </ol>
      </>
      )
    case FilterMetaEnum.p_not_in_collections.op:
      return (
        <>
      a product, that <span className='underline'>does not</span> belong to the following <b>collections</b>:
      <ol className='list-disc list-inside'>
      { f.value?.map(c => <li children={c} className='font-semibold shelf-text-label-color-second' /> )}
      </ol>
      </>
      )
    case FilterMetaEnum.p_in_tags.op:
      return (
        <>
      a product, that has any of the following <b>tags</b>:
      <ol className='list-disc list-inside'>
      { f.value?.map(c => <li children={c} className='font-semibold shelf-text-label-color-second' /> )}
      </ol>
      </>
      )
    case FilterMetaEnum.p_not_in_tags.op:
      return (
        <>
      a product, that has <span className='underline'>does not</span> have any of the following <b>tags</b>:
      <ol className='list-disc list-inside'>
      { f.value?.map(c => <li children={c} className='font-semibold shelf-text-label-color-second' /> )}
      </ol>
      </> 
      )
    case FilterMetaEnum.p_in_handles.op:
      return (
        <>
      a product, that has any of the following <b>handles</b>:
      <ol className='list-disc list-inside'>
      { f.value?.map(c => <li children={c} className='font-semibold shelf-text-label-color-second' /> )}
      </ol>
      </>
      )
    case FilterMetaEnum.p_not_in_tags.op:
      return (
        <>
      a product, that has <span className='underline'>does not</span> have any of the following <b>handles</b>:
      <ol className='list-disc list-inside'>
      { f.value?.map(c => <li children={c} className='font-semibold shelf-text-label-color-second' /> )}
      </ol>
      </>   
      )         
    case FilterMetaEnum.p_in_price_range.op:
      return (
        <>
      a product, that is <b>priced</b> between <b children={f.value.from ?? 0} className='shelf-text-label-color-second'/> to <b className='shelf-text-label-color-second' children={f.value.to ?? 'Infinity'}/>
      </>  
      ) 
    default:
      return 'WHAT'         
  }
}

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
 * @param {import('@storecraft/core/v-api').Filter} f
 */
const filter_legal = f => {
  return (f.meta.type==='product') 
}

/**
 * @param {object} p
 * @param {'bundle'} p.meta
 * @param {import('@storecraft/core/v-api').BundleDiscountExtra} p.value
 * @param {import('./fields-view.jsx').FieldContextData} p.context
 * @param {(extra: 
 *  import('@storecraft/core/v-api').BundleDiscountExtra) => void
 * } p.onChange
 */
const BundleDiscount = ({ meta, value, context, onChange }) => {

  /**@type {[filters: import('@storecraft/core/v-api').Filter[], any]} */
  const [filters, setFilters] = useState([]) 
  const [v, setV] = useState(value)
  
  // run this effect once to sync for default values
  // useEffect(() => { onChange(v) }, [])

  useEffect(
    () => {
      const set_filters = () => {
        /**@type {import('@storecraft/core/v-api').Filter[]} */
        const fs =  context?.query['info.filters']?.get() ?? []
        setFilters([...fs].filter(filter_legal))
      }
      set_filters()
      return context?.pubsub?.add_sub(
        (event, value) => {
          if(event==='info.filters')
            setFilters(value.filter(filter_legal))
        }
      )
    }, [context]
  )


  const onChangeInternal = useCallback(
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
              { explain_filter(f) }
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
        className='rounded-md w-16'/>

    <span children='+' className='text-2xl font-bold' />
    <div className='flex flex-row items-center gap-3'>
      <label children='Fixed Price' />
      <BlingInput
          type='number' 
          value={v.fixed}
          onWheel={(e) => e.target.blur()}
          onChange={
            e => onChangeInternal(
              'fixed', 
              parseFloat(e.currentTarget.value)
            )
          }
          inputClsName='h-7'
          // stroke='pb-px'
          className='rounded-md w-16'/>

    </div>
  </div>
  <p children={`* Fixed Price may be negative. `} 
     className='text-sm  mt-5 tracking-wider'/>


  <p children='Other Options' 
     className='text-lg font-bold mt-6'/>
  <div className='flex flex-row gap-3 items-center mt-5'>
    <input id='cb_recursive' type='checkbox' 
           checked={v.recursive===true}
           onChange={e => onChangeInternal('recursive', !v.recursive)}
           className='w-4 h-4 accent-pink-500 border-0 rounded-md 
                      focus:ring-0' />
    <label htmlFor='cb_recursive' children='Recursive' />
    <span children='(Apply the discount as much as possible)' 
          className=' text-sm' />
  </div>
       
  <ExplainPrice prefix='Bundle Price' 
        percent={v?.percent} fixed={v?.fixed} />
</div>    
  )
}

/**
 * @param {object} param0 
 * @param {string} param0.prefix
 * @param {number} param0.percent
 * @param {number} param0.fixed
 */
const ExplainPrice = ({ prefix, percent, fixed }) => {
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
 * @param {object} props
 * @param {'regular'} props.type
 * @param {import('@storecraft/core/v-api').RegularDiscountExtra} props.value
 * @param {(extra: 
 *  import('@storecraft/core/v-api').RegularDiscountExtra) => void
 * } props.onChange
 */
const RegularDiscount = ( { type, value, onChange } ) => {

  const [v, setV] = useState(value)

  // run this effect once to sync for default values
  // useEffect(() => { onChange(v) }, [])

  const onChangeInternal = useCallback(
    /**
     * @param {string} who 
     * @param {any} val 
     */
    (who, val) => {
      const vvv = { ...v, [who] : parseFloat(val) }
      setV(vvv)
      onChange(vvv)
    },
    [v, onChange]
  )

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
          onWheel={(e) => e.target.blur()}
          onChange={
          e => onChangeInternal(
            'percent', 
            Math.min(parseFloat(e.currentTarget.value),100)
          )
        }
        value={v.percent} min='0' max='100' step='1' 
        inputClsName='h-7'
        className='rounded-md w-14' />

    <span children='+' className='text-2xl font-bold' />
    <div className='flex flex-row items-center gap-3'>
      <label children='Fixed Price' />
      <BlingInput 
          type='number' 
          onWheel={(e) => e.target.blur()}
          onChange={
            e => onChangeInternal(
              'fixed', 
              parseFloat(e.currentTarget.value)
            )
          }
          value={v?.fixed} 
          inputClsName='h-7'
          className='rounded-md w-14' />

    </div>
  </div>
  <p children='* Fixed Price may be negative' 
     className='text-sm mt-5 tracking-wider'/>

  <ExplainPrice prefix='Product Price' 
        percent={v?.percent} fixed={v?.fixed} />

</div>    
  )
}

const Dashed = ({ className='', ...rest }) => {
  return (
<span className={`font-semibold border-b-2 
          shelf-border-color border-dashed ${className}`}
      {...rest}  />
  )
}

/**
 * @param {object} props
 * @param {'buy_x_get_y'} props.type
 * @param {import('@storecraft/core/v-api').BuyXGetYDiscountExtra} props.value
 * @param {(extra: 
 *  import('@storecraft/core/v-api').BuyXGetYDiscountExtra) => void
 * } props.onChange
 */
const BuyXGetYDiscount = ({ type, value, onChange }) => {

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
      onChange && onChange(vvv)
    },
    [v, onChange]
  )

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
        type='number' min='1' step='1'
        onWheel={(e) => e.target.blur()}
        value={v.qty_x}
        onChange={
          e => onChangeInternal(
            'qty_x', 
            Math.max(parseInt(e.currentTarget.value), 1)
            )
          }
        inputClsName='h-7'
        stroke='pb-px'
        className='rounded-md w-14 inline-block'/>
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
        inputClsName='h-7'
        type='number' min='1' step='1'
        onWheel={(e) => e.target.blur()}
        value={v.qty_y}
        onChange={
          e => onChangeInternal(
            'qty_y', 
            Math.max(parseInt(e.currentTarget.value), 1)
            )
          }
        stroke='pb-px'
        rounded='rounded-md'
        className='w-14'/>
    <p>
      <Dashed>products</Dashed> specified by the filters <b>BELOW ⬇️</b> 
    </p>

  </div>

  <DiscountFilters types={['product']} value={v.filters_y}
          onChange={ fs => onChangeInternal('filters_y', fs)} />

  <p children={`How to discount the ${v.qty_y} items` }
     className='text-lg font-bold  mt-6'/>
  <div className='w-full mt-5 flex flex-row flex-wrap gap-3 items-center '>
    <label children='Percents off' />
    <BlingInput
        type='number' min='0' max='100' step='1' 
        onWheel={(e) => e.target.blur()}
        value={v.percent}
        onChange={
        e => onChangeInternal(
          'percent', 
          Math.min(parseFloat(e.currentTarget.value),100)
          )
        }
        inputClsName='h-7'
        className='rounded-md w-16'/>

    <span children='+' className='text-2xl font-bold' />
    <div className='flex flex-row items-center gap-3'>
      <label children='Fixed Price' />
      <BlingInput
          type='number' 
          value={v.fixed}
          onWheel={(e) => e.target.blur()}
          onChange={
            e => onChangeInternal(
              'fixed', 
              parseFloat(e.currentTarget.value)
            )
          }
          inputClsName='h-7'
          className='rounded-md w-16'/>

    </div>
  </div>
  <p children={`* Fixed Price may be negative.`} 
     className='text-sm  mt-5 tracking-wider'/>

  <p children='Other Options' 
     className='text-lg font-bold mt-6'/>
  <div className='flex flex-row gap-3 items-center mt-5'>
    <input id='cb_recursive' type='checkbox' 
           checked={v.recursive===true}
           onChange={e => onChangeInternal('recursive', !v.recursive)}
           className='w-4 h-4 accent-pink-500 border-0 rounded-md 
                      focus:ring-0' />
    <label htmlFor='cb_recursive' children='Recursive' />
    <span children='(Apply the discount as much as possible)' 
          className=' text-sm' />
  </div>

  <ExplainPrice prefix={`total price of ${Number.isNaN(v?.qty_y) ? 1 : v.qty_y}`}
        percent={v?.percent} fixed={v?.fixed} />

</div>    
  )
}

/**
 * @param {object} props
 * @param {'order'} props.type
 * @param {import('@storecraft/core/v-api').OrderDiscountExtra} props.value
 * @param {(extra: 
 *  import('@storecraft/core/v-api').OrderDiscountExtra) => void
 * } props.onChange
 */
const OrderDiscount = ( { type, value, onChange } ) => {

  const [v, setV] = useState(value)

  // run this effect once to sync for default values
  // useEffect(() => { onChange(v) }, [])

  const onChangeInternal = useCallback(
    /**
     * @param {string} who 
     * @param {any} val 
     */
    (who, val) => {
      const vvv = { ...v, [who] : val }
      setV(vvv)
      onChange(vvv)
    },
    [v, onChange]
  )

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
          onWheel={(e) => e.target.blur()}
          onChange={
          e => onChangeInternal(
            'percent', 
            Math.min(parseFloat(e.currentTarget.value),100)
            )
          }
          value={v.percent} min='0' max='100' step='1' 
          inputClsName='h-7'
          className='rounded-md w-14' />
          
    <span children='+' className='text-2xl font-bold' />
    <div className='flex flex-row items-center gap-3'>
      <label children='Fixed Price' />
      <BlingInput 
          min='-10000'
          type='number' 
          onWheel={(e) => e.target.blur()}
          onChange={
          e => onChangeInternal(
              'fixed', 
              parseFloat(e.currentTarget.value)
            )
          }
          inputClsName='h-7'
          value={v.fixed} className='rounded-md w-14'/>
    
    </div>
  </div>
  <p children='More Options' 
     className='text-lg font-bold mt-5'/>
  <div className='flex flex-row gap-3 items-center mt-5'>
    <input id='cb' type='checkbox' 
           checked={v.free_shipping==true}
           onChange={
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

  <ExplainPrice prefix={`Order Total`}
        percent={v?.percent} fixed={v?.fixed} />

</div>    
  )
}

/**
 * @typedef {object} CompParams
 * @prop {}
 */

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
 * @param {object} p 
 * @param {import('@storecraft/core/v-api').DiscountDetails["meta"]} p.meta
 * @param {import('./fields-view.jsx').FieldContextData} p.context
 * @param {(extra: 
 *  import('@storecraft/core/v-api').DiscountDetails["extra"]) => void
 * } p.onChange
 * @param {import('@storecraft/core/v-api').DiscountDetails["extra"]} p.value
 */
const Type2Comp = ({ meta, context, onChange, value, ...rest }) => {
  const record = discount_types_comps.find(
    it => it.type===meta?.type
  )

  if (!record)
    return (<></>)
  const { Comp, CompParams } = record
  return (
    <Comp {...CompParams} onChange={onChange} 
        value={value} meta={meta} type={meta.type} 
        context={context} {...rest} />
  );
}

/**
 * @param {import('@storecraft/core/v-api').DiscountDetails["meta"]} m 
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
 * @param {object} p
 * @param {import('./fields-view.jsx').FieldViewParams} p.field
 * @param {import('./fields-view.jsx').FieldContextData} p.context
 * @param {import('@storecraft/core/v-api').DiscountDetails} p.value
 * @param {(v: import('@storecraft/core/v-api').DiscountDetails) => void} p.onChange
 */
const DiscountDetailsView = ({ field, value, context, onChange, ...rest }) => {
  const [meta, setType] = useState(value?.meta)
  const [extra, setExtra] = useState(value?.extra)

  const notify = useCallback(
    /**
     * @param {import('@storecraft/core/v-api').DiscountDetails["meta"]} t 
     * @param {import('@storecraft/core/v-api').DiscountDetails["extra"]} e 
     */
    (t, e) => {
      setType(t);
      setExtra(e);
      onChange && onChange({
        meta : t,
        extra : e
      });
    }, [onChange]
  )

  const onTypeSelected = useCallback(
    /** @param {import('@storecraft/core/v-api').DiscountDetails["meta"]} t */
    (t) => {
      
      notify(t, getDefaultExtraByMeta(t))
    }, [notify]
  )

  const onExtraChange = useCallback(
    /**
     * @param {import('@storecraft/core/v-api').DiscountDetails["extra"]} e
     */
    (e) => {
      notify(meta, e)
    }, [meta, notify]
  )

  return (
<div className='w-full'>
  <DiscountTypes onChange={onTypeSelected} selectedType={meta} />
  <ShowIf show={meta}>
    <p children='' 
       className='border-b-g mt-5 h-0.5 mb-5 bg-gradient-to-r 
                from-pink-400 to-kf-300'/>
  </ShowIf>
  <Type2Comp meta={meta} context={context}
             onChange={onExtraChange} 
             value={value?.extra} />
</div>
  )
}

export default DiscountDetailsView