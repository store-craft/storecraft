import './index.css'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { Chat, type ChatProps } from './components/chat/chat'
export { Chat } from './components/chat/chat';

/**
 * Mounts the chat component to the given container.
 * There is a dedicated `chat` prop to pass the `threadId` and 
 * `storecraft_config` to the chat component.
 * 
 * ```ts
 * chat: {
 *   threadId: 'thread-id',
 *   storecraft_config: {
 *     endpoint: 'https://api.storecraft.ai',
 *   }
 * }
 * ```
 * 
 * @param container Html Element to mount the chat component.
 * use `document.getElementById('root')` if you are using `pure-html`
 * @param chatProps Container props to pass to the chat component.
 * Also, you have specific props to pass to the chat behaviour.
 */
export const mountStorecraftChat = (
  container?: HTMLElement, 
  chatProps: ChatProps = {}
) => {
  createRoot(
    container ?? document.getElementById('root')!
  ).render(
    <StrictMode>
      <Chat {...chatProps} />
    </StrictMode>,
  )
}

