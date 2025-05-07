/** 
 * @import { ApiPolka } from './types.public.js' 
 * @import { ApiQuery } from '../api/types.api.query.js' 
 * @import { ChatType } from '../api/types.api.js' 
 */
import { App } from '../index.js';
import { Polka } from './polka/index.js'
import { assert } from '../api/utils.func.js'
import { authorize_admin } from './con.auth.middle.js'
import { parse_query } from '../api/query.js'
import { does_prefer_signed, HEADER_PRESIGNED } from './con.storage.routes.js';

/**
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  const middle_authorize_admin = authorize_admin(app);

  polka.post(
    '/',
    middle_authorize_admin,
    async (req, res) => {
      const final = await app.api.chats.upsert(req.parsedBody);
      res.sendJson(final);
    }
  )

  polka.get(
    '/count_query',
    async (req, res) => {
      const q = (/** @type {ApiQuery<ChatType>} */ (
        parse_query(req.query))
      );
      const count = await app.api.chats.count(q);
      res.sendJson(count);
    }
  );

  // get item
  polka.get(
    '/:handle',
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      const item = await app.api.chats.get(handle_or_id);

      assert(item, 'not-found', 404);
      
      res.sendJson(item);
    }
  );

  // delete item
  polka.delete(
    '/:handle',
    middle_authorize_admin,
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      const removed = handle_or_id && 
        await app.api.chats.remove(handle_or_id);
      res.sendJson(removed);
    }
  );

  // list
  polka.get(
    '/',
    async (req, res) => {
      const q = (/** @type {ApiQuery<ChatType>} */ (
        parse_query(req.query))
      );
      const items = await app.api.chats.list(q);
      res.sendJson(items);
    }
  );

  // get file
  polka.get(
    '/download/:id',
    async (req, res) => {
      const chat_id = req?.params?.id;

      assert(
        chat_id, 
        'Chat id is required'
      );

      const prefers_presigned_urls =
        does_prefer_signed(req?.query);
      
      const result = await app.api.chats.download(
        chat_id, 
        prefers_presigned_urls
      );

      assert(
        result, 
        'something went wrong' 
      );

      if(result.type === 'presigned') {
        res.headers.set(HEADER_PRESIGNED, 'true');
        res.sendJson(
          result.presigned
        );
      } else if(result.type === 'stream') {
        assert(
          result?.stream?.value && !result?.stream?.error, 
          result.stream.message || 
          'something went wrong with streaming chat history'
        );

        const stream = result.stream.value;

        res.headers.set(
          'Content-Type',
          'application/json'
        );
        res.headers.set(HEADER_PRESIGNED, 'false');
        res.sendReadableStream(stream);
      }

      assert(
        false, 
        `something went wrong, download type ${result.type} not supported` 
      );

    }
  );
  
  return polka;
}

