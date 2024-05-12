import { useState, useCallback, useRef } from 'react'
import ShowIf from './show-if.jsx'
import SelectResource from './select-resource.jsx'
import { Bling, BlingInput, HR } from './common-ui.jsx'
import CapsulesView from './capsules-view.jsx'
import { IoMdClose } from 'react-icons/io/index.js'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Overlay } from './overlay.jsx';
import { BrowseCustomers, BrowseProducts } from './resource-browse.jsx'
import { BlingButton } from './common-button.jsx'
import { FilterMetaEnum } from '@storecraft/core/v-api/types.api.enums.js'
import { SelectTags } from './tags-edit.jsx'
import { extract_contact_field } from '../pages/customers.jsx'
 
/**
 * 
 * @param {import('@storecraft/core/v-api').Filter["meta"][]} v 
 * @returns 
 */
export const discount_filters_validator = v => {
  const product_filters = v?.filter(it => it.type==='product') ?? []
  if(product_filters.length==0)
    return [false, 'You have to apply at least ONE Product Filter']
  return [true, undefined]
}

/**
 * 
 * @typedef {object} Filter_ProductInCollectionsParams
 * @prop {import('@storecraft/core/v-api').FilterValue_p_in_collections} value
 * @prop {(filter_value: 
 *  import('@storecraft/core/v-api').FilterValue_p_in_collections) => void
 * } onChange
 * 
 * 
 * @param {Filter_ProductInCollectionsParams} params
 */
