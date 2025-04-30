import { 
  type content_tool_result, type InferToolReturnSchema 
} from "@storecraft/core/ai";
import { TOOLS } from "@storecraft/core/ai/agents/store/agent.tools.js";
import { useEffect, useState } from "react";
import { pubsub } from "@/hooks/use-chat";
import { sleep } from "@/hooks/sleep";
import { type withDiv } from "../common.types.js";
import { Card } from "../card.js";
import { ProductCardView } from "./chat-tool-result-search-products.js";
import { CollectionCardView } from "./chat-tool-result-fetch-collections.js";
import { DiscountCardView } from "./chat-tool-result-discounts.js";
import { ShippingCardView } from "./chat-tool-result-fetch-shipping.js";

type ExtractArrayType<T extends any[]> = T extends (infer H)[] ? H : unknown;
type ToolResult = InferToolReturnSchema<ReturnType<typeof TOOLS>["search_with_similarity"]>;
type ItemType = ExtractArrayType<ToolResult>;

export type Params = withDiv<
  {
    chat: {
      content: content_tool_result<ItemType[]>,
    };
  }
>;

export const SimilaritySearchItemView = (
  {
    item, index
  }: withDiv<{item: ItemType, index: number}>
) => {

  switch (item.namespace) {
    case "products":
      return (<ProductCardView item={item.content} index={index} />);
    case "collections":
      return (<CollectionCardView item={item.content} index={index} />);
    case "discounts":
      return (<DiscountCardView item={item.content} index={index} />);
    case "shipping":
      return (<ShippingCardView item={item.content} index={index} />);
    default:
      return null;
  }

}

export const ToolResultContent_SimilaritySearch = (
  {
    chat,
  }: Params
) => {
  const [loading, setLoading] = useState(true);

  useEffect(
    () => {
      return pubsub.add(
        async () => {
          await sleep(1000);
          setLoading(false);
        }
      );
    }, []
  );

  const data = chat.content.content.data;
  // console.log(data)
  // return;
  if('error' in data) 
    return null;

  const items = data.result;

  return (
    <div 
      className='flex flex-row w-full gap-2 --overflow-x-hidden 
        overflow-x-auto h-full max-h-96 pr-40 pb-5'
      style={{'maskImage': 'linear-gradient(to right, rgba(0, 0, 0, 1.0) 80%, transparent 100%)'}}>
      {
        items.map(
          (item, ix) => (
            <Card 
              key={ix} 
              card={{loading: loading, border: true}} 
              className='w-fit h-full max-h-96' 
            >
              <SimilaritySearchItemView 
                key={item.content?.id ?? ix} 
                item={item} 
                index={ix} />
            </Card>
          )
        )
      }
    </div>
  )
}


