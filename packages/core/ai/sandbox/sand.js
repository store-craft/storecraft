import 'dotenv/config';
import { tool } from '../core/tools.js';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { z } from 'zod';
import { OpenAI } from '../models/chat/openai/index.js';
import { GroqCloud } from '../models/chat/groq-cloud/index.js';
import { Anthropic } from '../models/chat/anthropic/index.js';

const m = new OpenAI({
  api_key: process.env.OPENAI,
})

const models = await m.models();
console.log(models);
  