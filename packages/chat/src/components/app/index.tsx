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
      className={className + ' ' + (darkMode ? 'dark bg-red-400' : '')}
      {...rest}
      >
      <div className='flex flex-row w-full overflow-x-scroll h-full justify-between '>
        <Chat 
          chat={config?.chat}
          className='max-w-full shrink flex-1 h-full chat-bg'
        />
        <Cart className='w-full max-w-[400px] h-full shrink-0 ' />

      </div>
    </div>
  )
}