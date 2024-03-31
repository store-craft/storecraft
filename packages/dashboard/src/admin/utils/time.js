
export const SECOND = 1000
export const MINUTE = SECOND*60
export const HOUR = MINUTE*60
export const DAY = HOUR*24
export const MONTH = DAY*30
export const YEAR = DAY*365

const dates = [
  { millis: YEAR, adj: 'year' },
  { millis: MONTH, adj: 'month' },
  { millis: DAY, adj: 'day' },
  { millis: HOUR, adj: 'hour', singular: 'about an hour ago' },
  { millis: MINUTE, adj: 'minute' },
  { millis: SECOND, adj: 'second' },
]

/**
 * 
 * @param {number} date 
 * @returns {string}
 */
export const timeSince = (date) => {

  const millis = Math.max(Date.now() - date, 0)

  if(millis<1000)
    return 'now'

  for(let ix=0; ix < dates.length; ix++) {
    const d = dates[ix]
    let interval = millis/d.millis
    let interval_floored = Math.floor(interval)
    if(interval_floored==1)
      return d.singular ?? `about a ${d.adj} ago`
    if(interval_floored > 1)
      return `${interval_floored} ${d.adj}s ago`
  }
} 