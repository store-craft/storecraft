import React, { 
  forwardRef, useCallback, useEffect, useMemo, 
  useRef, useState 
} from 'react'
import { AiFillNotification } from 'react-icons/ai/index.js'
import MDView from './md-view.jsx'
import { MINUTE, timeSince } from '../utils/time.js'
import { q_initial, useCollection } from '@storecraft/sdk-react-hooks'
import { PromisableLoadingButton } from './common-button.jsx'
import useInterval from '@/admin/hooks/useInterval.js'
import { useNavigate } from 'react-router-dom'

/**@type {import('@storecraft/core/v-api').NotificationType} */
const tn = {
  message: 'New `order` *was* **created** New order was created New order was created',
  updated_at: new Date().toISOString(),
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

/**@type {import('@storecraft/core/v-api').NotificationType} */
const tn2 = {
  message: `* 🚀 a \n* b`,
  updated_at: new Date().toISOString(),
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

/**@type {import('@storecraft/core/v-api').NotificationType[]} */
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
 * @typedef {object} NotificationParams
 * @prop {import('@storecraft/core/v-api').NotificationType} notification
 * 
 * 
 * @param {NotificationParams} params
 * 
 */
const Notification = (
  { 
    notification 
  }
) => {

  const nav = useNavigate();
  const onClick = useCallback(
    () => {
      const action = notification?.actions?.at(0)
      const params = action?.params;
      if(action)  {
        switch(action.type) {
          case 'route':
            /** @type {import('@storecraft/core/v-api').NotificationActionRouteParams} */
            let casted_params = params;

            nav(
              `/pages/${casted_params.collection}/${casted_params.document}`
            );
            break;
          case 'url':
            /** @type {import('@storecraft/core/v-api').NotificationActionUrlParams} */
            let casted_params_2 = params;

            window.open(
              casted_params_2.url, casted_params_2.new_window ? '_blank' : '_self'
            );
        }
      }
    }, [notification, nav, window]
  );
  
  return (
<div className='flex flex-row justify-between items-center w-full
                cursor-pointer'
      onClick={onClick}>

  <div className='w-full'>
    <MDView 
        className='text-base' 
        value={notification.message} />
    <div className='flex flex-row items-center w-full
                    justify-between mt-1'>
      <p children={timeSince(notification.updated_at ?? Date.now())} 
         className='text-pink-500 --text-gray-400 
                      font-semibold text-xs w-fit' />
      <div className='flex flex-row items-baseline 
                      gap-0.5 text-xs'>
        <span 
            children='by' 
            className='inline --text-gray-500' />
        <p 
            children={notification.author ?? 'unknown'} 
            className='bg-lime-100 text-green-700 
                      dark:bg-white/10 dark:text-green-300
                        dark:border-none inline
                        border italic rounded-md text-xs px-1' />
      </div>  
    </div>
  </div>
</div>   
  )
}

/**
 * 
 * @typedef {object} FilterViewParams
 * @prop {import('@storecraft/core/v-api').NotificationType[]} notis
 * @prop {string} [selected='All']
 * @prop {(filter: string) => void} [onChange]
 * 
 * 
 * @param {FilterViewParams} params
 * 
 */
const FilterView = (
  { 
    notis=[], selected='All', onChange 
  }
) => {

  const tags = useMemo(
    () => {
      const s = notis.reduce(
        /**
         * 
         * @param {Set<string>} p 
         */
        (p, c) => {
          // console.log(c.search)

          c?.search?.forEach(
            t => {
              p.add(t)
            }
          )
          return p
        }, new Set()
      )
     
      return ['All', ...Array.from(s)]
    }, [notis]
  );

  const onFilterClick = useCallback(
    /** @param {string} t */
    (t) => {
      onChange && onChange(t);
    }, [onChange]
  );

  return (
<div className='flex flex-row flex-wrap gap-2'>
  {
  tags.map(
    t => (
      <div 
          key={t} children={t} 
          className={
            `text-base rounded-full px-2
             cursor-pointer shelf-text-label-color py-1 box-border
             ${selected===t ? 
              'bg-kf-50 dark:bg-white/10 shelf-border-color border ' : 
              'bg-transparent'}`
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
 * @typedef {object} NotificationsViewParams
 * @prop {import('@storecraft/core/v-api').NotificationType[]} notis
 * @prop {() => Promise<any>} onLoadMore
 * 
 * 
 * @param {NotificationsViewParams} params
 * 
 */
const NotificationsView = (
  { 
    notis, onLoadMore 
  }
) => {

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
                  text-center text-pink-500 font-medium text-base'  
    />

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

const Notifications = forwardRef(
  /**
   * 
   * @param {object} params 
   * @param {*} ref 
   */
  ({ ...rest }, ref) => {

    const [filter, setFilter] = useState('All')
    const notis = test;

    /**
     * @type {import('@storecraft/sdk-react-hooks').useCollectionHookReturnType<
     *  import('@storecraft/core/v-api').NotificationType
     * >}
     */
    const { 
      pages, page, loading, error, queryCount,
      actions: {
        removeDocument, prev, next, query
      }
    } = useCollection('notifications', q_initial, false);

    // console.log('notifications', page);

    /** @type {React.MutableRefObject<typeof query>} */
    const ref_query = useRef(query);

    const onInterval = useCallback(
      async () => {
        ref_query.current(
          {
            limit: 5,
          }, false
        );
      }, []
    );

    const {
      start, stop
    } = useInterval(
      onInterval, MINUTE * 10, false
    );

    useEffect(
      () => {
        async function swr() {
          await query(
            {
              limit: 5,
            }, true
          );

          start();
        }

        swr();

      }, [start]
    );

    /**@type {import('@storecraft/core/v-api').NotificationType[]} */
    const flattened = useMemo(
      () => pages.flat(1), 
      [pages]
    );

    let filtered = useMemo(
      () => {
        if(filter==='All')
          return flattened
        return flattened.filter(
          n => Boolean(n?.search?.includes(filter))
        )
      }, [flattened, filter]
    );

    // console.log(filtered)

    // filtered=test

    return (
    <div 
        ref={ref} 
        className='absolute w-[23rem] max-w-full top-full right-0 
                  shelf-plain-card-fill h-[600px] rounded-b-xl --shadow-xl 
                  border shadow-lg p-4
                  overflow-y-auto flex flex-col gap-5'>

      <Header />

      <FilterView 
          notis={flattened} 
          selected={filter} 
          onChange={setFilter} />

      <NotificationsView 
          notis={filtered} 
          onLoadMore={next} />

      {/* <button children='add' className='absolute top-0 right-0' 
              onClick={async () => await getShelf().notifications.addBulk(test)}/> */}

    </div>
    )
  }
)

export default Notifications
