import { content, content_delta_text } from "@storecraft/core/ai";

export type withDiv<Params> = React.ComponentProps<'div'> & Params;

export type content_multiple_text_deltas = {
  type: 'multiple-text-deltas',
  content: content_delta_text[]
}

export type ChatMessage<
  T extends (content | content_multiple_text_deltas) = (content | content_multiple_text_deltas)
> = {
  role: 'assistant' | 'user';
  contents?: T[];
}