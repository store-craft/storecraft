import chalk from 'chalk';
import boxen from 'boxen';

/**
 * 
 * @param {string | string[]} message 
 */
export const error = (message) => {

  const msg = Array.isArray(message) ? message.join('\n') : message;
  
  return boxen(
    '\n' + msg,
    {
      title: 'Error',
      borderStyle: 'bold',
      padding: 1,
      borderColor: 'redBright'
    }
  );
}

/**
 * 
 * @param {string} title 
 * @param {string | string[]} message 
 */
export const good = (title, message) => {

  const msg = Array.isArray(message) ? message.join('\n') : message;
  
  return boxen(
    '\n' + msg,
    {
      title: title,
      borderStyle: 'bold',
      padding: 1,
      borderColor: 'greenBright'
    }
  );
}
