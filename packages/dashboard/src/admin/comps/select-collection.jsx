import { useCommonCollection } from '@/shelf-cms-react-hooks/index.js'
import { IoReloadCircle } from 'react-icons/io5/index.js'
import { useCallback, useEffect, 
  useMemo, useState } from 'react'
import ShowIf from './show-if.jsx'
import { Bling } from './common-ui.jsx'

// picks the name from every item
export const default_name_fn = it => it[0]
// transform the batch of data
export const default_transform_fn = window => window ?? []

/**
 * @typedef {object} SelectCollectionParams
 * @property {(value: any) => any} onSelect callback when selection is made (value) => any 
 * @property {string} header
 * @property {boolean} [add_all] add all sentinal
 * @property {0 | 1} layout add all sentinal
 * @property {string} collectionId collection to query
 * @property {number} [limit] number of item to query
 * @property {string} [className] 
 * @property {string} [clsHeader] 
 * @property {string} [clsReload] 
 * @property {typeof default_transform_fn} [transform_fn] 
 * @property {typeof default_name_fn} [name_fn] 
 * 
 * @param {SelectCollectionParams} params
 * 
 */
const SelectCollection = (
  { 
    onSelect, header, collectionId, limit=100, layout=0,
    add_all=false,
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
  } = useCommonCollection(collectionId, false)

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

/**
 * 
 * @param {Omit<SelectCollectionParams, 'collectionId' | 'transform_fn' | 'name_fn'>} param
 */
export const SelectTags = (
  { 
    onSelect, header, limit=100, layout=0,
    className, clsHeader, clsReload, ...rest 
  }
) => {

  const transform_fn = useCallback(
    window => {
      return window ? window.reduce(
        (p, [id, value]) => [...p, ...(value?.values ?? []).map(v => `${value.name}_${v}`)]
        , []) : []
    }, []
  )

  return(
    <SelectCollection 
            transform_fn={transform_fn} 
            name_fn={v => v} 
            onSelect={onSelect} 
            header={header}
            collectionId='tags' 
            limit={limit} 
            layout={layout} 
            className={className} 
            clsHeader={clsHeader} 
            clsReload={clsReload} {...rest} />
  )
}

export default SelectCollection