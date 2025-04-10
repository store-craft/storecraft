import React, { useState, useCallback, useRef, useEffect } from 'react'
import ShowIf from './show-if'
import SelectResource, { SelectResourceParams } from './select-resource'
import { Bling, BlingInput, HR } from './common-ui'
import CapsulesView, { CapsulesViewParams } from './capsules-view'
import { IoMdClose } from 'react-icons/io'
// @ts-ignore
import LocalEN from 'air-datepicker/locale/en.js'
import { Overlay } from './overlay';
import { 
  BrowseCustomers, BrowseCustomersParams, BrowseProducts, BrowseProductsParams 
} from './resource-browse'
import { BlingButton } from './common-button'
import { FilterMetaEnum } from '@storecraft/core/api/types.api.enums.js'
import { SelectTags } from './tags-edit'
import { extract_contact_field } from '../pages/customers'
import useNavigateWithState from '@/hooks/use-navigate-with-state'
import { 
  CollectionType,
  CustomerType, DiscountType, Filter, FilterValue_o_date_in_range, FilterValue_o_items_count_in_range, 
  FilterValue_o_subtotal_in_range, FilterValue_p_in_collections, FilterValue_p_in_price_range, 
  FilterValue_p_in_products, FilterValue_p_in_tags 
} from '@storecraft/core/api'
import { AirDatePicker } from './air-date-picker'
import useDarkMode from '@/hooks/use-dark-mode'
import { FieldLeafViewParams } from './fields-view.js'
 
export type Filter_ProductInCollectionsParams = {
  value: FilterValue_p_in_collections;
  onChange: (filter_value: FilterValue_p_in_collections) => void;
  context: import('../pages/discount.js').Context;
};
export type Filter_ProductHasTagsParams = {
  value: FilterValue_p_in_tags;
  onChange: (filter_value: FilterValue_p_in_tags) => void;
  context: import('../pages/discount.js').Context;
};
export type Filter_ProductHasHandleParams = {
  value: FilterValue_p_in_products;
  onChange: (filter_value: FilterValue_p_in_products) => void;
  context: import('../pages/discount.js').Context;
};
export type Filter_ProductPriceInRangeParams = {
  value: FilterValue_p_in_price_range;
  onChange: (filter_value: FilterValue_p_in_price_range) => void;
};
export type Filter_OrderSubTotalParams = {
  value: FilterValue_o_subtotal_in_range;
  onChange: (filter_value: FilterValue_o_subtotal_in_range) => void;
};
export type Filter_OrderItemCountParams = {
  value?: FilterValue_o_items_count_in_range;
  onChange: (filter_value: FilterValue_o_items_count_in_range) => void;
};
export type Filter_OrderDateParams = {
  onChange: (value: FilterValue_o_date_in_range) => void;
  value?: FilterValue_o_date_in_range;
};
export type Filter_OrderHasCustomersParams = {
  onChange: (value: CustomerType[]) => void;
  value: CustomerType[];
  context: import('../pages/discount.js').Context;
};
export type ProductFilterContainerParams = {
  name: string;
  value: Filter["value"];
  Comp: any;
  CompParams: any;
  type: Filter["meta"]["type"];
  onChange: (value: Filter["value"]) => void;
  onRemove: () => void;
  ix: number;
  context: import('../pages/discount.js').Context;
} & React.ComponentProps<'div'>;
export type AddFilterParams = {
  type: string;
  onAdd: (filter_id: string | number) => void;
};
export type DiscountFiltersParams = FieldLeafViewParams<
  Filter[], 
  import('../pages/discount.js').Context,
  DiscountType
> & React.ComponentProps<'div'> & {
  types: ("product" | "order")[];
}


/////
/////

export const discount_filters_validator = (v: Filter["meta"][]) => {
  const product_filters = v?.filter(it => it.type==='product') ?? [];

  if(product_filters.length==0)
    return [false, 'You have to apply at least ONE Product Filter'];

  return [true, undefined];
}

