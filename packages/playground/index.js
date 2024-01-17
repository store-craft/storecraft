/// 

import http, { IncomingMessage, ServerResponse } from "node:http";
import { App } from '@storecraft/core'
import { NodeAdapter } from '@storecraft/platform-node'
import { Driver } from '@storecraft/driver-mongodb-node'
import { Polka } from "@storecraft/core/v-polka/index.js";

const host = 'localhost';
const port = 8000;


let app = new App(
  new NodeAdapter(),
  new Driver()
)

await app.init()

// app.polka.use(
//   (req, res, next) => {
//     console.log('middle1')
//     // next() 
//   } 
// )  
 
app.polka.use(
  "/get",
  (req, res, next) => {
    console.log('middle2')
    // next()
  }
)

const app_b = new Polka();

app_b.get(
  '/', 
  (req, res, next) => {
    console.log('App b/b')
    console.log(req.params)
    res.sendJson({ yo: 'yo' })
    // res.finished=true;
  }
)
 
app.polka.use(
  '/a/b', 
  // (req, res) => {
  //   console.log('mid 4')
  //   console.log(req.params)
  // },
  app_b 
) 

app.polka.get(
  '/get/a', 
  async (req, res) => {
    console.log('hello get 1')
    // throw new Error('yolo')
    const value = await Promise.resolve('tomer');

    console.log(value)
    res.sendJson(
      {
        hello: 'get' 
      }
    )
  }
)


app.polka.post(
  '/post', 
  async (req, res) => {
    console.log('post 1')
    const json = await req.json();
    console.log('json')
    console.log(json)
    res.sendJson( 
      {
        ...json,
        hello: 'get'
      }
    )
  }
)
 
const server = http.createServer(app.handler);

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});