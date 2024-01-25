import { App } from '@storecraft/core';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { impl as auth_users } from './src/con.auth_users.js';
import { impl as tags } from './src/con.tags.js';

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

  /**
   * 
   * @param {string} db_name database name
   * @param {string[]} admins_emails list of admin emails
   */
  constructor(db_name='main') {
    this._name = db_name;
  }

  /**
   * 
   * @param {App<any, any>} app 
   * @returns {Promise<this>}
   */
  async init(app) {
    this._client = await connect(app.platform.env.MONGODB_URI);
    this._admins_emails = app.platform.env.DB_ADMINS_EMAILS?.split(',').map(s => s.trim()) ?? [];

    this.auth_users = auth_users(this);
    this.tags = tags(this);

    console.log(this.admins_emails)
    return this;
  }

  /**
   * database name
   */
  get name () {
    return this._name;
  }

  /**
   * admins emails
   */
  get admins_emails () {
    return this._admins_emails ?? [];
  }

  get client() {
    return this._client;
  }

}
