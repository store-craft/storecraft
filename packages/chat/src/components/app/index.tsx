import { Chat, ChatProps } from "@/components/chat/chat"
import { CartAndCheckout, CartProps } from "../cart-and-checkout";
import useDarkMode from "@/hooks/use-dark-mode";
import React, { useEffect, useMemo, useState } from "react";
import { useCart } from "@storecraft/sdk-react-hooks";
import { EmptyChat } from "./empty-chat";
import { CiShoppingCart } from "react-icons/ci";

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
  const [isCartOpen, setCartOpen] = useState(false);
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

  const CartButton = useMemo(
    () => (...rest) => (
      <CiShoppingCart 
        className='w-6 h-6 -translate-x-1 translate-y-px
          cursor-pointer' 
        onClick={() => setCartOpen(true)}
      />
    ), []
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
          chat={{
            empty_chat_component: EmptyChat,
            extra_input_action_components: [CartButton],
            ...config?.chat,
          }}
          className='w-full max-w-full md:flex-1 mx-auto 
            h-full chat-bg '
        />

        {/* cart */}
        <div 
          className={
            'w-full h-full bg-black/25 dark:bg-black/50 \
            cursor-pointer \
            lg:hidden absolute top-0 left-0 z-10 ' + 
            (isCartOpen ? 'block' : 'hidden')
          } 
          onClick={() => setCartOpen(false)} 
        />
        <div
          className={
            'w-fit h-full shrink-0 overflow-hidden \
            absolute right-0 top-0 lg:relative z-10 --hidden \
            transition-all  duration-700 ' +
            (isCartOpen ? 'max-w-dvw' : 'max-w-0')
          }
        >
          <CartAndCheckout 
            className='w-screen xs:w-[350px] h-full'
            cart={{
              onClose: () => setCartOpen(false),
            }}
          />
        </div>

      </div>
    </div>
  )
}

