import { useEffect, useState } from "react";
import { withDiv } from "./common.types"
import { sleep } from "@/hooks/sleep";

export type CardParams = withDiv<
  {
    card?: {
      loading?: boolean;
      border?: boolean;
    }
  }
>;

export const Card = (
  {
    children, card = { loading: false, border: true },
    ...rest
  }: CardParams
) => {

  return (
    <div {...rest}>

      <div className={'relative z-10 w-full h-full rounded-lg p-[1.5px] \
                chat-card overflow-clip ' + (card.border ? 'border' : '')}>
        {
          card.loading && (
            <div className='absolute inset-0 h-full w-full rounded-full 
                bg-conic/shorter from-purple-500/60 via-pink-500 
                to-transparent from-0% via-25% to-40% animate-rotate-bg'/>
          )
        }
      
        <div className='relative w-full h-full chat-card rounded-md'>
          {
            children
          }
        </div>
      </div>
      
    </div>
  )
}

export type FlashCardParams = withDiv<
  {
    card?: {
      ms?: number;
      border?: boolean;
    }
  }
>;

export const FlashCard = (
  {
    card = { ms: 1000, border: true },
    ...rest
  }: FlashCardParams
) => {
  const [loading, setLoading] = useState(true);
  useEffect(
    () => {
      sleep(card.ms).then(setLoading);
    }, [card.ms]
  );

  return (
    <Card card={{loading: loading, border: card.border}} {...rest}/>
  )
}