import { ApiReferenceReact } from '@scalar/api-reference-react'
import '@scalar/api-reference-react/style.css'

/**
 * 
 * @typedef {import('@scalar/api-reference-react').ReferenceProps} ReferenceProps
 * 
 */

/**
 * @type {ReferenceProps}
 */
let a = {

}



export default () => {
  return (
    <ApiReferenceReact
      configuration={{
        spec: {
          url: 'https://cdn.jsdelivr.net/npm/@storecraft/core@1.0.1/v-rest/openapi.yaml',
          
        },
        theme: 'purple',
        darkMode: false
      }}
      isDark={false}
    />
  )
}
