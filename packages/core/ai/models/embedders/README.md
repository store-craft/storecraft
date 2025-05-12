# Storecraft Embedding providers

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

Storecraft AI agent uses embedding providers to index and perform semantic searches
using natural language.

Storecraft supports the following AI chat providers:
- [Cloudflare Vectorize](https://cloudflare.com/)
- [Gemini](https://www.google.com/)
- [Open AI](https://openai.com/)
- [Pinecone](https://pinecone.com/)
- [Voyage AI](https://www.voyageai.com/)

## Cloudflare Vectorize

```ts
import { App } from '@storecraft/core';
import { CloudflareEmbedder } from "@storecraft/core/ai/models/embedders/cloudflare";
import { Vectorize } from '@storecraft/core/ai/models/vector-stores/vectorize';

new App()
.withAI(
  new OpenAI({ model: 'gpt-4o-mini'})
)
.withVectorStore(
  new Vectorize(
    {
      embedder: new CloudflareEmbedder({ model: '@cf/baai/bge-large-en-v1.5'}),
    }
  )
)
```

## Google Gemini Embedder

```ts
import { App } from '@storecraft/core';
import { GeminiEmbedder } from '@storecraft/core/ai/models/embedders/gemini';

new App()
.withAI(
  new OpenAI({ model: 'gpt-4o-mini'})
)
.withVectorStore(
  new LibSQLVectorStore(
    {
      embedder: new GeminiEmbedder({ model: 'text-embedding-004'}),
    }
  )
)
```

## OpenAI Embedder

```ts
import { App } from '@storecraft/core';
import { OpenAIEmbedder } from '@storecraft/core/ai/models/embedders/openai';

new App()
.withAI(
  new OpenAI({ model: 'gpt-4o-mini'})
)
.withVectorStore(
  new LibSQLVectorStore(
    {
      embedder: new OpenAIEmbedder({ model: 'text-embedding-3-large'}),
    }
  )
)
```

## Pinecone Embedder

```ts
import { App } from '@storecraft/core';
import { PineconeEmbedder } from '@storecraft/core/ai/models/embedders/pinecone';
import { Pinecone } from '@storecraft/core/ai/models/vector-stores/pinecone';


new App()
.withAI(
  new OpenAI({ model: 'gpt-4o-mini'})
)
.withVectorStore(
  new Pinecone(
    {
      embedder: new PineconeEmbedder(),
    }
  )
)
```

## Voyage AI Embedder

```ts
import { App } from '@storecraft/core';
import { VoyageAIEmbedder } from "@storecraft/core/ai/models/embedders/voyage-ai";
import { Pinecone } from '@storecraft/core/ai/models/vector-stores/pinecone';


new App()
.withAI(
  new OpenAI({ model: 'gpt-4o-mini'})
)
.withVectorStore(
  new Pinecone(
    {
      embedder: new VoyageAIEmbedder({model: 'voyage-3-large-1024'}),
    }
  )
)
```
