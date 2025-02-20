import { withDiv } from "./common.types"

export type CardParams = withDiv<
  {
    card?: {
      loading?: boolean;
    }
  }
>;

export const Card = (
  {
    children, card = { loading: false },
    ...rest
  }: CardParams
) => {

  return (
    <div {...rest}>

      <div className='relative z-10 w-full h-full border rounded-lg p-[1.5px]  
                chat-card overflow-clip'>
        {
          card.loading && (
            <div className='absolute inset-0 h-full w-full rounded-full 
                bg-conic/shorter from-purple-500/60 via-pink-500 
                to-transparent from-0% via-25% to-40% animate-rotate-bg'/>
          )
        }
      
        <div className='relative w-full chat-card rounded-md'>
          {
            children
          }
        </div>
      </div>
      
    </div>
  )
}