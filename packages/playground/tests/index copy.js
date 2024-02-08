/// 

import http, { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";

const host = 'localhost';
const port = 8000;

/**
 * 
 * @param {IncomingMessage} req 
 */
const IncomingMessage_to_web_request = async (req) => {

  const web_req = new Request(
    `https://host${req.url}`,
    {
      method: req.method,
      headers: req.headers,
      body: req.method==='HEAD' || req.method==='GET' ? undefined : Readable.toWeb(req),
      duplex: 'half'
    }
  )

  return web_req
}

/**
 * 
 * @param {Response} wr 
 * @param {ServerResponse} res 
 */
const web_response_to_ServerResponse = (wr, res) => {
  const headers = Object.fromEntries(wr?.headers?.entries() ?? [])
  res.writeHead(wr.status, wr.statusText, headers)
  wr.body && Readable.fromWeb(wr.body).pipe(res)
}

/**
 * 
 * @param {Request} req 
 * @returns {Response}
 */
const respond = async (req) => {
  const json = req.body ?  await req.json() : {}

  // modify json
  json.add = "just added"

  return new Response(
    JSON.stringify(json),
    {
      status: 200,
      headers: {
        "a":"b"
      }
    }
  )
}

/**
 * 
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 */
const requestListener = async function (req, res) {

  const w_req = await IncomingMessage_to_web_request(req)
  const w_res = await respond(w_req)
  web_response_to_ServerResponse(w_res, res)  
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});