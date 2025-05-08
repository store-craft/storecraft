import { 
  useCallback, useEffect, useMemo, 
  useRef, useState } from 'react'
import { Bling, BlingInput, HR } from './common-ui'
import { BrowseProducts } from './resource-browse'
import { Overlay } from './overlay'
import { IoCloseSharp } from 'react-icons/io5'
import { BlingButton } from './common-button'
import { LinkWithState } from '@/hooks/use-navigate-with-state'
import { useStorecraft } from '@storecraft/sdk-react-hooks'
import { LineItem, ProductType } from '@storecraft/core/api'
import { FieldContextData, FieldLeafViewParams } from './fields-view'

export type Op = "change-qty" | "stock-change";
export type LineitemsTableParams = {
  items?: LineItem[];
  context?: FieldContextData & import('../pages/order.js').Context;
  onChangeItem: (ix: number, op: Op, extra?: any) => void;
  onRemoveItem: (ix: number, item: LineItem) => void;
} & React.ComponentProps<'div'>;

export type OrderLineItemsParams = FieldLeafViewParams<
  LineItem[], import('../pages/order.js').Context
> & React.ComponentProps<'div'>;

const LineitemsTable = (
  { 
    items, context, onChangeItem, onRemoveItem 
  }: LineitemsTableParams
) => {
  
  const msg = (it: LineItem) => {
    return it.stock_reserved ? 
      `(${it.stock_reserved} stock reserved, return stock)` :
      `(reduce ${it.qty} stock units)` 
  }
  
  // console.log('items', items)
  
  return (
<div className='w-full flex flex-row mt-3 rounded-md '>
  <table className='w-full border-collapse text-left border shelf-border-color border-dashed'>
    <thead className='w-full'>
      <tr className='w-full'>
        <th children='Product' className='pl-1 pt-1'  />
        <th children='Price' />
        <th children='Quantity' />
        <th children='' className='text-right' />
      </tr>
    </thead>
    <tbody className='w-full text-sm'>
    {
      items.map(
        (it, ix) => (
          <tr key={ix} 
              className='w-full border-b shelf-border-color border-dashed'>
            <td className='pl-1  max-w-[100px] sm:max-w-[200px] pr-5' >
              <div className='overflow-x-auto --text-black whitespace-nowrap 
                              scrollbar-thin'>
                <LinkWithState 
                    to={`/pages/products/${it.id}`} 
                    current_state={
                      () => context?.getState && context?.getState()
                    }
                    draggable='false'>
                  <span children={it.data?.title} className='underline' />
                </LinkWithState>
                <br/>
                <span 
                    children={msg(it)} 
                    className='underline shelf-text-label-color text-sm 
                              font-medium cursor-pointer text-left'
                    onClick={_ => onChangeItem(ix, 'stock-change')} />
              </div>
            </td>  

            <td children={it.price} 
                className='py-2 w-14 pr-3'/>

            <td className='py-2 w-14 pr-3'>
              <Bling stroke='border-b-2' className='w-full '>
                <input 
                  placeholder='' 
                  value={it.qty} type='number' 
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  min={
                    (it?.stock_reserved > 0) ? it.stock_reserved : 1
                  } 
                  max={it?.data?.qty ?? it.qty ?? 0} 
                  step='1'
                  onChange={
                    e => onChangeItem(ix, 'change-qty', e.currentTarget.value)
                  }
                  className='h-9 w-full px-1 shelf-input-color' 
                />
              </Bling>
            </td>

            <td className='py-2 w-12 text-right items-center'>
              <IoCloseSharp 
                onClick={_ => onRemoveItem(ix, it)}
                className='h-6 w-9 pl-3 border-l shelf-border-color 
                          cursor-pointer'/>
            </td>
          </tr>
        )
      )
    }
    </tbody>
  </table>
</div>    
  )
}

