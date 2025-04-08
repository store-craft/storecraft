import { Bling, Card } from "./common-ui.js"
import MDView from "./md-view.jsx"

/**
 * A card with `markdown content`
 */
export type MarkdownViewCardParams = {
  /**
   * markdown text
   */
  value: string;
  /**
   * card title
   */
  title: string;
  /**
   * card description
   */
  description?: string;
} & Omit<React.ComponentProps<'div'>, 'value'>


export const MarkdownViewCard = (
  { 
    value, title, description, ...rest
  }: MarkdownViewCardParams
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