/**
 * @import { Choice } from '../../utils.js';
 */
import {
  intro,
  outro,
  confirm,
  select,
  spinner,
  isCancel,
  cancel,
  text, 
} from '@clack/prompts';
import { required, withCancel } from './collect.utils.js';

/** @satisfies {Choice[]} */
export const choices = /** @type {const} */ ([
  {
    name: 'Open AI',
    value: 'openai'
  },
  {
    name: 'Voyage AI',
    value: 'voyage-ai'
  },
  {
    name: 'Gemini',
    value: 'gemini'
  },
  {
    name: 'Pinecone',
    value: 'pinecone'
  },
  {
    name: 'Cloudflare AI',
    value: 'cloudflare'
  },
])

export const collect_ai_embedder = async () => {

  const id = await withCancel(
    select(
      {
        message: '🤖 Select AI Embedding Provider',
        options: choices.map(
          c => (
            {
              value: c.value,
              label: c.name, 
            }
          )
        ),
      }
    )
  );

  return {
    type: 'ai-embedder',
    id: id,
    config: await collect_general_config(id)
  };
}

/**
 * 
 * @param {choices[number]["value"]} id 
 * @returns 
 */
const collect_general_config = async (
  id
) => {
  switch(id) {
    
    case 'cloudflare': {
      /** @type {import('@storecraft/core/ai/models/embedders/cloudflare').config} */
      const config = {
        api_key: await withCancel(
          text(
            { 
              message: 'Cloudflare AI API Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
        account_id: await withCancel(
          text(
            { 
              message: 'Cloudflare Account ID',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
        model: await withCancel(
          select(
            { 
              message: 'Which Cloudflare AI Model will you use ?',
              options: [
                { value: '@cf/baai/bge-large-en-v1.5'},
                { value: '@cf/baai/bge-base-en-v1.5'},
                { value: '@cf/baai/bge-small-en-v1.5'},
              ]
            }
          )
        ),
      }
      return config;
    }

    case 'gemini': {
      /** @type {import('@storecraft/core/ai/models/embedders/gemini').config} */
      const config = {
        api_key: await withCancel(
          text(
            { 
              message: 'Gemini API Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
        model: await withCancel(
          select(
            { 
              message: 'Which Gemini Embeding Model will you use ?',
              options: [
                { value: 'text-embedding-004'},
                { value: 'text-embedding-001'},
              ]
            }
          )
        ),
      }   
      return config;
    }

    case 'openai': {
      /** @type {import('@storecraft/core/ai/models/embedders/openai').config} */
      const config = {
        api_key: await withCancel(
          text(
            { 
              message: 'OpenAI API Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
        model: await withCancel(
          select(
            { 
              message: 'Which OpenAI Embeding Model will you use ?',
              options: [
                { value: 'text-embedding-3-large'},
                { value: 'text-embedding-3-small'},
                { value: 'text-embedding-ada-002'},
              ]
            }
          )
        ),
      }   
      return config;
    }

    case 'pinecone': {
      /** @type {import('@storecraft/core/ai/models/embedders/pinecone').config} */
      const config = {
        api_key: await withCancel(
          text(
            { 
              message: 'Pinecone API Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
      }   
      return config;
    }

    case 'voyage-ai': {
      /** @type {import('@storecraft/core/ai/models/embedders/voyage-ai').config} */
      const config = {
        api_key: await withCancel(
          text(
            { 
              message: 'Voyage-AI API Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
        model: await withCancel(
          select(
            { 
              message: 'Which Voyage-AI Embeding Model will you use ?',
              options: [
                { value: 'voyage-3-1024'},
                { value: 'voyage-3-large-1024'},
                { value: 'voyage-3-large-2048'},
                { value: 'voyage-3-large-256'},
                { value: 'voyage-3-large-512'},
                { value: 'voyage-3-lite-512'},
                { value: 'voyage-code-2-1536'},
                { value: 'voyage-code-3-1024'},
              ]
            }
          )
        ),
      }   
      return config;
    }
  }

}