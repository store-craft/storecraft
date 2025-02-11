import 'dotenv/config';
import { OpenAI } from './index.js';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

const tools = [
  {
    function: {
      name: 'login',
      description: 'Login in behalf of a customer with a secured temporal token',
      parameters: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'TOKEN PROVIDED BY THE CUSTOMER',
          },
        },
        required: ["token"]
      }
    },
    type: 'function'
  },  
  {
    function: {
      name: 'search_products',
      description: 'Search products of the store for info like pricing, discounts and collections',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'search keywords, can also use boolean notation for inclusion and exlusion',
          },
          count: {
            type: 'number',
            description: 'How many items to return from the search, default to 5'
          },
        },
        required: ["count"]
      }
    },
    type: 'function'
  },
  // {
  //   function: {
  //     name: 'send_message_to_customer',
  //     description: 'Ask the customer a single and concise followup question or a comment in order to fulfill your task, like if you are missing login credentials or refined queries for search',
  //     parameters: {
  //       type: 'object',
  //       query: {
  //         message: 'string',
  //         description: 'The message or question for the customer',
  //       },
  //     }
  //   },
  //   type: 'function'
  // }

]

const prompt = `
You run in a loop of Thought, Suggestions ,Action, PAUSE, Observation.
At the end of the loop you output an Answer
Use Thought to describe your thoughts about the question you have been asked.
Use Action to run one of the suitable actions available to you - then return 
PAUSE.
Observation will be the result of running those actions.

Your available actions are:

${
  JSON.stringify(tools, null, 2)
}

Example session:

Question: How much does a Lenovo Laptop costs?
Thought: I should look the Laptop price using get_average_price
                
Action: get_average_price: Lenovo
PAUSE

You will be called again with this:

Observation: A lenovo laptop average price is $400

You then output:

Answer: A lenovo laptop costs $400
`

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

    // console.log(await r.json());

    const ai = new OpenAI({
      // api_key: process.env.AI_API_KEY,
      // endpoint: 'https://api.groq.com/openai/v1/chat/completions'
      
      api_key: process.env.OPENAI,
      endpoint: 'https://api.openai.com/v1/chat/completions',

      // model: "deepseek-r1-distill-llama-70b",
      // model: "llama-3.1-8b-instant",
      // model: "llama-3.3-70b-versatile",
      model: "gpt-4o",
      // model: "mixtral-8x7b-32768",
      // model: "llama3-8b-8192",
      // model: "gemma2-9b-it",
      // model: "llama-3.2-3b-preview",      
    })

    const output = await ai.generateText(
      {
        messages: [
          {
            role: 'system',
            content: prompt2
          },
          {
            role: 'user',
            content: 'hi, i need to  login'
          },
          {
            role: 'assistant',
            "content": "<Thought>It seems the customer wants to log in, but I need a login token from them to proceed with the login process. I should ask for that information.</Thought>\n\nHi! I can help you with that. Could you please provide the login token so we can proceed?"
          },
          {
            role: 'user',
              content: 'token_sodkosd8u328u32823hui2j3'
          },
       
        ],
        tools,
      }
    );
    
    console.log(JSON.stringify(output, null, 2));
  }
);

test.run();