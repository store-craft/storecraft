import { useCallback, useEffect, useMemo, 
         useRef, useState } from 'react'
import { Bling, BlingInput, HR } from './common-ui'
import { BrowseProducts } from './browse-collection'
import { Overlay } from './overlay'
import { getShelf } from '../../admin-sdk'
import { IoCloseSharp } from 'react-icons/io5'
import { LineItem, ProductData } from '../../admin-sdk/js-docs-types'
import { BlingButton } from './common-button'
import { FieldContextData, FieldData } from './fields-view'
import { LinkWithState } from '../hooks/useNavigateWithState'

/**
 * @typedef {'change-qty' | 'stock-change'} Op
 * 
 * @param {object} p 
 * @param {LineItem[]} p.items
 * @param {FieldContextData} p.context
 * @param {(ix: number, op: Op, extra: any) => void} p.onChangeItem
 * @param {(ix: number, item: LineItem) => void} p.onRemoveItem
 */
const LineitemsTable = 
  ({ items, context, onChangeItem, onRemoveItem }) => {

  /**
   * @param {LineItem} it 
   */
  const msg = it => {
    return it.stock_reserved ? 
      `(${it.stock_reserved} stock reserved, return stock)` :
      `(reduce ${it.qty} stock units)` 
  }

  return (
<div className='w-full flex flex-row mt-3'>
  <table className='w-full border-collapse text-left'>
    <thead className='w-full'>
      <tr className='w-full'>
        <th children='Product'  />
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
              className='--text-gray-500 border w-full border-pink-500'>
            <td className='pl-1  max-w-[100px] sm:max-w-[200px] pr-5' >
              <div className='overflow-x-auto --text-black whitespace-nowrap 
                              scrollbar-thin'>
                <LinkWithState to={`/pages/products/${it.id}/edit`} 
                      current_state={() => context?.getState && context?.getState()}
                      ttarget='_blank' draggable='false'>
                  <span children={it.id} className='underline' />
                </LinkWithState>
                <br/>
                <span children={msg(it)} 
                      className='underline shelf-text-label-color text-sm 
                                font-medium cursor-pointer text-left'
                      onClick={_ => onChangeItem(ix, 'stock-change')} />
              </div>
            </td>  

            <td children={it.price} 
                className='py-2 w-14 pr-3'/>

            <td children={it.qty} 
                className='py-2 w-14 pr-3'>
              <Bling stroke='pb-0.5' className='w-full '>
                <input placeholder='' 
                       value={it.qty} type='number' 
                       onWheel={(e) => e.target.blur()}
                       min={
                         (it?.stock_reserved > 0) ? it.stock_reserved : 1
                       } 
                       max={it?.data?.qty ?? it.qty ?? 0} 
                       step='1'
                       onChange={e => onChangeItem(ix, 'change-qty', e.currentTarget.value)}
                       className='h-9 w-full px-1 shelf-input-color' />
              </Bling>
            </td>

            <td className='py-2 w-12 text-right items-center'>
              <IoCloseSharp onClick={_ => onRemoveItem(ix, it)}
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

/**
 * 
 * @param {object} p
 * @param {FieldData} p.field
 * @param {LineItem[]} p.value
 * @param {FieldContextData} p.context
 * @param {(v: LineItem[]) => void} p.onChange
 */
const OrderLineItems = 
  ({ field, value, onChange, context, error, setError, ...rest }) => {

  const ref_id = useRef()
  const ref_price = useRef(0.0)
  const ref_qty = useRef(0)
  /**@type {[items: LineItem[]]} */
  const [items, setItems] = useState(value)
  const ref_overlay = useRef()

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
  )

  const onBrowseAdd = useCallback(
    /**
     * @param {ProductData[]} selected_items 
     */
    (selected_items) => {
      /**@type {LineItem[]} */
      const mapped = selected_items.map(
        it => (
          { 
            id: it[0], 
            price: it[1].price, 
            qty: 1, 
            title: it[1].title, 
            data: it[1], 
            stock_reserved: false 
          }
        )
      )
    
      setItems(its => [...mapped.filter(m => its.find(it => it.id===m.id)===undefined), ...its])
      ref_overlay.current.hide()
    }, []
  )

  const onRemoveItem = useCallback(
    /**
     * 
     * @param {number} ix 
     * @param {LineItem} item 
     */
    (ix, item) => {
      if(item.stock_reserved && item.qty>0) {
        setError(`${item.id} has reserved ${item.stock_reserved} items, 
        please return the stock before removing :)`)
        return
      }
      setItems(its => its.filter((it, jx) => ix!==jx ))
    }, []
  )

  const onChangeItem = useCallback(
    async (ix, op, val) => {
      if(op==='change-qty') {
        items[ix].qty = parseInt(val)
        setItems([...items])
      }
      else if (op==='stock-change') {
        const line_item = items[ix]
        // if we have stock reserved > 0, then we offer to return stock_reserved amount,
        // otherwise, we offer to reduce the line_item.qty quantity amount from stock
        const return_stock = line_item.stock_reserved && items[ix].stock_reserved > 0
        const how_much = return_stock ? line_item.stock_reserved : -line_item.qty
        try {
          await getShelf().products
                    .changeStockOf(line_item.id, how_much)
          items[ix].stock_reserved = return_stock ? 0 : line_item.qty
          setItems([...items])
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
  )

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
  <BlingButton children='Browse products'
          className='text-sm h-10 w-40 mx-auto' 
          onClick={() => ref_overlay.current.show()} />
  <p children='or' 
     className='text-center text-gray-300 mt-5 text-3xl font-semibold' />
  <p children='Manual Add' 
     className='mt-3 text-center text-gray-400 text-lg font-semibold' />
  <div className='h-fit flex flex-row items-center mt-3 w-full text-sm font-normal gap-3'>
    <BlingInput className='flex-1 h-fit' 
          rounded='rounded-md'
          ref={ref_id} placeholder='Product' 
          type='text' />

    <BlingInput className='flex-1 h-fit' 
          rounded='rounded-md'
          ref={ref_price} placeholder='Price' 
          min='0' type='number' 
          onWheel={(e) => e.target.blur()} />

    <BlingInput className='flex-1 h-fit' 
          rounded='rounded-md'
          ref={ref_qty} placeholder='Quantity' 
          min='0' type='number' 
          onWheel={(e) => e.target.blur()} />

    <BlingButton children='Add'
          className='flex-1 h-[42px] hidden sm:inline shadow-md' 
          onClick={onManualAdd} />
  </div>
  <BlingButton children='Add'
          className='flex-1 h-10 text-sm font-semibold mt-3 block sm:hidden shadow-md' 
          onClick={onManualAdd} />

  <Overlay ref={ref_overlay} >
    <BrowseProducts onSave={onBrowseAdd} 
                    onCancel={() => ref_overlay.current.hide()} />
  </Overlay>
  <HR className='mt-5' />
  <p children='Items' 
     className='mt-3 text-gray-400 text-lg font-semibold' />
  <LineitemsTable items={items} context={context}
                  onRemoveItem={onRemoveItem} 
                  onChangeItem={onChangeItem}  />
  <p className='mt-5 --text-gray-400 text-lg font-semibold '>
    Sub-Total: <span className='font-semibold' children={total} />
  </p>
</div>
)
}

export default OrderLineItems