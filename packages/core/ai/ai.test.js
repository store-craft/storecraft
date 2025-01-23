import 'dotenv/config';
import { OpenAI } from './index.js';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test(
  'sanity', 
  async () => {
    const ai = new OpenAI({
      api_key: process.env.AI_API_KEY,
      endpoint: 'https://api.groq.com/openai/v1/chat/completions'
    })

    const output = await ai.complete(
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: 'user',
            content: 'Explain the importance of fast language models'
          }
        ]
      }
    );

    console.log(JSON.stringify(output, null, 2));
  }
);

test.run();