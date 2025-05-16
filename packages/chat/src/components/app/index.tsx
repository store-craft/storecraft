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
      className={className + ' ' + (darkMode ? 'dark' : '')}
      {...rest}
      >
      <div className='flex flex-row w-full h-full'>
        <Chat 
          chat={config?.chat}
          className='w-full h-full chat-bg'
        />
        <Cart className='w-[500px]' />

      </div>
    </div>
  )
}