const OrderLineItems = (
  { 
    field, value, onChange, context, error, setError, ...rest 
  }: OrderLineItemsParams
) => {
    
  const { sdk } = useStorecraft();
  const ref_id = useRef<HTMLInputElement>(undefined);
  const ref_price = useRef<HTMLInputElement>(undefined);
  const ref_qty = useRef<HTMLInputElement>(undefined);

  const [items, setItems] = useState(value);

  const ref_overlay = useRef<import('./overlay.jsx').ImpInterface>(undefined);

  const onManualAdd = useCallback(
    () => {
      const id = ref_id.current.value
      const price = parseFloat(ref_price.current.value)
      const qty = parseInt(ref_qty.current.value)
      if(id && price && qty)
        setItems(its => {
          return [...its, { 
            id, title: id, price, 
            qty, source: 'manual', 
            data: undefined 
            } 
          ]
        })
    }, []
  );

  const onBrowseAdd = useCallback(
    (selected_items: ProductType[]) => {
      const mapped = selected_items.map(
        it => (
          {
            id: it.handle, 
            price: it.price, 
            qty: 1, 
            title: it.title, 
            data: it, 
            stock_reserved: 0 
          }
        )
      ) as LineItem[];
    
      setItems(
        its => [
          ...mapped.filter(
            m => its.find(it => it.id===m.id)===undefined
          ), 
          ...its
        ]
      );
      ref_overlay.current.hide()
    }, []
  );

  const onRemoveItem = useCallback(
    (ix: number, item: LineItem) => {
      if(item.stock_reserved && item.qty>0) {
        setError(`${item.id} has reserved ${item.stock_reserved} items, 
        please return the stock before removing :)`)
        return
      }

      setItems(its => its.filter((it, jx) => ix!==jx ));
    }, []
  );

  const onChangeItem = useCallback(
    async (ix: number, op: Op, val?: any) => {
      if(op==='change-qty') {
        items[ix].qty = parseInt(val);

        setItems([...items]);
      }
      else if (op==='stock-change') {
        const line_item = items[ix]
        // if we have stock reserved > 0, then we offer to return stock_reserved amount,
        // otherwise, we offer to reduce the line_item.qty quantity amount from stock
        const return_stock = line_item.stock_reserved && items[ix].stock_reserved > 0;
        const how_much = return_stock ? line_item.stock_reserved : -line_item.qty;

        try {
          await sdk.products.changeStockOfBy(line_item.id, how_much);

          items[ix].stock_reserved = return_stock ? 0 : line_item.qty;

          setItems([...items]);

        } catch (e) {
          switch (e.code) {
            case 'doc-not-exists':
              setError('Product does not exist in inventory')
              break;
            case 'out-of-bounds':
              setError(`Not enough items of ${line_item.id} in stock to reduce`)
              break;
            default:
              setError('Unknown error, try again later')
              break;
          }
          console.error(e)
        }              
      }

    }, [items]
  );

  useEffect(
    () => { 
      if(value===items) {
        // this only works if we have defaultValue
        return;
      }
      onChange && onChange(items);
    }, [items, onChange, value]
  )

  const total = useMemo(
    () => items.reduce((p, c) => p + c.price * c.qty , 0), 
    [items]
  )
 
  return (
<div {...rest} >
  <BlingButton 
    children='Browse products'
    className='text-sm h-10 w-40 mx-auto cursor-pointer' 
    from='from-pink-500/60 dark:from-pink-600'
    to='to-kf-500/60 dark:to-kf-500'
    onClick={() => ref_overlay.current.show()} 
  />

  {
  /* <p children='or' 
     className='text-center text-gray-300 mt-5 text-3xl font-semibold' />
  <p children='Manual Add' 
     className='mt-3 text-center text-gray-400 text-lg font-semibold' />
  <div className='h-fit flex flex-row items-center 
                mt-3 w-full text-sm font-normal gap-3'>
    <BlingInput 
      className='flex-1 h-fit' 
      rounded='rounded-md'
      ref={ref_id} placeholder='Product' 
      type='text' />

    <BlingInput 
      className='flex-1 h-fit' 
      rounded='rounded-md'
      ref={ref_price} placeholder='Price' 
      min='0' type='number' 
      onWheel={(e) => (e.target as HTMLInputElement).blur()} />

    <BlingInput 
      className='flex-1 h-fit' 
      rounded='rounded-md'
      ref={ref_qty} placeholder='Quantity' 
      min='0' type='number' 
      onWheel={(e) => (e.target as HTMLInputElement).blur()} />

    <BlingButton 
      children='Add'
      className='flex-1 h-[42px] hidden sm:inline shadow-md' 
      onClick={onManualAdd} />
  </div>
  <BlingButton 
    children='Add'
    className='flex-1 h-10 text-sm font-semibold mt-3 \
      block sm:hidden shadow-md' 
    onClick={onManualAdd} /> */
  }

  <Overlay ref={ref_overlay} >
    <BrowseProducts 
      onSave={onBrowseAdd} 
      onCancel={() => ref_overlay.current.hide()} />
  </Overlay>
  <HR className='mt-5' />
  <p children='Items' 
     className='mt-3 text-gray-400 text-lg font-semibold' />
  <LineitemsTable 
    items={items} 
    context={context}
    onRemoveItem={onRemoveItem} 
    onChangeItem={onChangeItem}  />
  <p className='mt-5 --text-gray-400 text-lg font-semibold '>
    Sub-Total: <span className='font-semibold' children={total} />
  </p>
</div>
)
}

export default OrderLineItems