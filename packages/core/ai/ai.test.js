import 'dotenv/config';
import { OpenAI, tool } from './index.js';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { z } from 'zod';
import { Groq } from './groq/index.js';
import { Claude } from './anthropic/index.js';


const prompt2 = `
<who_are_you>
You are the best shopping assistant.

You have access to tools. This will be used to accomplish tasks for the customer.

Before you answer, use the <Thought> TAG to to describe your thoughts about what the customer wants, then make a plan, you
may decide that a tool needs to be used, but you may be missing information.

</who_are_you>

<important_info>
- ALWAYS ASK the user for followup questions when in doubt about tools parameters THAT ARE MISSING
- NEVER peform login without the customer giving you their credentials. ask them followup questions if info is missing.
- DONT INVOKE a tool unless you have all the parameters
- ALWAYS PRODUCE EXACTLY ONE THOUGHT
</important_info>

<examples>
<example>

How much does a Lenovo Laptop costs?
<Thought> I should look the Laptop price using get_average_price </Thought>

</example>

<example>

How are you ?
<Thought> The customer greeted me, i will greet him back </Thought>
Hi, thank you, hope you are doing well

</example>

</examples>

`


test(
  'sanity', 
  async () => {

    const ai_groq = new Groq(
      {
        api_key: process.env.GROQ,
        model: 'llama-3.3-70b-versatile'
      }
    );

    const ai_oai = new OpenAI(
      {
        api_key: process.env.OPENAI,
        model: 'gpt-4o'
      }
    );

    const ai_claude = new Claude(
      {
        api_key: process.env.ANTHROPIC,
        model:'claude-3-haiku-20240307'
      }
    );

    const output = await ai_oai.generateText(
      {
        history: [
        ],
        system: prompt2,
        prompt: [
          {
            type: 'text',
            content: 'Do you have super mario games ?'
          }
        ],
        tools: {
          search_products: tool(
            {
              schema: {
                description: 'Search products of the store for info like pricing, discounts and collections',
                parameters: z.object(
                  {
                    query: z.string().describe('search keywords, can also use boolean notation for inclusion and exlusion'),
                    count: z.number().describe('how many search results to query, default to 5')
                  }
                )
              },
              use: async function (input) {
                return [
                  {
                    title: 'super mario NES game',
                    price: 100
                  }
                ]
              }
            }
          )
        }
      }
    );
    
    console.log(JSON.stringify(output, null, 2));
  }

);



test.run();