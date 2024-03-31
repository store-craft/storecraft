/**
 * @param {number} utcMillis 
 */
export const toUTCDateString = (utcMillis) => {
    const date = new Date(utcMillis);
    const d = date.getUTCDate();
    const m = date.getUTCMonth()+1;
    const y = date.getUTCFullYear().toString().slice(2)
    return [d, m, y].join('/')
}
