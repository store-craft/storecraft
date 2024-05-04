import { Bling, Card } from "./common-ui.jsx"
import MDView from "./md-view.jsx"

/**
 * A card with `markdown content`
 * 
 * 
 * @typedef {object} MarkdownViewCardParams
 * @prop {string} value markdown text
 * @prop {string} title card title
 * @prop {string} [description] card description
 * 
 * 
 * @param {MarkdownViewCardParams & 
 *  Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'value'>
 * } params
 * 
 */
export const MarkdownViewCard = (
  { 
    value, title, description, ...rest
  }
) => {

return (
<Card 
   name={title}
   desc={description}
   border={true} 
   {...rest}>
 <Bling stroke='border-b' rounded='rounded-lg' >
   <MDView
       className='rounded-md p-3 
         w-full text-base min-h-8 align-middle
         shelf-input-color flex flex-row items-center' 
       value={value} />
 </Bling>
</Card>    
)
}