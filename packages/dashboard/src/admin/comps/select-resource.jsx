import { useCommonCollection } from '@/shelf-cms-react-hooks/index.js'
import { IoReloadCircle } from 'react-icons/io5/index.js'
import { useCallback, useEffect, 
  useMemo, useState } from 'react'
import ShowIf from './show-if.jsx'
import { Bling } from './common-ui.jsx'

/**
 * picks the name from every item
 * 
 * @param {import('@storecraft/core/v-api').BaseType} it 
 */
export const default_name_fn = it => it?.title ?? it?.handle ?? 'unknown'

/**
 * transform the batch of data
 * 
 * @param {import('@storecraft/core/v-api').BaseType[]} window 
 * 
 * @returns 
 */
export const default_transform_fn = window => window ?? []

/**
 * A simple `select` control, that fetches all documents
 * 
 * @typedef {object} SelectResourceParams
 * @property {(value: any) => any} onSelect callback when selection is made (value) => any 
 * @property {string} header
 * @property {boolean} [add_all] add all sentinal
 * @property {0 | 1} layout add all sentinal
 * @property {string} resource table identifier to query
 * @property {number} [limit] number of item to query
 * @property {string} [className] 
 * @property {string} [clsHeader] 
 * @property {string} [clsReload] 
 * @property {typeof default_transform_fn} [transform_fn] 
 * @property {typeof default_name_fn} [name_fn] 
 * 
 * @param {SelectResourceParams} params
 * 
 */
const SelectResource = (
  { 
    onSelect, header, resource, limit=100, 
    layout=0, add_all=false,
    transform_fn=default_transform_fn, 
    name_fn=default_name_fn, 
    className, clsHeader, clsReload, ...rest 
  }
) => {

  const nada = '---'
  const ALL = 'ALL'
  const [tag, setTag] = useState(nada)
  const { 
    page, loading, error, query 
  } = useCommonCollection(resource, false)

  const transformed = useMemo(
    () => transform_fn(page).sort(
      (a, b) => name_fn(a).localeCompare(name_fn(b))
    )
    , [page, transform_fn, name_fn]
  )

  useEffect(
    () => {
      query({ limit }, true).catch(
        err => {
          console.log(err)
          query({ limit }, false) 
        }
      )
    }, [limit]
  )

  const onReload = useCallback(
    () => {
      query({limit}, false) 
    }, [query, limit]
  )

  const onSelectInternal = useCallback(
    e => {
      const val = e.target.value
      if(val===nada)
        return
      else if (val===ALL) {
        setTag(ALL)
        onSelect(ALL)  
        return
      }

      const idx = parseInt(val)
      setTag(idx)
      onSelect(transformed[idx])  
    }, [transformed, nada, onSelect]
  )

  const Select = ({ className='' }) => {
    return (
<select name='limit' onChange={onSelectInternal} 
        value={tag} 
        className={`h-10 px-1 w-full 
                    shelf-input-color
                    rounded-md text-sm 
                    focus:outline-none 
                    ${className}`}>
  <option value={nada} children={nada}/>
  { add_all && <option value={ALL} children={ALL}/> }
  {
    transformed.map(
      (t, ix) => 
        <option key={ix} value={ix} 
                children={name_fn(t)}/>
    )
  }
</select>        
    )
  }

  return (
<div className={className}>
  
  <ShowIf show={layout==0}>
    <div className='flex flex-row justify-between 
                    items-center gap-3' >
      <p children={header} className={clsHeader}/>
      <Bling>
        <Select />
      </Bling>
      <IoReloadCircle 
        className={`cursor-pointer ${clsReload}
                    ${loading ? 'animate-spin' : ''}`} 
        onClick={onReload} />
    </div>
  </ShowIf>

  <ShowIf show={layout==1}>
    <div className='flex flex-row justify-between items-center' >
      <p children={header} className={clsHeader}/>
      <IoReloadCircle 
        className={`cursor-pointer --h-6 --w-6 flex-shrink-0 
                    ${clsReload} ${loading ? 'animate-spin' : ''}`}
        onClick={onReload} />
    </div>
    <div className='flex flex-row items-center gap-3 mt-2'>
      <Bling className='w-full'>
        <Select />
      </Bling>
    </div>
  </ShowIf>

</div>
  )
}

