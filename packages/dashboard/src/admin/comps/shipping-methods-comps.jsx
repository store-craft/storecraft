import { useCallback, useEffect, 
         useState } from 'react'
import { Bling } from './common-ui.jsx'
import { MdOutlineLocalShipping } from 'react-icons/md/index.js'
import { useCommonApiDocument } from '@/shelf-cms-react-hooks/index.js'
import { v4 as uuidv4 } from 'uuid'
import ShowIf from './show-if.jsx'

export const AddShippingMethod = 
  ({ ...rest }) => {

  return (
<div {...rest}>
  <div className='w-full h-full flex flex-row items-center justify-center 
                bg-white px-5 pt-5 pb-8 rounded-3xl shadow-md cursor-pointer'>
    <div className='flex flex-col gap-3 justify-center items-center'>
      <p children='Add Shipping method' 
         className='text-sm text-gray-500 text-center'/>
      <MdOutlineLocalShipping className='w-12 h-12 text-gray-400'/>
    </div>  
</div>    
</div>    
  )
}

export const ShippingMethod = ( { item, onRemove } ) => {
  const [doc, loading, hasLoaded, error, op,
    { reload, set, create, createWithId, deleteDocument, colId, docId }] 
    = useCommonApiDocument('shipping_methods', item.id, false)
  const [edit, setEdit] = useState( item )

  const onChange = useCallback(
    (who, val) => {
      setEdit(e => ({...e, [who] : val}))
    },
    [],
  )
  
  const onSave = useCallback(
    () => {
      set(edit)
    }, [edit]
  )

  const onDelete = useCallback(
    () => {
      deleteDocument().then(() => {
        onRemove(edit.id)
      })
    }, [deleteDocument, edit]
  )

  return (
<div className='w-full h-full bg-white p-5 --pb-8 rounded-2xl
                flex flex-col justify-between'>
  <div className='flex flex-col gap-1  h-full'>
    <p children='Shipping Method Name' 
       className='text-gray-800 text-base font-light' />
    <Bling>
      <input type='text' placeholder='name' value={edit.name} 
            onChange={e => onChange('name', e.currentTarget.value)}
            className='h-9 w-full px-1 bg-slate-100 rounded-md 
                      focus:outline-kf-300 text-base font-light' />
    </Bling>
    <p children='Shipping Price' 
       className='text-gray-900 mt-3 text-base font-light' />
    <Bling>
      <input type='number' placeholder='price' min='0' 
             onWheel={(e) => e.target.blur()}
             value={edit.price} 
             onChange={e => onChange('price', parseFloat(e.currentTarget.value))}
             className='h-9 w-full px-1 bg-slate-100 rounded-md 
                      focus:outline-kf-300 text-base font-light' />
    </Bling>
    <ShowIf show={error}>
      <p children={error} className='text-red-400 --mt-5' />
    </ShowIf>    
  </div>

  <div className='flex flex-row justify-between'>
  <Bling stroke='pb-[2px]' rounded='rounded-none' className=''>
    <button children='save' className='bg-white px-1' 
            onClick={onSave}/>
  </Bling>
    <Bling stroke='pb-[2px]' rounded='rounded-none' className=''>
      <button children='remove' className='bg-white px-1 ' 
              onClick={onDelete}/>
    </Bling>

  </div>

</div>    
  )
}

const fake_data = [
  { id: '0', name: 'Israel Post', price: 30 },
  { id: '1', name: 'Israel Post Fast Shipping', price: 50 },
  { id: '2', name: 'USPS', price: 30 },
]

export const ShippingMethods = ( { items } ) => {
  const [methods, setMethods] = useState(items)

  useEffect(() => {
    setMethods(items)
  }, [items])

  const onAdd = useCallback(
    () => {
      setMethods(ms => [...ms, { id: uuidv4() }])
    },
    [],
  )

  const onRemove = useCallback(
    (id) => {
      setMethods(ms => ms.filter(it => it.id!==id))
    },
    [],
  )

  return (
<div className='flex flex-row flex-wrap w-full gap-5'>
{
  methods && methods.map((it, ix) => (
    <div key={it.id} rounded='rounded-2xl' 
         stroke='p-[0px]' 
         from='from-pink-600' to='to-kf-400' 
         className='rounded-xl border shadow-sm shadow-gray-300 
                    w-full lg:w-64 h-[16rem]'>
      <ShippingMethod item={it} onRemove={onRemove} />
    </div>
  ))
}
  <Bling rounded='rounded-3xl' from='from-pink-400' 
         to='to-kf-400' stroke='p-[10px]' 
         className='shadow-md w-full lg:w-[10rem] h-[10rem]'>
    <AddShippingMethod className='w-full h-full' 
                       key='add-method' onClick={onAdd} />
  </Bling>
</div>    
  )
}
