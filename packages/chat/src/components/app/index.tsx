import { Chat, ChatProps } from "@/components/chat/chat"
import { CartAndCheckout, CartProps } from "../cart-and-checkout";
import useDarkMode from "@/hooks/use-dark-mode";
import { useEffect, useState } from "react";
import { useCart } from "@storecraft/sdk-react-hooks";

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
  const [isCartOpen, setCartOpen] = useState(true);
  const {
    events: {
      subscribe
    }
  } = useCart();

  useEffect(
    () => {
      return subscribe(
        (event) => {
          console.log('event', event);
          if(event==='add_line_item')
            setCartOpen(true);
        }
      )
    }, [subscribe]
  );

  return (
    <div 
      className={
        className + ' ' + (darkMode ? 'dark --bg-red-400' : '')
      }
      {...rest}
      >
      <div 
        className='flex flex-row w-full overflow-x-hidden 
          h-full justify-between relative'>

        <Chat 
          chat={config?.chat}
          className='max-w-full md:flex-1 mx-auto 
            h-full chat-bg '
        />

        {
          // isCartOpen && 
          <div
            className={
              'w-fit h-full shrink-0 overflow-hidden \
              absolute right-0 top-0 lg:relative z-10 --hidden \
              transition-all  duration-700 ' +
              (isCartOpen ? 'max-w-dvw' : 'max-w-0')
            }
          >
            <CartAndCheckout 
              className='w-screen xs:w-[350px] --w-full h-full'
              cart={{
                onClose: () => setCartOpen(false),
              }}
            />
          </div>
        }

      </div>
    </div>
  )
}