export default SelectResource;

import CapsulesView from './capsules-view.jsx'
import { HR } from './common-ui.jsx'
import useNavigateWithState from '@/admin/hooks/useNavigateWithState.js'

const col2url = c => {
  switch(c) {
    case 'users': 
      return '/pages/customers'
    case 'payment_gateways': 
      return '/pages/payment-gateways'
    case 'shipping_methods': 
      return '/pages/shipping-methods'
    case 'posts': 
      return '/apps/blog'
      
    default:
      return `/pages/${c}`
  }
}

/**
 * A `select` control, that also has a capsule view, to manage selections
 * 
 * @template {import('@storecraft/core/v-api').BaseType} [T=any]
 * 
 * @param {object} p 
 * @param {import('./fields-view.jsx').FieldData} p.field
 * @param {import('./fields-view.jsx').FieldContextData} p.context
 * @param {T[]} p.value
 * @param {(value: any) => void} p.onChange
 * @param {boolean} p.add_all
 * @param {string} p.className
 * @param {string} p.resource the id of the collection
 * @param {string} p.label the label
 * @param {typeof default_transform_fn} p.transform_fn the label
 * @param {typeof default_name_fn} p.name_fn the label
 */

/**
 * A `FieldView` `select` control with `capsules` 
 * 
 * @template {import('@storecraft/core/v-api').BaseType} T
 * 
 * @typedef {object} InnerSelectResourceWithTagsParams
 * @prop {string} label
 * 
 * @typedef {InnerSelectResourceWithTagsParams<T> & SelectResourceParams & 
 *  import('./fields-view.jsx').FieldLeafViewParams<T[], 
 *  import('../pages/index.jsx').BaseDocumentContext
 * >} SelectResourceWithTagsParams
 * 
 * 
 * @param {SelectResourceWithTagsParams<T>} param 
 * 
 */
export const SelectResourceWithTags = (
  { 
    field, context, value, onChange, resource, add_all=false, 
    transform_fn=default_transform_fn,
    name_fn=default_name_fn,
    label='Select', className, ...rest 
  }
) => {
  
  const { navWithState } = useNavigateWithState()

  const [tags, setTags] = useState(Array.isArray(value) ? value : [])
  // console.log('value ', value)
  const onAdd = useCallback(
    /** @param {T} t  */
    (t) => {
      const isAll = t==='ALL';
      // console.log('t ', t)
      // t = isAll ? t : t.title ?? t.handle // id or handle of collection

      if(tags.indexOf(t)!=-1)
        return

      const new_tags = isAll ? [t] : [ ...tags.filter(tt => tt!=='ALL'), t];
      console.log('new_tags', new_tags)
      onChange(new_tags)
      setTags(new_tags)
    },
    [tags, onChange]
  )
  
  const onRemove = useCallback(
    /**
     * @param {T} v 
     */
    (v) => {
      const idx = tags.indexOf(v)
      if(idx == -1) return
      tags.splice(idx, 1)
      const new_tags = [...tags]
      onChange(new_tags)
      setTags(new_tags)
    },
    [tags, onChange]
  )
  
  const onClick = useCallback(
    /**
     * @param {T} v 
     */
    (v) => {
      if(v==='ALL')
        return
      // const where = v.split('_')[0]
      const where = v.handle ?? v.id; 
      navWithState(
        `${col2url(resource)}/${where}/edit`, 
        context?.getState()
      );
    },
    [navWithState, context, resource]
  )

  return (
<div className={className}>
  <SelectResource 
    transform_fn={transform_fn}
    name_fn={name_fn}
    add_all={add_all}
    resource={resource}
    onSelect={onAdd} 
    layout={1} 
    className='mt-3' 
    clsReload='text-kf-500 text-3xl' 
    header={label} />

  {
    tags?.length>0 &&
    <HR className='my-5' />
  }

  <CapsulesView 
      tags={tags} 
      onClick={onClick} 
      onRemove={onRemove} 
      name_fn={name_fn}
      clsCapsule='bg-kf-500' 
      className='--mt-3' />
</div>
  )
}
