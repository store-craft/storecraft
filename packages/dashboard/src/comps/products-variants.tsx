import { v4 as uuidv4 } from 'uuid'
import CapsulesView from './capsules-view'
import { BiMessageSquareAdd } from 'react-icons/bi'
import { BlingButton, GradientFillIcon, 
  PromisableLoadingButton } from './common-button'
import { useCallback, useEffect, useMemo, 
  useRef, useState } from 'react'
import { BlingInput, HR, Label } from './common-ui'
import ShowIf, { ShowBinarySwitch } from './show-if'
import { MdClose } from 'react-icons/md'
import { AiFillCheckCircle } from 'react-icons/ai'
import { IoAppsOutline } from 'react-icons/io5'
import useNavigateWithState, { 
  LinkWithState } from '@/hooks/use-navigate-with-state'
import { 
  ProductType, TextEntity, VariantCombination, VariantOption, 
  VariantOptionSelection, VariantType 
} from '@storecraft/core/api'
import { FieldContextData, FieldLeafViewParams } from './fields-view'

export type ProductOptionParams = {
  option: VariantOption;
  onRemove: (option: VariantOption) => void;
  onChange: (option: VariantOption) => void;
};

export type ProductOptionsParams = {
  options: VariantOption[];
  onChange: (option: VariantOption[]) => void;
};

export type VariantParams = {
  options: VariantOption[];
  combination: VariantOptionSelection[];
  context: Context;
  setError: (error: string) => void;
};

export type VariantsViewParams = {
  options: VariantOption[];
  context: Context;
  setError: (error: string) => void;
};

export type Context = FieldContextData<VariantType & ProductType> & 
  import('../pages/product.js').Context;


const ProductOption = (
  { 
    option, onRemove, onChange 
  }: ProductOptionParams
) => {

  const [o, setO] = useState(option);

  const ref_value = useRef<HTMLInputElement>(undefined);

  const onChangeInternal = useCallback(
    (option: VariantOption) => {
      setO(option)
      onChange && onChange(option)
    }, [onChange]
  )

  const onClickCapsule = useCallback(
    (value: TextEntity) => {
      const mod = {
        ...o,
        values: [...o?.values?.filter(e => e?.id!==value?.id)]
      }

      onChangeInternal(mod)
    }, [o, onChangeInternal]
  )

  const onOptionNameChange = useCallback(
    e => {
      const name = e.currentTarget.value
      // console.log('name', name)
      const mod = {
        ...o, name
        }
      onChangeInternal(mod)
    }, [o, onChangeInternal]
  )

  const onClickAddOptionValue = useCallback(
    (_) => {
      const value = String(ref_value.current.value);
      if(value?.trim()==='')
        return

      const v = {
        id: uuidv4(), value
      } as TextEntity;

      const present = o?.values?.some(
        val => val.value===v.value
      )

      if(present)
        return
      
      const mod = {
        ...o, values: [v, ...(o?.values ?? [])]
      }

      onChangeInternal(mod)
    }, [o, uuidv4, onChangeInternal]
  )

  return (
<div className='relative w-full shadow-md'>
  <fieldset className='border shelf-border-color p-5 '>
    <legend className='text-base'>
      <BlingInput 
        ref={ref_value} placeholder='Option Name' 
        from='from-kf-400' to='to-pink-400/25'
        inputClsName=' text-base px-1 shelf-input-color hover:ring-pink-400 hover:ring-2 rounded-md h-10' 
        overrideClass={true}
        onChange={onOptionNameChange}
        value={o?.name}
        type='text' 
        rounded='rounded-md' /> 
    </legend>
    <ShowIf show={(o?.values?.length??0) > 0}>
      <CapsulesView 
        tags={o?.values} 
        name_fn={e => e?.value} 
        onRemove={onClickCapsule}
        onClick={onClickCapsule} />
    </ShowIf>
    <div className='flex flex-row items-center h-fit w-full mt-5 gap-3'>
      <BlingInput 
        ref={ref_value} 
        placeholder='Add new option' 
        inputClsName='text-base px-1 shelf-card w-full rounded-md h-10 hover:ring-pink-400 hover:ring-2' 
        overrideClass={true}
        type='text' className='mt-1 flex-1' 
        rounded='rounded-md' stroke='border-b' /> 
      <BlingButton 
        children='add' className='h-10 ' 
        onClick={onClickAddOptionValue} />
    </div>

  </fieldset>      
  <MdClose className='absolute right-0 top-0 cursor-pointer text-xl' 
           onClick={_ => onRemove(o)}/>  

</div>
  )
}

