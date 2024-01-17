import { App } from '@storecraft/core';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { auth_users } from './src/auth_users.js';

/**
 * 
 * @param {string} uri 
 */
const connect = async (uri) => {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  // Connect the client to the server	(optional starting in v4.7)
  return client.connect();
}

/**
 * @typedef {import('@storecraft/core').db_driver} db_driver
 * @implements {db_driver}
 */
export class Driver {

  constructor() {
  }

  /**
   * 
   * @param {App<any, any>} app 
   * @returns {Promise<this>}
   */
  async init(app) {
    this._client = await connect(app.platform.env.MONGODB_URI);
    this._db_auth_users = auth_users(this);
    return this;
  }

  get client() {
    return this._client;
  }

  get auth_users() {
    return this._db_auth_users
  }
}