const Filter_ProductInCollections = (
  { 
    onChange, value=[] 
  }
) => {

  const [tags, setTags] = useState(value);

  /**
   * @type {import('./select-resource.jsx').SelectResourceParams<
   *  import('@storecraft/core/v-api').CollectionType
   * >["onSelect"]
   * }
   */
  const onAdd = useCallback(
    (tag) => {
      if(tags.indexOf(tag)!=-1)
        return;
      
      const new_tags = [ ...tags, tag];

      onChange(new_tags);
      setTags(new_tags);
    },
    [tags, onChange]
  );
  
  const onRemove = useCallback(
    /**
     * @param {{id: string, handle: string}} v handle
     */
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

  return (
<div className='w-full'>
  <SelectResource 
      onSelect={onAdd} 
      resource='collections' 
      header='Select Collections' 
      clsReload='text-3xl text-kf-400' 
      name_fn={
        it => it.title ?? it.handle
      }
      layout={1}/>
  { 
    tags?.length>0 && 
    <HR className='w-full mt-5' />  
  }
  <CapsulesView 
      onClick={onRemove} 
      tags={tags} 
      className='mt-5' 
      name_fn={tag => tag?.title ?? tag.handle} />
</div>
  )
}

/**
 * 
 * @param {Parameters<Filter_ProductInCollections>["0"]} params
 */
const Filter_ProductNotInCollections = ( { ...rest } ) => {
  return (
    <Filter_ProductInCollections {...rest} />
  )
}

/**
 * 
 * @typedef {object} Filter_ProductHasTagsParams
 * @prop {import('@storecraft/core/v-api').FilterValue_p_in_tags} value
 * @prop {(filter_value: 
 *  import('@storecraft/core/v-api').FilterValue_p_in_tags) => void
 * } onChange
 * 
 * 
 * @param {Filter_ProductHasTagsParams} params
 * 
 */
const Filter_ProductHasTags = (
  { 
    onChange, value=[] 
  } 
) => {

  const [tags, setTags] = useState(value)

  /**
   * @type {Parameters<SelectTags>["0"]["onSelect"]}
   */
  const onAdd = useCallback(
    (tag) => {
      if(tags.indexOf(tag)!=-1)
        return;
      
      const new_tags = [ ...tags, tag];

      onChange(new_tags);
      setTags(new_tags);
    },
    [tags, onChange]
  )
  
  /**
   * @type {import('./capsules-view.jsx').CapsulesViewParams<string>["onRemove"]}
   */
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

  return (
<div className='w-full'>
  <SelectTags 
      onSelect={onAdd} 
      header='Select Tags' 
      clsReload='text-3xl text-kf-400' 
      layout={1}/>
  { 
    tags?.length>0 && 
    <HR className='w-full mt-5' />  
  }
  <CapsulesView 
      onRemove={onRemove}
      onClick={onRemove} 
      tags={tags} 
      className='mt-5' />
</div>
  )
}

/**
 * 
 * @typedef {object} Filter_ProductHasHandleParams
 * @prop {import('@storecraft/core/v-api').FilterValue_p_in_handles} value
 * @prop {(filter_value: 
 *  import('@storecraft/core/v-api').FilterValue_p_in_handles) => void
 * } onChange
 * 
 * 
 * @param {Filter_ProductHasHandleParams} params
 * 
 */
const Filter_ProductHasHandle = (
  { 
    onChange, value=[] 
  }
) => {
   
  /** @type {React.MutableRefObject<import('./overlay.jsx').ImpInterface>} */
  const ref_overlay = useRef();

  const [tags, setTags] = useState(value)

  /**
   * @type {import('./capsules-view.jsx').CapsulesViewParams<string>["onRemove"]}
   */
  const onRemove = useCallback(
    (v) => {
      const idx = tags.indexOf(v)

      if(idx == -1) return;

      tags.splice(idx, 1);

      const new_tags = [...tags];

      onChange(new_tags);
      setTags(new_tags);
    },
    [tags, onChange]
  );

  /**
   * @type {import('./resource-browse.jsx').BrowseProductsParams["onSave"]}
   */
  const onBrowseAdd = useCallback(
    (selected_items) => { 
      // map to handle/id
      const mapped = selected_items.map(
        it => it.handle
      );

      // only include unseen handles
      const resolved = [
        ...mapped.filter(m => tags.find(it => it===m)===undefined), 
        ...tags
      ];

      onChange(resolved);
      setTags(resolved);

      ref_overlay.current.hide();
    }, [tags, onChange]
  );

  return (
<div className='w-full'>
  <BlingButton 
        className='text-sm mx-auto h-10 w-40 ' 
        stroke='border-2'
        children='Browse products' 
        onClick={() => ref_overlay.current.show()} />
  <Overlay ref={ref_overlay} >
    <BrowseProducts 
        onSave={onBrowseAdd} 
        onCancel={() => ref_overlay.current.hide()} />
  </Overlay>
  { 
    tags?.length>0 && 
    <HR className='w-full mt-5' />  
  } 
  <CapsulesView 
      onRemove={onRemove} 
      onClick={onRemove} 
      tags={tags} 
      className='mt-5' />
</div>
  )
}

/**
 * @param {Parameters<Filter_ProductHasHandle>["0"]} params
 */
const Filter_ProductNotHasHandle = ( 
  { ...rest }
) => {

  return (
    <Filter_ProductHasHandle {...rest} />
  )
}


/**
 * @param {Parameters<Filter_ProductHasTags>["0"]} params 
 */
const Filter_ProductNotHasTags = ( 
  { ...rest } 
) => {

  return (
    <Filter_ProductHasTags {...rest} />
  )
}

/**
 * 
 * @typedef {object} Filter_ProductPriceInRangeParams
 * @prop {import('@storecraft/core/v-api').FilterValue_p_in_price_range} value
 * @prop {(filter_value: 
 *  import('@storecraft/core/v-api').FilterValue_p_in_price_range) => void
 * } onChange
 * 
 * 
 * @param {Filter_ProductPriceInRangeParams} params
 * 
 */
const Filter_ProductPriceInRange = (
  { 
    onChange, 
    value={ from : 0.0, to : Infinity}, 
  }
) => {

  const [v, setV] = useState(value)

  // useEffect(() => { setV(v) }, [value])
  
  const onChangeInternal = useCallback(
    /**
     * @param {string} who key
     * @param {React.ChangeEvent<HTMLInputElement>} e event
     */
    (who, e) => {
      const vv = { 
        ...v, 
        [who] : parseFloat(e.currentTarget.value) 
      };

      setV(vv);
      onChange(vv);
    },
    [v, onChange]
  );
  // console.log('total ', v);

  const data = [
    { name: 'From', key: 'from' },
    { name: 'To', key: 'to' },
  ]

  return (
<div className='w-full flex flex-row items-center flex-wrap gap-5'>
  {
    data.map(({ name, key }, ix) => (
      <div key={ix} className='flex flex-row items-center gap-3'>
        {name}
        <BlingInput 
          type='number' step='1' min='0' value={v[key]} 
          className='w-20 rounded-md' 
          onWheel={(e) => e.target.blur()}
          onChange={e => onChangeInternal(key, e)} />
      </div>
    ))
  }
</div>
  )
}


const Filter_ProductAll = () => (<p children='All products are eligible' />)


/**
 * 
 * @typedef {object} Filter_OrderSubTotalParams
 * @prop {import('@storecraft/core/v-api').FilterValue_o_subtotal_in_range} value
 * @prop {(filter_value: 
 *  import('@storecraft/core/v-api').FilterValue_o_subtotal_in_range) => void
 * } onChange
 * 
 * 
 * @param {Filter_OrderSubTotalParams} params
 */
const Filter_OrderSubTotal = ( 
  { 
    onChange, 
    value={ from : 0.0, to : Infinity}, 
  }
) => {

  const [v, setV] = useState(value);

  const onChangeInternal = useCallback(
    /**
     * @param {string} who key
     * @param {React.ChangeEvent<HTMLInputElement>} e event
     */
    (who, e) => {
      const vv = { 
        ...v, 
        [who] : parseFloat(e.currentTarget.value) 
      };

      setV(vv);
      onChange(vv);
    },
    [v, onChange]
  );
  // console.log('total ', v);

  const data = [
    { name: 'From', key: 'from' },
    { name: 'To', key: 'to' },
  ]

  return (
<div className='w-full flex flex-row items-center flex-wrap gap-5'>
  {
    data.map(({ name, key }, ix) => (
      <div key={ix} className='flex flex-row items-center gap-3'>
        {name}
        <BlingInput 
            type='number' step='1' min='0' 
            value={v[key]} 
            className='w-20 rounded-md ' 
            onWheel={(e) => e.target.blur()}
            onChange={e => onChangeInternal(key, e)} />
      </div>
    ))
  }
</div>
  )
}

/**
 * 
 * @typedef {object} Filter_OrderItemCountParams
 * @prop {import('@storecraft/core/v-api').FilterValue_o_items_count_in_range} [value]
 * @prop {(filter_value: 
 *  import('@storecraft/core/v-api').FilterValue_o_items_count_in_range) => void
 * } onChange
 * 
 * 
 * @param {Filter_OrderItemCountParams} params
 * 
 */
const Filter_OrderItemCount = ( 
  { 
    onChange, 
    value={ from : 0, to : Infinity}, 
  }
) => {
  
  const [v, setV] = useState(value)

  const onChangeInternal = useCallback(
    /**
     * @param {string} who key
     * @param {React.ChangeEvent<HTMLInputElement>} e event
     */
    (who, e) => {
      const vv = { 
        ...v, 
        [who] : parseInt(e.currentTarget.value) 
      };

      setV(vv);
      onChange(vv);
    },
    [v, onChange]
  );
  
  const data = [
    { name: 'From', key: 'from' },
    { name: 'To', key: 'to' },
  ]

  return (
<div className='w-full flex flex-row items-center flex-wrap gap-5'>
  {
    data.map(
      ({ name, key }, ix) => (
        <div key={ix} className='flex flex-row items-center gap-3'>
          {name}
          <BlingInput 
              type='number' step='1' min='0' 
              value={v[key]} 
              className='w-20 rounded-md ' 
              onWheel={(e) => e.target.blur()}
              onChange={e => onChangeInternal(key, e)} />
        </div>
      )
    )
  }
</div>
  )
}

/**
 * 
 * @typedef {object} Filter_OrderDateParams
 * @prop {(value: import('@storecraft/core/v-api').FilterValue_o_date_in_range) => void} onChange
 * @prop {import('@storecraft/core/v-api').FilterValue_o_date_in_range} [value]
 * 
 * 
 * @param {Filter_OrderDateParams} params
 */
const Filter_OrderDate = ( 
  { 
    onChange, 
    value={ from: (new Date()).toISOString(), to: (new Date()).toISOString()}
  } 
) => {

  const [v, setV] = useState(value);
  const onChangeInternal = useCallback(
    /**
     * @param {string} who key
     * @param {Date} date event
     */
    (who, date) => {
      const vv = { 
        ...v, 
        [who] : date.toISOString()
      };

      setV(vv);
      onChange(vv);
    }, [v, onChange]
  );
  
  const data = [
    { name : 'From', key: 'from'},
    { name : 'To', key: 'to'},
  ];

  return (
<div className='w-full flex flex-row gap-5 flex-wrap'>
  {
    data.map(
      ({ name, key}, ix) => (
      <div className='flex flex-row --items-center flex-wrap gap-3' key={ix}>
        <span children={name}/>
        <DatePicker  
          className='border p-3 shelf-card outline-none'
          selected={new Date(v[key] ?? null)}
          onChange={(date) => onChangeInternal(key, date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={60}
          timeCaption="time"
          dateFormat="MMMM d, yyyy h:mm aa" />
      </div>
      )
    )
  }
</div>
  )
}

/**
 * 
 * @typedef {object} Filter_OrderHasCustomersParams
 * @prop {(value: import('@storecraft/core/v-api').CustomerType[]) => void} onChange
 * @prop {import('@storecraft/core/v-api').CustomerType[]} value
 * 
 * 
 * @param {Filter_OrderHasCustomersParams} params
 */
const Filter_OrderHasCustomers = (
  { 
    onChange, value=[] 
  }
) => {

  /** @type {React.MutableRefObject<import('./overlay.jsx').ImpInterface>} */
  const ref_overlay = useRef();
  const [tags, setTags] = useState(value);
  
  /**
   * @type {import('./capsules-view.jsx').CapsulesViewParams<
   *  import('@storecraft/core/v-api').CustomerType
   * >["onClick"]}
   */
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

  /**
   * @type {import('./resource-browse.jsx').BrowseCustomersParams["onSave"]}
   */
  const onBrowseAdd = useCallback(
    (selected_items) => { 
      // only include unseen handles
      const resolved = [
        ...selected_items.filter(m => tags.find(it => it.id===m.id)===undefined), 
        ...tags
      ];

      onChange(resolved);
      setTags(resolved);

      ref_overlay.current.hide();
    }, [tags, onChange]
  );

  return (
<div className='w-full'>
  <BlingButton 
      children='Browse Customers' 
      className='text-sm mx-auto h-10 w-40' 
      stroke='border-2'
      onClick={() => ref_overlay.current.show()} />

  <Overlay ref={ref_overlay} >
    <BrowseCustomers 
        onSave={onBrowseAdd} 
        onCancel={() => ref_overlay.current.hide()} />
  </Overlay>

  { 
    tags?.length>0 && 
    <HR className='w-full mt-5' />  
  } 
  <CapsulesView 
      onClick={onRemove} 
      name_fn={extract_contact_field}
      tags={tags} 
      className='mt-5' />
</div>
  )
}


///
///

/**
 * 
 * @typedef {object} ProductFilterContainerParams
 * @prop {string} name
 * @prop {import('@storecraft/core/v-api').Filter["value"]} value
 * @prop {filters_2_comp[0]["Comp"]} Comp
 * @prop {filters_2_comp[0]["CompParams"]} CompParams
 * @prop {import('@storecraft/core/v-api').Filter["meta"]["type"]} type
 * @prop {(value: import('@storecraft/core/v-api').Filter["value"]) => void} onChange
 * @prop {() => void} onRemove
 * @prop {number} ix
 * 
 * 
 * @param {ProductFilterContainerParams &
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 * 
 */
const ProductFilterContainer = (
  { 
    name, value, type, Comp, CompParams, 
    onChange, onRemove, ix, ...rest 
  }
) => {

  const [warn, setWarn] = useState(undefined)

  return (
<div className='shelf-card-light w-full h-fit p-5 border shadow-lg
              border-kf-200 text-sm rounded-lg' {...rest}>

  <div className='shelf-border-color border-b pb-2 flex 
                  flex-row justify-between mb-5'>

    <div className='flex flex-row flex-wrap gap-3 items-center'>
      <span children={`${type} Filter`} 
            className={`p-1 text-white rounded-md bg-gradient-to-r 
                        border whitespace-nowrap  
                        ${(type==='product' ? 
                        'from-pink-500 to-kf-500 border-kf-300/50' : 
                        'from-teal-500 to-teal-400  border-teal-500')}`
                      } />

      <span children={name} className='pr-3' />
    </div>
    <IoMdClose 
        onClick={onRemove} 
        className='text-base items-center 
                  cursor-pointer hover:text-teal-600
                  flex-shrink-0' />
  </div>
  {
    Comp && (
      <Comp 
          {...CompParams} 
          onChange={onChange}
          value={value} />
    )
  }
  <ShowIf show={warn}>
    <p children={warn} className='text-red-600 py-3' />
  </ShowIf>
</div>
  )
}

const filters_2_comp = [
  { 
    ...FilterMetaEnum.p_in_collections,
    Comp: Filter_ProductInCollections, CompParams: {} 
  },
  { 
    ...FilterMetaEnum.p_not_in_collections,
    Comp: Filter_ProductNotInCollections, CompParams: {} 
  },
  { 
    ...FilterMetaEnum.p_in_handles,
    Comp: Filter_ProductHasHandle, CompParams: {} 
  },
  { 
    ...FilterMetaEnum.p_not_in_handles,
    Comp: Filter_ProductNotHasHandle, CompParams: {} 
  },
  { 
    ...FilterMetaEnum.p_in_tags,
    Comp: Filter_ProductHasTags, CompParams: {} 
  },
  { 
    ...FilterMetaEnum.p_not_in_tags,
    Comp: Filter_ProductNotHasTags, CompParams: {} 
  },
  { 
    ...FilterMetaEnum.p_in_price_range,
    Comp: Filter_ProductPriceInRange, CompParams: {} 
  },
  { 
    ...FilterMetaEnum.p_all,
    Comp: Filter_ProductAll, CompParams: {} 
  },    

  { 
    ...FilterMetaEnum.o_subtotal_in_range,
    Comp: Filter_OrderSubTotal, CompParams: {} 
  },    
  { 
    ...FilterMetaEnum.o_items_count_in_range,
    Comp: Filter_OrderItemCount, CompParams: {} 
  },    
  { 
    ...FilterMetaEnum.o_date_in_range,
    Comp: Filter_OrderDate, CompParams: {} 
  },    
  { 
    ...FilterMetaEnum.o_has_customer,
    Comp: Filter_OrderHasCustomers, CompParams: {} 
  },    
]

const fake_data = [
  { id: 2, type:'product', value: [] }, 
  { id: 6, type:'product' }, 
  { id: 102, type:'order', value : { from : new Date(), to: new Date()} }, 
  { id: 101, type:'order', value : { from : 0.0, to: Infinity} }, 
  { id: 100, type:'order', value : { from : 0.0, to: Infinity} }, 
  { id: 0, type:'product', value : ['a', 'b', 'c'] }, 
  { id: 1, type:'product', value : ['a', 'b', 'c'] }, 
  { id: 4, type:'product', value : ['a', 'b', 'c'] }, 
]

/**
 * 
 * @param {import('@storecraft/core/v-api').Filter["meta"]["id"]} id Filter id
 */
const filterId2Comp = id => {
  const filter = filters_2_comp.find(it => it.id===id);

  return { 
    name: filter?.name, 
    Comp: filter?.Comp, 
    CompParams : filter?.CompParams 
  }
}

/**
 * @typedef {object} AddFilterParams
 * @prop {string} type
 * @prop {(filter_id: string | number) => void} onAdd
 * 
 * 
 * @param {AddFilterParams} params
 */
const AddFilter = (
  { 
    type, onAdd 
  }
) => {

  const options = filters_2_comp.filter(
    it => it.type===type
  );

  return (
<button className='shelf-bling-fill shelf-border-color
                   rounded-lg w-full border pl-2 sm:px-3 --pl-3 
                   py-2 shadow-lg flex overflow-x-hidden
                   flex-col justify-between h-full text-base' >
  <p children={`${type} Filter`} 
     className='shelf-text-minor-2 overflow-x-hidden whitespace-nowrap' />
  <select 
      value={'-1'} 
      className='w-full h-9 bg-transparent outline-none text-gray-500  p-0'
      onChange={e => onAdd(e.currentTarget.value)}>
    <option 
        children={`Add Filter`} 
        value='-1' key='-1' 
        className='p-0 appearance-none' />
    {
      options.map(
        (it, ix) => (
          <option children={it.name} value={it.id} key={ix} />
        )
      )
    }
  </select> 

</button>
  )
}

/**
 * 
 * @typedef {object} DiscountFiltersParams 
 * @prop {import('@storecraft/core/v-api').Filter[]} value bunch of filters
 * @prop {('product' | 'order')[]} types bunch of filters
 * @prop {(filters: 
 *  import('@storecraft/core/v-api').Filter[]) => void
 * } onChange bunch of filters
 * 
 * 
 * @param {DiscountFiltersParams} params
 * 
 */
const DiscountFilters = (
  { 
    value, onChange, types=['product', 'order'], ...rest 
  }
) => {

  const [filters, setFilters] = useState(value ?? [])

  const setAndChange = useCallback(
    /**
     * 
     * @param {import('@storecraft/core/v-api').Filter[]} fs 
     */
    (fs) => {
      setFilters(fs);

      onChange && onChange(fs);
    }, [onChange]
  );

  const onProductFilterChange = useCallback(
    /**
     * 
     * @param {number} ix Filter index
     * @param {import('@storecraft/core/v-api').Filter["value"]} v Filter value
     */
    (ix, v) => {
      filters[ix].value = v;

      const vv = [...filters];

      setAndChange(vv);
    }, [filters, setAndChange]
  );

  const onRemoveProductFilter = useCallback(
    /**
     * 
     * @param {number} ix Filter index
     */
    (ix) => {
      filters.splice(ix, 1);

      setAndChange([...filters]);
    }, [filters, setAndChange]
  );

  const onAddFilter = useCallback(
    /**
     * @param {number} filter_id 
     */
    (filter_id) => {
      const fd = filters_2_comp.find(it => it.id==filter_id);

      /** @type {import('@storecraft/core/v-api').Filter} */
      const f = { 
        meta: {
          id: fd.id, type: fd.type, op: fd.op
        },
        value : undefined                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
      }

      const vv = [...filters, f];

      setAndChange(vv);

    }, [filters, setAndChange, filters_2_comp]
  );

  // console.log('filters',filters)
  
  return (
  <div className='w-full'>
    <div className='flex flex-row gap-4 mt-3 w-full '>
    {
      types.map(
        (t, ix) => (
          <Bling className='flex-1' rounded='rounded-lg' key={ix}>
            <AddFilter type={t} onAdd={onAddFilter} />
          </Bling>
        )
      )
    }
    </div>

    <ShowIf show={filters.length}>
      <p children='' className='mt-5 h-0.5 mb-5 bg-gradient-to-r 
                from-pink-500/50 to-kf-500/50'/>
    </ShowIf>

    <div className='w-full flex flex-col gap-5'>
    {
      filters.map((it, ix) => (
        <ProductFilterContainer 
            {...filterId2Comp(it?.meta?.id)} 
            onChange={(v) => onProductFilterChange(ix, v)} 
            onRemove={() => onRemoveProductFilter(ix)} 
            key={ix} ix={ix} value={it.value} 
            id={String(it.meta?.id)} 
            type={it.meta?.type} />
      ))
    }      
    </div>    
  </div>
    )
  }
  
  export default DiscountFilters