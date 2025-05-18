import { Chat, ChatProps } from "@/components/chat/chat"
import { Cart, CartProps } from "../cart";
import useDarkMode from "@/hooks/use-dark-mode";

export type ChatAppProps = {
  config?: {
    chat?: ChatProps["chat"],
    cart?: CartProps["cart"]
  }
} & React.ComponentProps<'div'>;

/**
 * @description Extended App with
 * - Chat
 * - Cart
 * - Future threads
 */
export const ChatApp = (
  {
    config, 
    className='h-dvh w-screen',
    ...rest
  }: ChatAppProps
) => {
  const { darkMode } = useDarkMode();

  return (
    <div 
      className={
        className + ' ' + (darkMode ? 'dark bg-red-400' : '')
      }
      {...rest}
      >
      <div 
        className='flex flex-row w-full --overflow-x-scroll 
          h-full justify-between'>

        {/* <div className="bg-red-400 flex flex-1 h-full" >
        </div> */}

        {/* <div className="bg-green-400 flex flex-row flex-1  h-full overflow-scroll" >
            <div className="w-fit flex flex-row  gap-2 ">
              {
                Array.from({length: 12}).map(
                  (_, ix) => (
                    <div 
                      key={ix} 
                      className="w-20 h-20 bg-white border-2 border-blue-400" 
                      children={`Thread ${ix}`} />
                  )
                )
              }
            </div>
          
        </div> */}

        <Chat 
          chat={config?.chat}
          className='max-w-full flex-1 --w-full h-full chat-bg '
          cclassName='max-w-full --shrink flex-1 h-full chat-bg'
        />

        <Cart 
          className='max-w-[400px] h-full --grow-0 --shrink ' 
          cclassName='w-full flex-1 max-w-[400px] h-full --shrink ' 
        />

      </div>
    </div>
  )
}