# Storecraft AI Chat providers

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

Storecraft uses AI chat providers for it's main `store` agent.

Storecraft supports the following AI chat providers:
- [OpenAI](https://openai.com/)
- [Anthropic](https://www.anthropic.com/)
- [Mistral](https://mistral.ai/)
- [Google Gemini](https://gemini.google.com/)
- [Groq Cloud](https://console.groq.com/)
- [xAI / Grok](https://grok.com/)

## OpenAI

We support many models, such as:
- `o1-mini` 
- `gpt-4o`
- `gpt-4` 
- `gpt-4o-mini`
- `gpt-4-turbo`

```ts
import { App } from '@storecraft/core';
import { OpenAI } from '@storecraft/core/ai/models/chat/openai';

new App()
.withAI(
  new OpenAI({ model: 'gpt-4o-mini'})
)
.withVectorStore(
  new LibSQLVectorStore(
    {
      embedder: new OpenAIEmbedder(),
    }
  )
)
```

## Anthropic

We support many models, such as:
- `claude-3-5`
- `claude-3-5-sonnet`
- `claude-3-5-haiku`
- `claude-3-opus`

```ts
import { App } from '@storecraft/core';
import { Anthropic } from '@storecraft/core/ai/models/chat/anthropic';

new App()
.withAI(
  new Anthropic({ model: 'claude-3-5'})
)
.withVectorStore(
  new LibSQLVectorStore(
    {
      embedder: new OpenAIEmbedder(),
    }
  )
)
```

## Mistral

```ts
import { App } from '@storecraft/core';
import { Mistral } from "@storecraft/core/ai/models/chat/mistral";

new App()
.withAI(
  new Mistral({ model: 'mistral-large-latest'})
)
.withVectorStore(
  new LibSQLVectorStore(
    {
      embedder: new OpenAIEmbedder(),
    }
  )
)
```

## Google Gemini

```ts
import { App } from '@storecraft/core';
import { Gemini } from '@storecraft/core/ai/models/chat/gemini';

new App()
.withAI(
  new Gemini({ model: 'gemini-2.0-flash'})
)
.withVectorStore(
  new LibSQLVectorStore(
    {
      embedder: new OpenAIEmbedder(),
    }
  )
)
```

## Groq Cloud

Groq is a cloud-based AI model that provides a range of capabilities, including text generation, summarization, and more. It is designed to be easy to use and integrate into various applications.

```ts
import { App } from '@storecraft/core';
import { GroqCloud } from '@storecraft/core/ai/models/chat/groq-cloud';

new App()
.withAI(
  new GroqCloud({ model: 'llama-3.3-70b-versatile'})
)
.withVectorStore(
  new LibSQLVectorStore(
    {
      embedder: new OpenAIEmbedder(),
    }
  )
)
```

## xAI Grok

```ts
import { App } from '@storecraft/core';
import { XAI } from "@storecraft/core/ai/models/chat/xai";

new App()
.withAI(
  new XAI({ model: 'grok-3'})
)
.withVectorStore(
  new LibSQLVectorStore(
    {
      embedder: new OpenAIEmbedder(),
    }
  )
)
```
