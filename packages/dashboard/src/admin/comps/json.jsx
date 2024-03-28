import { Inspector } from 'react-inspector'
import { chromeLight, chromeDark } from 'react-inspector'
import { Card } from './common-ui'
import { useCallback, useMemo } from 'react'
import useDarkMode from '../hooks/useDarkMode'
import { ClipBoardCopy } from './common-fields'

/**
 * 
 * @param {object} p
 * @param {object} p.value
 */
const JsonView = ({ value, ...rest }) => {
  const { darkMode } = useDarkMode()

  if(!value)
    return null

  return (
<div className='w-full overflow-auto'>
  <div className='w-fit min-w-[50rem]'>
    <Inspector 
      // theme={{...chromeLight, TREENODE_FONT_SIZE: '14px' }} 
      theme={
        {
          ...(darkMode ? chromeDark : chromeLight),
          BASE_BACKGROUND_COLOR: '',
          TREENODE_FONT_SIZE: '14px',
        }
      } 
      data={value}  />
  </div>
</div>
  )
}

const copyContent = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Content copied to clipboard');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

/**
 * @param {object} p
 * @param {object} p.value
 */
export const JsonViewCard = ({ value, setError, ...rest }) => {

  if(!value)
    return null
  
  const Copy = useMemo(
    () => (
      <ClipBoardCopy value={JSON.stringify(value)}/>
    ),
    [value]
  ) 
    
  const onClick = useCallback(
    e => {
      copyContent(JSON.stringify(value))
    }, [value, copyContent]
  )

  return (
<div {...rest}>
  <Card className='w-full h-fit' name='JSON' 
        desc='View the RAW JSON data'
        rightView={Copy}>
    <JsonView value={value} />
  </Card>      
</div>
  )
}

export default JsonView