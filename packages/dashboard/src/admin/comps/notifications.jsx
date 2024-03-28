import React, { 
  useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AiFillNotification } from 'react-icons/ai'
import { NotificationData } from '../../admin-sdk/js-docs-types'
import MDView from './md-view'
import { MINUTE, timeSince } from '../utils/time'
import { getShelf } from '../../admin-sdk'
import { useCommonCollection } from '../../shelf-cms-react-hooks'
import { PromisableLoadingButton } from './common-button'
import useInterval from '../hooks/useInterval'
import { Link, useNavigate } from 'react-router-dom'

/**@type {NotificationData} */
const tn = {
  message: 'New `order` *was* **created** New order was created New order was created',
  updatedAt: Date.now(),
  author: 'shelf-bot',
  search: ['orders'],
  actions: [
    {
      name: 'blah',
      type: 'route',
      params: {
        collection: 'orders',
        document: 'croc'
      }
    }
  ]
}

/**@type {NotificationData} */
const tn2 = {
  message: `* 🚀 a \n* b`,
  updatedAt: Date.now(),
  author: 'shelf-bot',
  search: ['orders'],
  actions: [
    {
      name: 'blah',
      type: 'route',
      params: {
        collection: 'orders',
        document: 'croc'
      }
    }
  ]
}

/**@type {NotificationData[]} */
const test = [
  tn2, tn, tn, tn, {...tn, search: ['email']},
]

const message = `
💰 **Checkout update**\n 
* \`${'tomerre' ?? ''}\` has completed checkout.
* 💳 Order total is \`${1543 ?? '-'}\`.
* 📧 Email was sent to ${'tomerernnciw@GrMail.com' ?? 'no-email'}
`
      
/**
 * 
 * @param {object} param0 
 * @param {NotificationData} param0.notification
 * @returns 
 */
const Notification = ({ notification }) => {
  const nav = useNavigate()
  const onClick = useCallback(
    () => {
      const action = notification?.actions?.at(0)
      const params = action?.params
      if(action)  {
        switch(action.type) {
          case 'route':
            nav(`/pages/${params.collection}/${params.document}/edit`)
            break;
          case 'url':
            window.open(params.url, params.new_window ? '_blank' : '_self')
        }
      }
    }, [notification, nav, window]
  )
  
  return (
<div className='flex flex-row justify-between items-center w-full
                cursor-pointer'
      onClick={onClick}>

  <div className='w-full'>
    <MDView className='text-base' 
            // text={message} />
            text={notification.message} />
    <div className='flex flex-row items-center w-full
                    justify-between mt-1'>
      <p children={timeSince(notification.updatedAt ?? Date.now())} 
         className='text-pink-500 --text-gray-400 
                      font-semibold text-xs w-fit' />
      <div className='flex flex-row items-baseline 
                      gap-0.5 text-xs'>
        <span children='by' 
              className='inline --text-gray-500' />
        <p children={notification.author ?? 'unknown'} 
          className='bg-lime-100 text-green-700 
                     dark:bg-white/10 dark:text-green-300
                     dark:border-none 
                      inline
                      border italic rounded-md text-xs px-1' />
      </div>  
    </div>
  </div>
  {/* <BiDotsVerticalRounded className='flex-shrink-0 text-xl'/> */}
</div>   
  )
}

/**
 * 
 * @param {object} param0 
 * @param {NotificationData[]} param0.notis
 */
const FilterView = ({ notis=[], selected='All', onChange }) => {

  const tags = useMemo(
    () => {
      const s = notis.reduce(
        /**
         * 
         * @param {Set<string>} p 
         */
        (p, c) => {
          // console.log(c.search)

          c.search?.forEach(
            t => {
              p.add(t)
            }
          )
          return p
        }, new Set()
      )
     
      return ['All', ...Array.from(s)]
    }, [notis]
  )

  const onFilterClick = useCallback(
    /** @param {string} t */
    (t) => {
      onChange && onChange(t)
    }, [onChange]
  )

  return (
<div className='flex flex-row flex-wrap gap-2'>
  {
    tags.map(
      t => (
        <div key={t} children={t} 
             className={`text-base rounded-full px-2
                         cursor-pointer
                         shelf-text-label-color py-1 box-border
                       ${selected===t ? 'bg-kf-50 dark:bg-white/10 shelf-border-color border ' : 'bg-transparent'}`
                      } 
             onClick={() => onFilterClick(t)}/>
      )
    )
  }
</div>    
  )
}

/**
 * 
 * @param {object} param0 
 * @param {NotificationData[]} param0.notis
 * @param {Promise} param0.onLoadMore
 */
const NotificationsView = 
  ({ notis, onLoadMore }) => {

  return (
<div className='flex flex-col gap-5 text-sm 
                font-normal --mt-5 max-h-max'>
  {
    notis.map(
      (n, ix) => (
        <Notification notification={n} key={ix} />
      )
    )
  }
  {
    notis?.length>0 &&
    <PromisableLoadingButton
      text='Load more' 
      onClick={onLoadMore} 
      keep_text_on_load={true}
      className='w-fit mx-auto h-12 p-3 border-b cursor-pointe 
                text-center text-pink-500 font-medium text-base'  />

  }
</div>                 
  )
}

const Header = ({}) => {

  return (
<div className='w-fit flex flex-row 
              items-center gap-1 '>
  <AiFillNotification className='text-2xl' />
  <p children='Notifications' 
      className='text-2xl font-bold'/>
</div> 
  )
}

const Notifications = 
  ({ ...rest }) => {

  const [filter, setFilter] = useState('All')
  const ref_query = useRef()
  const notis = test
  const { 
    pages, page, loading, error, queryCount,
    query, prev, next
  } = useCommonCollection('notifications', false)
  ref_query.current = query
  const onInterval = useCallback(
    async () => {
      const hasChanged = await getShelf().notifications.hasChanged()
      if(hasChanged) {
        ref_query.current({
          limit: 5,
        }, false)
      }
    }, [getShelf()]
  )

  const {
    start, stop
  } = useInterval(
    onInterval, MINUTE*10, false
  )

  useEffect(
    () => {
      async function swr() {
        await query({
          limit: 5,
        }, true)
        start()
      }
      swr()
    }, [start]
  )

  /**@type {NotificationData[]} */
  const flattened = useMemo(
    () => {
      return pages.flat(1).map(
        it => it[1]
      )
    }, [pages]
  )

  let filtered = useMemo(
    () => {
      if(filter==='All')
        return flattened
      return flattened.filter(
        n => Boolean(n?.search?.includes(filter))
      )
    }, [flattened, filter]
  )

  // console.log(filtered)

  // filtered=test

  return (
  <div className='absolute w-[23rem] max-w-full top-full right-0 
                  shelf-plain-card-fill h-[600px] rounded-b-xl --shadow-xl 
                   border shadow-lg p-4
                  overflow-y-auto flex flex-col gap-5'>

    <Header />

    <FilterView notis={flattened} selected={filter} 
                onChange={setFilter} />

    <NotificationsView notis={filtered} onLoadMore={next} />

    {/* <button children='add' className='absolute top-0 right-0' 
            onClick={async () => await getShelf().notifications.addBulk(test)}/> */}

  </div>
  )
}

export default Notifications
