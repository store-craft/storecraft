import 'dotenv/config';
import * as functions from '@google-cloud/functions-framework';
import { app } from './app.js';

// console.log('env ', process.env)

functions.http(
  'storecraft',
  async (req, res) => {
    app.print_banner();
    return app.handler(req, res);
  }
);
