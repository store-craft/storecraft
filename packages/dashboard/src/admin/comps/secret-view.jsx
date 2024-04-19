import { useCallback } from 'react'
import { MInput } from './common-fields.jsx'
import { Bling } from './common-ui.jsx'
import { Base64 } from 'js-base64'

/**
 * 
 * @param {import('./fields-view.jsx').FieldLeafViewParams<
 *  string> & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 */
const SecretView = 
  (
    { 
      value, field, onChange, context, setError, ...rest
    }
  ) => {

  const onClick = useCallback(
    async () => {
      const key = await window.crypto.subtle.generateKey(
        {
          name: "HMAC",
          hash: {
            name: "SHA-256"
          }
        },
        true,
        ["sign", "verify"]
      )
      const exported = await window.crypto.subtle.exportKey("raw", key);
      const ui8a = new Uint8Array(exported);
      const b64 = Base64.fromUint8Array(ui8a, true)
      // const str_secret = new TextDecoder().decode(exportedKeyBuffer)

      console.log(b64)
      onChange && onChange(b64)

    }, [onChange]
  )

  return (
<div {...rest}>
  <div className='w-full flex flex-row justify-end'>
    <p children='Auto Suggest (256 bits Secret)' 
      className='w-fit underline cursor-pointer
                  shelf-text-label-color
                 text-sm font-medium tracking-wider' 
      onClick={onClick} />
  </div>
  <Bling className='w-full h-fit mt-2'>
    <MInput 
        field={field} value={value} 
        onChange={onChange} 
        className='w-full h-10' />
  </Bling>
</div>    
  )
}

export default SecretView