
import { Base64 } from 'js-base64'

/**
 * 
 * @param {string} val 
 */
export const to_slug = (val) => {
  return val.toLowerCase().split(' ').join('-')
}

/**
 * 
 * @param {string} v 
 */
export const capFirstLetter = v => {
  return v.charAt(0).toUpperCase() + v.slice(1)
}

export const read_clipboard = async () => {
  let text = undefined
  try {
    text = await navigator.clipboard.readText();
    console.log('Content read from clipboard: ', text);
  } catch (err) {
    console.error('Failed to read: ', err);
  }

  return text
}

/**
 * 
 * @param {string} text 
 */
export const write_clipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Content copied to clipboard');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

export const hasTouchScreen = () => {
  if ('maxTouchPoints' in navigator)
      return navigator.maxTouchPoints > 0;
      
  return false
}

/**
 * 
 * @param {object} o 
 */
export const encode = o => encodeURIComponent(
  Base64.encode(JSON.stringify(o))
  )

/**
 * 
 * @param {string} c 
 */
export const decode = c => JSON.parse(
  Base64.decode(decodeURIComponent(c))
  )
