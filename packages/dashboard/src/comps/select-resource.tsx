import { InferQueryableType, q_initial, queryable_resources, useCollection } from '@storecraft/sdk-react-hooks'
import { IoReloadCircle } from 'react-icons/io5/index.js'
import { useCallback, useEffect, 
  useMemo, useState } from 'react'
import ShowIf from './show-if.jsx'
import { Bling } from './common-ui.js'
import CapsulesView from './capsules-view.js'
import { HR } from './common-ui.js'
import useNavigateWithState from '@/hooks/use-navigate-with-state.jsx'
import { FieldLeafViewParams } from './fields-view.jsx'
import { BaseDocumentContext } from '../pages/index.jsx'
import { ApiQuery, BaseType } from '@storecraft/core/api'

/**
 * A simple `select` control, that fetches all documents in a `collection`,
 * this is a good option for super small collections/tables such as:
 * - `Shipping Methods`
 * - `Collections`
 * - `Posts`
 * - `Discounts`
 * Which will mostly have no more that 50 items each.
 *
 * If you need something with pagination, try `BrowseCollection` instead.
 */
export type SelectResourceParams<
  RESOURCE extends queryable_resources = queryable_resources, 
  T extends InferQueryableType<RESOURCE> = InferQueryableType<RESOURCE>,
  TRANSFORM = T
> = {
  /**
   * callback when selection is made (value) => any
   */
  onSelect: (value: TRANSFORM) => any;
  header: string;
  /**
   * add all sentinal
   */
  add_all?: boolean;
  /**
   * add all sentinal
   */
  layout: 0 | 1;
  /**
   * table identifier to query
   */
  resource: RESOURCE;
  /**
   * number of item to query
   */
  limit?: number;
  className?: string;
  clsHeader?: string;
  clsReload?: string;
  transform_fn?: (value: T[]) => TRANSFORM[];
  name_fn?: (value: TRANSFORM) => string;
};

/**
* A `FieldView` `select` control with `capsules`
*/
export type SelectResourceWithTagsParams<
  RESOURCE extends queryable_resources = queryable_resources, 
  T extends InferQueryableType<RESOURCE> = InferQueryableType<RESOURCE>,
> = {
  label: string;
  slug: string;
} & SelectResourceParams<RESOURCE, T> & 
FieldLeafViewParams<T[], BaseDocumentContext>;


/**
 * picks the name from every item
 */
export const default_name_fn = (it: any) => it?.title ?? it?.handle ?? it?.id ?? 'unknown';

/**
 * transform the batch of data
 */
export const default_transform_fn = (window: any[]) => window ?? []


const SelectResource = <
  RESOURCE extends queryable_resources = queryable_resources, 
  T extends InferQueryableType<RESOURCE> = InferQueryableType<RESOURCE>,
  TRANSFORM=T
>(
  { 
    onSelect, header, resource, limit=100, 
    layout=0, add_all=false,
    transform_fn=default_transform_fn, 
    name_fn=default_name_fn, 
    className, clsHeader, clsReload, ...rest 
  }: SelectResourceParams<RESOURCE, T, TRANSFORM>
) => {

  const nada = '---'
  const ALL = 'ALL'
  const [tag, setTag] = useState(nada);

  const { 
    page, loading, error,
    actions: {
      query
    }
  } = useCollection(
    resource, 
    q_initial as unknown as ApiQuery<T>, 
    false
  );

  const transformed = useMemo(
    () => transform_fn(page).sort(
      (a, b) => {
        return name_fn(a)?.localeCompare(name_fn(b)) ?? 0;
      }
    )
    , [page, transform_fn, name_fn]
  );

  useEffect(
    () => {
      query({ limit }, true).catch(
        err => {
          console.log(err)
          query({ limit }, false) 
        }
      )
    }, [limit, query]
  );

  const onReload = useCallback(
    () => {
      query({limit}, false) 
    }, [query, limit]
  );

  const onSelectInternal: React.ChangeEventHandler<HTMLSelectElement> = useCallback(
    (e) => {
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
  );

  const Select = ({ className='' }) => {
    return (
<select 
  name='limit' 
  onChange={onSelectInternal} 
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
        <option 
          key={ix} 
          value={ix} 
          children={name_fn(t)}
        />
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

/**
 * A `FieldView` `select` control with `capsules` 
 * 
 * @typedef {object} InnerSelectResourceWithTagsParams
 * @prop {string} label
 * @prop {string} slug
 */

/**
 * 
 * @template T
 * 
 * @typedef {InnerSelectResourceWithTagsParams & SelectResourceParams<T> & 
 *  import('./fields-view.jsx').FieldLeafViewParams<T[], 
 *  import('../pages/index.jsx').BaseDocumentContext
 * >} SelectResourceWithTagsParams
 * 
 */

/**
 * A `FieldView` `select` control with `capsules` 
 */
export const SelectResourceWithTags = <
  RESOURCE extends queryable_resources = queryable_resources, 
  T extends InferQueryableType<RESOURCE> = InferQueryableType<RESOURCE>,
>(
  { 
    field, context, value, onChange, resource, add_all=false, 
    transform_fn=default_transform_fn,
    name_fn=default_name_fn, slug,
    label='Select', className, ...rest 
  }: SelectResourceWithTagsParams<RESOURCE, T>
) => {
  
  const { navWithState } = useNavigateWithState()

  const [tags, setTags] = useState(Array.isArray(value) ? value : [])

  const onAdd = useCallback(
    /** @param {T} t  */
    (t: T | 'ALL') => {
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
    (v: T) => {
      const new_tags = tags.filter(t => t.id!==v.id);
      onChange(new_tags);
      setTags(new_tags);
    },
    [tags, onChange]
  )
  
  const onClick = useCallback(
    (v: T | 'ALL') => {
      if(v==='ALL')
        return;
      // const where = v.split('_')[0]
      const where = v.handle ?? v.id; 
      navWithState(
        `${slug}/${where}`, 
        context?.getState()
      );
    },
    [navWithState, context, resource, slug]
  );

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
    header={label} 
  />

  {
    tags?.length>0 &&
    <HR className='my-5' />
  }

  <CapsulesView 
    tags={tags} 
    onClick={onClick} 
    onRemove={onRemove} 
    name_fn={name_fn}
    clsCapsule='bg-kf-500 dark:bg-kf-500/60' 
    className='--mt-3' 
  />
</div>
  )
}