const Filter_ProductInCollections = (
  { 
    onChange, value=[], context
  }: Filter_ProductInCollectionsParams
) => {

  const [tags, setTags] = useState(value);

  const onAdd: SelectResourceParams<'collections'>["onSelect"] = useCallback(
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
    (v: {id: string, handle: string}) => {
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

  const { navWithState } = useNavigateWithState();

  const onClick: CapsulesViewParams<typeof value[0]>["onClick"] = useCallback(
    (v) => {
      const state = context?.getState && context?.getState();
      const url = `/pages/collections/${v.handle}`;

      navWithState(url, state);

    },
    [context, navWithState]
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
    layout={1}
  />
  { 
    tags?.length>0 && 
    <HR className='w-full mt-5' />  
  }
  <CapsulesView 
    onClick={onClick} 
    onRemove={onRemove}
    tags={tags} 
    className='mt-5' 
    name_fn={tag => tag?.title ?? tag.handle} 
  />
</div>
  )
}

const Filter_ProductNotInCollections = ( 
  { 
    ...rest 
  }: React.ComponentProps<typeof Filter_ProductInCollections> 
) => {
  return (
    <Filter_ProductInCollections {...rest} />
  )
}

const Filter_ProductHasTags = (
  { 
    onChange, value=[], context
  }: Filter_ProductHasTagsParams
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
  
  const onRemove: CapsulesViewParams<string>["onRemove"] = useCallback(
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


const Filter_ProductInProducts = (
  { 
    onChange, value=[], context
  }: Filter_ProductHasHandleParams
) => {
   
  const ref_overlay = useRef<import('./overlay.jsx').ImpInterface>(undefined);

  const [tags, setTags] = useState(value)

  const onRemove: CapsulesViewParams<typeof value[0]>["onRemove"] = useCallback(
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

  const { navWithState } = useNavigateWithState();

  const onClick: CapsulesViewParams<typeof value[0]>["onClick"] = useCallback(
    (v) => {
      const state = context?.getState && context?.getState();
      const url = `/pages/products/${v.handle ?? v.id}`;

      navWithState(url, state);

    },
    [tags, context, navWithState]
  );


  const onBrowseAdd: BrowseProductsParams["onSave"] = useCallback(
    (selected_items) => { 
      // map to handle/id
      const mapped = selected_items.map(
        it => (
          {
            handle: it.handle, 
            id: it.id,
            title: it.title
          }
        )
      );

      // only include unseen handles
      const resolved = [
        ...mapped.filter(
          m => tags.find(it => it.handle===m.handle)===undefined
        ), 
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
    onClick={onClick} 
    tags={tags} 
    name_fn={it => it.title ?? it.handle ?? it.id }
    className='mt-5' />
</div>
  )
} 

const Filter_ProductNotInProducts = ( 
  { ...rest }: React.ComponentProps<typeof Filter_ProductInProducts>
) => {
  return (
    <Filter_ProductInProducts {...rest} />
  )
}


const Filter_ProductNotHasTags = ( 
  { ...rest } : React.ComponentProps<typeof Filter_ProductHasTags>
) => {
  return (
    <Filter_ProductHasTags {...rest} />
  )
}

const Filter_ProductPriceInRange = (
  { 
    onChange, 
    value={ from: 0.0, to: Infinity}, 
  }: Filter_ProductPriceInRangeParams
) => {

  const [v, setV] = useState(value)

  useEffect(
    () => { 
      onChange(v) 
    }, 
    []
  );
  
  const onChangeInternal = useCallback(
    (who: keyof typeof value, e: React.ChangeEvent<HTMLInputElement>) => {
      const vv = { 
        ...v, 
        [who]: parseFloat(e.currentTarget.value) 
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
  ] as const;

  return (
<div className='w-full flex flex-row items-center flex-wrap gap-5'>
  {
    data.map(({ name, key }, ix) => (
      <div key={ix} className='flex flex-row items-center gap-3'>
        {name}
        <BlingInput 
          type='number' step='1' min='0' value={v[key]} 
          className='w-20 rounded-md' 
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          onChange={e => onChangeInternal(key, e)} />
      </div>
    ))
  }
</div>
  )
} 


const Filter_ProductAll = () => (<p children='All products are eligible' />)


const Filter_OrderSubTotal = ( 
  { 
    onChange, 
    value={ from : 0.0, to : Infinity}, 
  }: Filter_OrderSubTotalParams
) => {

  const [v, setV] = useState(value);

  const onChangeInternal = useCallback(
    (who: string, e: React.ChangeEvent<HTMLInputElement>) => {
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
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          onChange={e => onChangeInternal(key, e)} />
      </div>
    ))
  }
</div>
  )
}

const Filter_OrderItemCount = ( 
  { 
    onChange, 
    value={ from : 0, to : Infinity}, 
  }: Filter_OrderItemCountParams
) => {
  
  const [v, setV] = useState(value)

  const onChangeInternal = useCallback(
    (who: string, e: React.ChangeEvent<HTMLInputElement>) => {
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
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            onChange={e => onChangeInternal(key, e)} />
        </div>
      )
    )
  }
</div>
  )
}


const Filter_OrderDate = ( 
  { 
    onChange, 
    value={ from: (new Date()).toISOString(), to: (new Date()).toISOString()}
  } : Filter_OrderDateParams
) => {

  const [v, setV] = useState(value);
  const { darkMode } = useDarkMode();
  const onChangeInternal = useCallback(
    (who: string, date: Date) => {
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
            <div className='flex flex-row --items-center flex-wrap gap-3' key={ix+String(darkMode)}>
              <span children={name}/>
              <AirDatePicker  
                className='border p-3 shelf-card outline-none'
                air_datepicker={{
                  options: {
                    classes: darkMode ? 'dark' : 'light',
                    isMobile:true,
                    inline: false,
                    autoClose: true,
                    timepicker: true,
                    locale: LocalEN,
                    minDate: new Date(0),
                    maxDate: new Date(9999, 11, 31),
                    dateFormat: 'MMMM d, yyyy h:mm aa',
                    timeFormat: 'HH:mm',
                    selectedDates: [new Date(v[key] ?? null)],
                    onSelect: (d) => {
                      onChangeInternal(key, d.date as Date);
                    }
                  }                
                }}
              />
            </div>
          )
        )
      }
    </div>
  )

//   return (
// <div className='w-full flex flex-row gap-5 flex-wrap'>
//   {
//     data.map(
//       ({ name, key}, ix) => (
//       <div className='flex flex-row --items-center flex-wrap gap-3' key={ix}>
//         <span children={name}/>
//         <DatePicker  
//           className='border p-3 shelf-card outline-none'
//           selected={new Date(v[key] ?? null)}
//           onChange={(date) => onChangeInternal(key, date)}
//           showTimeSelect
//           timeFormat="HH:mm"
//           timeIntervals={60}
//           timeCaption="time"
//           dateFormat="MMMM d, yyyy h:mm aa" />
//       </div>
//       )
//     )
//   }
// </div>
//   )
}

const Filter_OrderHasCustomers = (
  { 
    onChange, value=[], context 
  }: Filter_OrderHasCustomersParams
) => {

  const ref_overlay = useRef<import('./overlay.jsx').ImpInterface>(undefined);
  const [tags, setTags] = useState(value);
  
  const onRemove: CapsulesViewParams<CustomerType>["onClick"] = useCallback(
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

  const { navWithState } = useNavigateWithState();

  const onClick: CapsulesViewParams<typeof value[0]>["onClick"] = useCallback(
    (v) => {
      const state = context?.getState && context?.getState();
      const url = `/pages/customers/${v.id}`;

      navWithState(url, state);
    },
    [context, navWithState]
  );

  const onBrowseAdd: BrowseCustomersParams["onSave"] = useCallback(
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
      onRemove={onRemove} 
      onClick={onClick} 
      name_fn={extract_contact_field}
      tags={tags} 
      className='mt-5' />
</div>
  )
}


///
///

const ProductFilterContainer = (
  { 
    name, value, type, Comp, CompParams, 
    onChange, onRemove, ix, context, ...rest 
  }: ProductFilterContainerParams
) => {

  const [warn, setWarn] = useState(undefined)

  return (
<div className='shelf-card-light w-full h-fit p-5 border shadow-lg
               text-sm rounded-lg' {...rest}>

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
        context={context}
        onChange={onChange}
        value={value} 
      />
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
    ...FilterMetaEnum.p_in_products,
    Comp: Filter_ProductInProducts, CompParams: {} 
  },
  { 
    ...FilterMetaEnum.p_not_in_products,
    Comp: Filter_ProductNotInProducts, CompParams: {} 
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


const filterId2Comp = (id: Filter["meta"]["id"]) => {
  const filter = filters_2_comp.find(it => it.id===id);

  return { 
    name: filter?.name, 
    Comp: filter?.Comp, 
    CompParams : filter?.CompParams 
  }
}

const AddFilter = (
  { 
    type, onAdd 
  }: AddFilterParams
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

const DiscountFilters = (
  { 
    value, onChange, types=['product', 'order'], 
    context, ...rest 
  }: DiscountFiltersParams
) => {

  const [filters, setFilters] = useState(value ?? [])

  const setAndChange = useCallback(
    (fs: Filter[]) => {
      setFilters(fs);

      onChange && onChange(fs);
    }, [onChange]
  );

  const onProductFilterChange = useCallback(
    (ix: number, v: Filter["value"]) => {
      filters[ix].value = v;

      const vv = [...filters];

      setAndChange(vv);
    }, [filters, setAndChange]
  );

  const onRemoveProductFilter = useCallback(
    (ix: number) => {
      filters.splice(ix, 1);

      setAndChange([...filters]);
    }, [filters, setAndChange]
  );

  const onAddFilter = useCallback(
    (filter_id: number) => {
      const fd = filters_2_comp.find(it => it.id==filter_id);

      const f = { 
        meta: {
          id: fd.id, type: fd.type, op: fd.op
        },
        value: undefined                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
      } as Filter;

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
          context={context}
          onChange={(v: Filter["value"]) => onProductFilterChange(ix, v)} 
          onRemove={() => onRemoveProductFilter(ix)} 
          key={ix} ix={ix} value={it.value} 
          id={String(it.meta?.id)} 
          type={it.meta?.type} 
        />
      ))
    }      
    </div>    
  </div>
    )
  }
  
  export default DiscountFilters