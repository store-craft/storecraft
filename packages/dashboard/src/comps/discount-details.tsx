import { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  DiscountMetaEnum,
  FilterMetaEnum,
  get_filter_op,
  is_product_filter
// @ts-ignore
} from '@storecraft/core/api/types.api.enums.js'
import { BlingInput, HR } from './common-ui'
import ShowIf from './show-if'
import DiscountFilters from './discount-filters'
import { TbMath } from 'react-icons/tb'
import { 
  BulkDiscountExtra, BundleDiscountExtra, 
  BuyXGetYDiscountExtra, DiscountDetails, 
  DiscountType, Filter, 
  Filter_p_in_collections, 
  Filter_p_in_price_range, 
  Filter_p_in_products, 
  Filter_p_in_tags, 
  Filter_p_not_in_collections, 
  Filter_p_not_in_products, 
  Filter_p_not_in_tags, 
  OrderDiscountExtra, RegularDiscountExtra 
} from '@storecraft/core/api'
import { FieldContextData, FieldLeafViewParams } from './fields-view'

export const discount_details_validator = v => {
  if(v===undefined)
    return [false, 'You have to choose a Discount']
  return [true, undefined]
}

/////

type DiscountMeta = typeof DiscountMetaEnum[keyof typeof DiscountMetaEnum];

export type DiscountTypesParams = {
  selectedMeta: DiscountMeta;
  onChange: (meta: DiscountMeta) => void;
};

export type BulkDiscountParams = {
  type: "bulk";
  value: BulkDiscountExtra;
  onChange: (extra: BulkDiscountExtra) => void;
};

export type BundleDiscountParams = {
  value: BundleDiscountExtra;
  context: FieldContextData;
  onChange: (extra: BundleDiscountExtra) => void;
};

export type ExplainPriceParams = {
  prefix: string;
  percent: number;
  fixed: number;
};

export type RegularDiscountParams = {
  type: "regular";
  value: RegularDiscountExtra;
  onChange: (extra: RegularDiscountExtra) => void;
};

export type BuyXGetYDiscountParams = {
  type: "buy_x_get_y";
  value: BuyXGetYDiscountExtra;
  onChange: (extra: BuyXGetYDiscountExtra) => void;
  context: import('../pages/discount.js').Context;
};

export type OrderDiscountParams = {
  type: "order";
  value: OrderDiscountExtra;
  onChange: (extra: OrderDiscountExtra) => void;
};

export type Type2CompParams = {
  meta: DiscountMeta;
  context: FieldContextData<DiscountType> //Parameters<({ field, value, context, onChange, ...rest }: import('./fields-view.js').FieldLeafViewParams<import('@storecraft/core/api').DiscountDetails, import('../pages/discount.js').Context, import('@storecraft/core/api').DiscountType>) => import("react").JSX.Element>["0"]["context"];
  onChange: (extra: DiscountDetails["extra"]) => void;
  value: DiscountDetails["extra"];
};

export type DiscountDetailsViewParams = FieldLeafViewParams<
  DiscountDetails, import('../pages/discount.js').Context, 
  DiscountType
>;


//////
/////

export const discount_types = [
  { 
    ...DiscountMetaEnum.regular,
    desc: 'All Filtered products you defined will get the same discount. \
    For Example: Every shirt will have 10% discount' 
  },
  { 
    ...DiscountMetaEnum.bulk,
    desc: 'Set an exact bulk discount on filtered products. \
    for Example, 3 for 100$, 5 for 5% off' 
  },
  { 
    ...DiscountMetaEnum.buy_x_get_y,
    desc: 'Buy some from the filtered products and get Y for discount. \
    For Example: Buy 3 pants, get a Shirt for 50% off' 
  },
  { 
    ...DiscountMetaEnum.order,
    desc: 'Offer a discount on the total order including perks \
    such as Free Shipping' 
  },
  { 
    ...DiscountMetaEnum.bundle,
    desc: 'Offer a discount on a bundle of products. For Example, \
    buy a Laptop + Headset at discount 💲' 
  },
]

const DiscountTypes = (
  { 
    selectedMeta, onChange 
  }: DiscountTypesParams
) => {
  
  const description = useMemo(
    () => discount_types.find(
      it => it.id === selectedMeta?.id
    )?.desc
    , [selectedMeta, discount_types]
  );

  const Option = (
    { 
      meta 
    }: { 
      meta: (typeof DiscountMetaEnum)[keyof typeof DiscountMetaEnum]
    }
  ) => {
    
    return (
      <div className=''>
        <input 
          type='radio' 
          id={meta.type} 
          name='discount_type' 
          value={meta.type} 
          className='accent-pink-500'
          checked={meta.type===selectedMeta?.type} 
          onChange={_ => onChange(meta)} 
        />
        <label 
          htmlFor={meta.type} 
          children={meta.name} 
          onClick={_ => onChange(meta)}
          className='mx-3' 
        />
      </div>      
    )
  }

  return (
<div className='flex flex-row flex-wrap gap-5 --items-start'>
  <div className='flex flex-col gap-2 --flex-shrink-0 w-fit'>
  {
    Object
    .values(DiscountMetaEnum)
    .filter(m => m.type)
    .map(
      (m, ix) => (
        <Option meta={m} key={m.type} />
      )
    )
  }
  </div>
  <div className='pl-5 border-l-2 shelf-border-color flex-1 min-w-[13rem]'>
    <p children={description} 
       className='text-gray-500 text-sm tracking-wide'/>
  </div>
</div>
  )
}

