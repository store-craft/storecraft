import { GoogleFunctionsPlatform } from './index.js';
import { platform as platform_test_runner } from '../../test-runner/index.js';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import http from "node:http";

const PORT = 8009;
/**
 * @description This fixture will hold identity requests and responses. We test
 * that everything we send we get back.
 */
const requests_fixtures = [
  {
    id: 'test-post',
    request: {
      url: `http://localhost:${PORT}/api/test-1`,
      init: {
        body: JSON.stringify('hello-request'),
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'X-Extra': 'extra',
        }
      }
    }
  }
];


const get_request_fixture_by_id = (id='') => {
  return requests_fixtures.find(r => r.id===id)
}


const sleep = (ms=1000) => new Promise(
  (resolve, reject) => {
    setTimeout(resolve, ms);
  }
)


/**
 * @description compare web request against the fixture by `headers`, `body` and `url`
 * 
 * @param {Request | Response} web_request 
 */
const compare_web_request_or_response_to_fixture = async (web_request) => {
  const fixture = get_request_fixture_by_id(web_request.headers.get('X-ID'));

  assert.ok(fixture, 'No Fixture found');

  assert.ok(
    new URL(fixture.request.url).pathname===new URL(web_request.url).pathname, 
    'URLs don\'t match'
  );
  assert.ok(
    fixture.request.init.body===await web_request.text(), 
    'bodies don\'t match'
  );

  Object.entries(fixture.request.init.headers).forEach(
    ([key, value]) => {
      assert.ok(
        web_request.headers.get(key)===value,
        `header ${key} was not matched`
      )
    }
  )

  return {
    fixture
  }
}

async function test() {
  const platform = new GoogleFunctionsPlatform();

  // test crypto first
  platform_test_runner.crypto.create(platform).run();


  const s = suite('encode / handle tests');
  
  // test message translation
  s('Encode IncomingMessage -> Web Request (sanity)', async () => {

    let done = false;
    let error = undefined;

    const server = http.createServer(
      /**
       * 
       * @param {import('./types.private.js').GoogleFunctionRequest} req 
       * @param {import('./types.private.js').GoogleFunctionResponse} res 
       */
      async (req, res) => {
        // google functions buffers the body
        req.rawBody = Buffer.from(requests_fixtures[0].request.init.body);

        const close = () => {
          res.end();
  
          server.closeAllConnections()
          server.close();

          done=true;
        }

        // console.log('hello ', req.url);
        try {
          if(req.url==='/done') {
            close();
            return;
          }

          // encode native request into web-request
          const web_request = await platform.encode(req);
  
          // compare it against the appropriate fixture
          const { fixture } = await compare_web_request_or_response_to_fixture(web_request);
  
          // send an identity response with the web-response into native response
          await platform.handleResponse(
            new Response(
              fixture.request.init.body,
              {
                headers: web_request.headers,
                status: 200,
                statusText: 'OK'
              }
            ),
            res
          );
        } catch (e) {
          error = e;
          res.end();
          // close();
        }

      }
    )
    
    server.listen(
      PORT,
      async () => {
        try {

          for (const r of requests_fixtures) {
            const response = await fetch(
              r.request.url, 
              {
                ...r.request.init,
                headers: {
                  ...r.request.init.headers,
                  'X-ID': r.id
                }
              }
            );
  
            await compare_web_request_or_response_to_fixture(response);
          }
  
        } catch (e) {
          error=e;
        }

        try {
          // send done signal
          await fetch(`http://localhost:${PORT}/done`);
        } catch (e) {
          error=e;
        }

      }
    ); 

    while (!done) {
      assert.not(error, String(error))
      await sleep(10);
    }
    
  })

  s.run();
}

test();
