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
    name: 'LibSQL (local sqlite with vectors)',
    value: 'libsql-local'
  },
  {
    name: 'MongoDB',
    value: 'mongodb'
  },
  {
    name: 'LibSQL Turso Cloud (cloud sqlite with vectors)',
    value: 'libsql-cloud'
  },
  {
    name: 'Cloudflare Vectorize',
    value: 'cloudflare-vectorize'
  },
  {
    name: 'Pinecone',
    value: 'pinecone'
  },
]);

export const collect_ai_vector_store = async () => {

  const id = await withCancel(
    select(
      {
        message: '🤖 Select AI Vector Store',
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
    type: 'ai-vector-store',
    id: id,
    config: await collect_general_config(id),
  };
}

/**
 * 
 * @param {typeof choices[number]["value"]} id 
 * @returns 
 */
const collect_general_config = async (
  id
) => {
  switch(id) {
    
    case 'cloudflare-vectorize': {
      /** @type {import('@storecraft/core/ai/models/vector-stores/vectorize').Config} */
      const config = {
        api_key: await withCancel(
          text(
            { 
              message: 'Cloudflare Vectorize API Key',
              defaultValue: '',
              placeholder: '*****',
            }
          )
        ),
        account_id: await withCancel(
          text(
            { 
              message: 'Cloudflare Account ID',
              defaultValue: '',
              placeholder: '*****',
            }
          )
        ),
        embedder: undefined

      }
      return config;
    }

    case 'pinecone': {
      /** @type {import('@storecraft/core/ai/models/vector-stores/pinecone').Config} */
      const config = {
        api_key: await withCancel(
          text(
            { 
              message: 'What is the Pinecone API Key ?',
              defaultValue: '',
              placeholder: '*****',
            }
          ),
        ),
        embedder: undefined
      }   
      return config;
    }

    case 'libsql-local': {
      /** @type {import('@storecraft/database-turso/vector-store').Config} */
      const config = {
        url: 'file:' + await withCancel(
          text(
            { 
              message: 'What is the local file path ?',
              defaultValue: 'vector-local.db',
              placeholder: 'vector-local.db',
            }
          )
        ),
        embedder: undefined
      }   
      return config;
    }

    
    case 'libsql-cloud': {
      /** @type {import('@storecraft/database-turso/vector-store').Config} */
      const config = {
        url: await withCancel(
          text(
            { 
              message: 'What is the remote Libsql / Turso URL ?',
            }
          )
        ),
        authToken: await withCancel(
          text(
            { 
              message: 'What is the Auth Token ?',
            }
          )
        ),
        embedder: undefined
      }   
      return config;
    }

    case 'mongodb': {
      /** @type {import('@storecraft/database-mongodb/vector-store').Config} */
      const config = {
        url: await withCancel(
          text(
            { 
              message: 'What is the database URL ?',
            }
          )
        ),
        db_name: await withCancel(
          text(
            { 
              message: 'What is the database name ?',
            }
          )
        ),
        embedder: undefined
      }   
      return config;
    }

  }

}