const explain_price = (prefix: string, percent: number, fixed: number) => {
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

const BulkDiscount = ({ type, value, onChange }: BulkDiscountParams) => {

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
      className='rounded-md w-14'
    />
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
      className='rounded-lg w-16'
    />

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
        className='rounded-lg w-16'
      />

    </div>
  </div>
  <p children={`* Fixed Price may be negative.`} 
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
                focus:ring-0' 
    />
    <label htmlFor='cb_recursive' children='Recursive' />
    <span children='(Apply the discount as much as possible)' 
          className=' text-sm' />
  </div>

  <ExplainPrice 
    prefix={`total price of ${Number.isNaN(v?.qty) ? 1 : v.qty}`}
    percent={v?.percent} 
    fixed={v?.fixed} />

</div>    
  )
}

const explain_filter = (f: Filter) => {
  switch (get_filter_op(f)) {
    case FilterMetaEnum.p_all.op:
      return (
        <>
        <b>any</b> product
        </>
      );
    case FilterMetaEnum.p_in_collections.op:
      {
        const cast = (f.value ?? []) as Filter_p_in_collections["value"];
  
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
        const cast = (f.value ?? []) as Filter_p_not_in_collections["value"];

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
        const cast = (f.value ?? []) as Filter_p_in_tags["value"];

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
        const cast = (f.value ?? []) as Filter_p_not_in_tags["value"];
        
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
        const cast = (f.value ?? []) as Filter_p_in_products["value"];

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
        
        const cast = (f.value ?? []) as Filter_p_not_in_products["value"];

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
        const cast = (f.value) as Filter_p_in_price_range["value"];

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

const to_order = (ix: number) => {
  switch(ix) {
    case 1: return '1st'
    case 2: return '2nd'
    case 3: return '3rd'
    default: return `${ix}th`
  }
}

const filter_legal = (f: Filter) => {
  return is_product_filter(f);
}


const BundleDiscount = (
  { 
    value, context, onChange 
  }: BundleDiscountParams
) => {

  const [filters, setFilters] = useState<Filter[]>([]) 
  const [v, setV] = useState(value)
  
  // run this effect once to sync for default values
  // useEffect(() => { onChange(v) }, [])

  useEffect(
    () => {
      const set_filters = () => {
        const fs: Filter[] =  context?.query['info.filters']?.get() ?? [];

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

    (who: keyof BundleDiscountExtra, val: any) => {
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
        className='rounded-lg w-16'
      />

    </div>
  </div>
  <p 
    children={`* Fixed Price may be negative. `} 
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
        focus:ring-0' 
    />
    <label htmlFor='cb_recursive' children='Recursive' />
    <span 
      children='(Apply the discount as much as possible)' 
      className=' text-sm' 
    />
  </div>
       
  <ExplainPrice 
      prefix='Bundle Price' 
      percent={v?.percent} 
      fixed={v?.fixed} />
</div>    
  )
}


const ExplainPrice = (
  { 
    prefix, percent, fixed 
  }: ExplainPriceParams
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


const RegularDiscount = ( 
  { 
    type, value, onChange 
  }: RegularDiscountParams
) => {

  const [v, setV] = useState(value)

  // run this effect once to sync for default values
  // useEffect(() => { onChange(v) }, [])

  const onChangeInternal = useCallback(
    (who: keyof RegularDiscountExtra, val: any) => {
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
      className='rounded-lg w-14' 
    />

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
        className='rounded-lg w-14' 
      />

    </div>
  </div>
  <p children='* Fixed Price may be negative' 
     className='text-sm mt-5 tracking-wider'/>

  <ExplainPrice 
    prefix='Product Price' 
    percent={v?.percent} 
    fixed={v?.fixed} 
  />

</div>    
  )
}


const Dashed = ({ className='', ...rest }: React.ComponentProps<'span'>) => {
  return (
    <span 
      className={
        `font-semibold border-b-2 
        shelf-border-color border-dashed ${className}`
      }
      {...rest}  
    />
  )
}


const BuyXGetYDiscount = (
  { 
    type, value, onChange, context
  }: BuyXGetYDiscountParams
) => {

  const [v, setV] = useState(value)
  
  // run this effect once to sync for default values
  // useEffect(() => { onChange(v) }, [])

  const onChangeInternal = useCallback(
    (who: keyof BuyXGetYDiscountExtra, val: any) => {
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
      className='rounded-lg w-14 inline-block'
    />
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
      className='w-14'
    />
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
      prefix={`total price of ${Number.isNaN(v?.qty_y) ? 1 : v.qty_y}`}
      percent={v?.percent} 
      fixed={v?.fixed} />

</div>    
  )
}


const OrderDiscount = ( 
  { 
    type, value, onChange 
  }: OrderDiscountParams
) => {

  const [v, setV] = useState(value)

  // run this effect once to sync for default values
  // useEffect(() => { onChange(v) }, [])

  const onChangeInternal = useCallback(
    (who: keyof typeof value, val: any) => {
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
      className='rounded-lg w-14'
    />
          
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
                    focus:ring-0' 
    />
    <label htmlFor='cb' children='Free Shipping' />
  </div>

  <p children='* Fixed Price may be negative.' 
     className='text-sm mt-5 tracking-wider'/>

  <ExplainPrice 
    prefix={`Order Total`}
    percent={v?.percent} 
    fixed={v?.fixed} 
  />

</div>    
  )
}



const discount_types_comps = [
  { 
    type: DiscountMetaEnum.regular.type, 
    Comp: RegularDiscount, CompParams : {} 
  },
  { 
    type: DiscountMetaEnum.bulk.type, 
    Comp: BulkDiscount, CompParams : {} 
  },
  { 
    type: DiscountMetaEnum.buy_x_get_y.type,
    Comp: BuyXGetYDiscount, 
    CompParams : {} 
  },
  { 
    type: DiscountMetaEnum.order.type, 
    Comp: OrderDiscount, CompParams : {} 
  },
  { 
    type: DiscountMetaEnum.bundle.type, 
    Comp: BundleDiscount, CompParams : {} 
  },
]


const Type2Comp = (
  { 
    meta, context, onChange, value, ...rest 
  }: Type2CompParams
) => {
  
  const record = discount_types_comps.find(
    it => it.type===meta?.type
  );

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
      {...rest} 
    />
  );
}

const getDefaultExtraByType = (type: DiscountDetails["type"]) => {
  switch(type) {
    case DiscountMetaEnum.regular.type:
      return { 
        percent: 0.0, fixed : 0.0 
      };
    case DiscountMetaEnum.bulk.type:
      return { 
        percent: 0.0, fixed : 0.0, 
        qty: 3,  recursive: false 
      };
    case DiscountMetaEnum.order.type:
      return { 
        percent: 0.0, fixed : 0.0, 
        free_shipping: false 
      };
    case DiscountMetaEnum.buy_x_get_y.type:
      return { 
        percent: 0.0, fixed : 0.0, 
        qty_x: 1, qty_y: 1,
        filters_y: [] 
      };    
    case DiscountMetaEnum.bundle.type:
      return { 
        percent: 0.0, fixed : 0.0 
      };
    default:
      return undefined;    
  }
}

const extract_meta_from_details = (details: DiscountDetails) => {
  // support for older and deprecated embedded meta details
  if(details?.meta)
    return details.meta;

  if(details?.type) {
    const meta = DiscountMetaEnum[details?.type]

    if(meta) {
      return meta;
    }
  }

  return undefined;

  throw new Error(
    `DiscountDetailsView: meta not found \
    for discount details ${details}`
  );
}

const DiscountDetailsView = (
  { 
    field, value, context, onChange, ...rest 
  }: DiscountDetailsViewParams
) => {

  const [meta, setMeta] = useState(extract_meta_from_details(value));
  const [extra, setExtra] = useState(value?.extra)

  const notify = useCallback(
    (m: DiscountMeta, e: DiscountDetails["extra"]) => {
      setMeta(m);
      setExtra(e);
      onChange && onChange({
        type: m.type as any,
        extra : e
      });
    }, [onChange]
  );

  const onTypeSelected = useCallback(
    (m: DiscountMeta) => {
      
      notify(m, getDefaultExtraByType(m.type))
    }, [notify]
  );

  const onExtraChange = useCallback(
    (e: DiscountDetails["extra"]) => {
      notify(meta, e)
    }, [meta, notify]
  );

  return (
<div className='w-full'>
  <DiscountTypes 
    onChange={onTypeSelected} 
    selectedMeta={meta} />
  <ShowIf show={meta}>
    <p 
      children='' 
      className='border-b-g mt-5 h-0.5 mb-5 bg-gradient-to-r 
      from-pink-400 to-kf-300'
    />
  </ShowIf>
  <Type2Comp 
    meta={meta} 
    context={context}
    onChange={onExtraChange} 
    value={value?.extra} 
  />

</div>
  )
}

export default DiscountDetailsView;