const ProductOptions = (
  { 
    options=[], onChange 
  }: ProductOptionsParams
) => {

  const [opts, setOptions] = useState(options)

  const onChangeOption = useCallback(
    (option: VariantOption) => {
      const idx = opts?.findIndex(
        op => op.id===option.id
      )
      if(idx<0)
        return

      let mod = [...opts]
      mod[idx] = option
      setOptions(mod)
      onChange && onChange(mod)
    }, [opts, onChange]
  );

  const onRemoveOption = useCallback(
    (option: VariantOption) => {
      let mod = [
        ...opts.filter(o => o.id!==option.id)
        ]
      setOptions(mod)
      onChange && onChange(mod)
    }, [opts, onChange]
  );

  const onAddOption = useCallback(
    () => {
      const option = {
        id: uuidv4(), 
        name: '',
        values: []
      } as VariantOption;

      const mod = [
        ...opts, option
      ];
      setOptions(mod)
      onChange && onChange(mod)
    }, [opts, onChange]
  );

  return (
<div className='w-full flex flex-col gap-5 items-center'>
  {
    options.map(
      o => (
        <ProductOption 
          option={o} key={o?.id} 
          onRemove={onRemoveOption} 
          onChange={onChangeOption} 
        />
      )
    )
  }
  <GradientFillIcon 
    onClick={onAddOption}
    Icon={BiMessageSquareAdd} 
    className='cursor-pointer text-6xl hover:scale-110 
                transition-transform' 
  /> 

</div>
  )
}

const compute_combinations = (idx: number, collection: VariantOptionSelection[][]=[]) => {
  let result = [];

  if(idx==collection.length)
    return []

  if(idx==collection.length-1)
    return collection[idx].map(c => [c])

  let funki = compute_combinations(idx + 1, collection) ?? [[]]

  for (let ix = 0; ix < collection[idx].length; ix++) {

    for (let jx = 0; jx < funki.length; jx++) {
      // const computed = collection[idx][ix] + '-' + funki[jx]
      const computed = [
        collection[idx][ix], ...funki[jx]
      ]

      result.push(computed)
    }
  }

  return result
}

const compareCombinations = (
  c1: VariantOptionSelection[], 
  c2: VariantOptionSelection[]
) => {
  return c1.every(
    s1 => c2.some(
      s2 => (
        s2.option_id===s1.option_id && 
        s2.value_id===s1.value_id
        )
    )
  )
}

const Variant = (
  { 
    combination, options, context, setError 
  }: VariantParams
) => {

  // const nav = useNavigate()
  useEffect(
    () => {
      const all = context?.query.all.get()
      // console.log('all', all)
    }, [context]
  );

  const text = useMemo(
    () => {
      // console.log('combination', combination);
      return combination.map(
        c => options.find(
          o => o.id === c.option_id
          ).values.find(
            v => v.id == c.value_id
            ).value
      ).join(' / ')
    }, [combination, options]
  )

  // TODO: requires testing
  const variants_products = context?.data?.variants?.reduce(
    (p, it) => {
      p[it.handle] = {
        product: it,
        selection: it.variant_hint
      }
      return p;
    }, {}
  ) as Record<string, VariantCombination>;

  const match_handle = useMemo(
    () => {
      return variants_products && Object.values(variants_products).find(
        comb => compareCombinations(combination, comb.selection)
      )?.product?.handle

    }, [variants_products, combination]
  );

  const { navWithState } = useNavigateWithState()

  const view = useCallback(
    async () => {
      const state = context?.getState && context?.getState();
      const url = `/pages/products/${match_handle}`;

      navWithState(url, state);
    }, [match_handle, navWithState, context]
  );

  const remove = useCallback(
    async () => {
      try {
        if(context?.removeVariant)
          await context.removeVariant(match_handle)
      } catch (e) {
        console.log(e)
        setError('There was a problem removing the variant 😔')
      }
    }, [match_handle, navWithState, context]
  );

  const create = useCallback(
    async () => {
      try {
        await context?.preCreateVariant();
        const state = context?.getState();

        const base = {
          ...context?.data,
          ...state?.data,
        }

        const state_next = { 
          data: { 
            ...base,
            handle: undefined,
            id: undefined, 
            parent_handle: base.handle,
            parent_id: base.id,
            variant_hint: combination,
            title: `${base.title} ${text}`
          },
          hasChanged: true
        } as import('../pages/product.js').State;
        
        navWithState(`/pages/products/create`, state, state_next)
      } catch (e) {
        setError('Unable to save this parent document 😔')
        console.error(e)
      }
    }, [context, navWithState, combination, text]
  );

  return (
<div className='w-full flex flex-row justify-between 
                shelf-border-color border-b pb-3'>
  <div className='flex flex-row gap-1 items-center'>
    <ShowIf show={Boolean(match_handle)}>
      <AiFillCheckCircle className='text-lg text-green-500' />
    </ShowIf>                                  
    <p children={text} 
      className='text-base font-medium flex-1'  />
  </div>  

    <ShowBinarySwitch toggle={Boolean(match_handle)}>

      <div className='flex flex-row gap-3 flex-shrink-0 items-center'>
        <Label>
          <PromisableLoadingButton 
            Icon={undefined} 
            text='remove' 
            show={true} 
            onClick={remove}
            keep_text_on_load={true}
            classNameLoading='text-xs'
            className='w-fit underline '/>                  
        </Label>
        <span children='/' className='font-normal text-xl' />
        <Label>
          <span 
            children={'view'} 
            className='cursor-pointer'
            onClick={view} />
        </Label>
      </div>

      <Label>
        <PromisableLoadingButton 
          Icon={undefined} 
          text='create' 
          show={true} 
          onClick={create}
          keep_text_on_load={true}
          classNameLoading='text-xs'
          className='w-fit underline '/>                  
      </Label>
    </ShowBinarySwitch>

</div>    
  )
}

