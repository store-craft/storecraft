import './index.css'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { Chat } from './components/chat'
export { Chat } from './components/chat';

export const mountStorecraftChat = (container?: HTMLElement) => {
  createRoot(
    container ?? document.getElementById('root')!
  ).render(
    <StrictMode>
      <Chat />
    </StrictMode>,
  )
}

