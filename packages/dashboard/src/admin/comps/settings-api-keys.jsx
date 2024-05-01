import { Card } from "./common-ui.jsx"




/**
 * 
 * 
 * @typedef {object} SettingsApiKeysParams
 * 
 * 
 * @param {SettingsApiKeysParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 * 
 */
export const SettingsApiKeys = (
  {
    ...rest
  }
) => {

  


  return (
<Card 
   name='🔑 API Keys'
   desc='Manage your API keys'
   border={true} 
   {...rest}>


</Card>   
  )


}