const VariantsView = (
  { 
    options, context, setError 
  }: VariantsViewParams
) => {

  const combinations = useMemo(
    () => {
      const collections: VariantOptionSelection[][] = options?.map(
        o => o.values.map(
          v => (
            {
              option_id: o.id,
              value_id: v.id
            }
          )
        )
      ).filter(o => o.length>=2)
      const combs = compute_combinations(0, collections)
      // console.log('collections', collections)
      // console.log('combs', combs)
      return combs
    }, [options]
  ) as VariantOptionSelection[][];

  return (
<div className='w-full flex flex-col gap-2'>
{
  combinations.map(
    c => (
      <Variant 
        combination={c} 
        context={context}
        options={options} 
        setError={setError}
        key={c?.map(s=>s.value_id).join('_')} 
      />
    )
  )
}
</div>    
  )
}

const TEXT_INSTRUCT = `‼️ Create at least ONE Option with two values`;

const IamVariant = ({ context, ...rest }: { context: Context}) => {
  const data = context?.data

  return (
<div className='text-base'>
  <span children='This product is a variant of ' />
  <LinkWithState to={`/pages/products/${data?.parent_handle}`} 
        current_state={context?.getState}>
    <Label children={data?.parent_handle} />
  </LinkWithState>
</div>    
  )
}

export type ProductVariantsParams = FieldLeafViewParams<
  VariantOption[], Context
> & React.ComponentProps<'div'>;

const ProductVariants = (
  { 
    value, onChange, context, setError, ...rest 
  }: ProductVariantsParams
) => {

  const [v, setV] = useState(value)

  const onChangeOptions = useCallback(
    (options: VariantOption[]) => {
      setV(options)
      onChange && onChange(options)
    }, [v, onChange]
  )

  if(context?.data?.parent_handle)
    return (
      <IamVariant context={context} />
    );

  if(!context?.data?.handle)
    return `You have to create the product before you add variants`

  return (
<div {...rest}>
  <div className='flex flex-col gap-5 w-full items-center'>
    <p children='Product Options' className='text-xl w-full font-semibold' />
    <ProductOptions 
      options={v} 
      onChange={onChangeOptions} />

    <HR className='w-full ' dashed={true} />
    <div className='flex flex-row w-full items-center gap-1'>
      <IoAppsOutline className='text-xl ' />      
      <p children='Variants' className='text-xl w-full font-semibold' />
    </div>
    <ShowBinarySwitch toggle={v?.length ?? false} className='w-full'>
      <VariantsView 
        options={v} 
        context={context} 
        setError={setError} />
      <div className='w-full shelf-text-minor-light text-base' 
        children={TEXT_INSTRUCT}/>
    </ShowBinarySwitch>
  </div>
</div>
  )
}

export default ProductVariants
