import { api, rest } from './test-runner/index.js';
import { 
  create_test as postman_test 
} from './extensions/postman/postman.test.js';
import { create_app } from './app.test.fixture.js';

async function test() {
  const app = await create_app();

  // test postman extension
  postman_test(app).run();

  { // test rest-api and most of client sdk
    Object.entries(rest).slice(0).forEach(
      ([name, runner]) => {
        runner.create(app).run();
      }
    );
  }

  // test twice on a hot database
  for(const i of [0]) {
    { // test api
      Object.entries(api).slice(0).forEach(
        ([name, runner]) => {
          runner.create(app).run();
        }
      );
    }
  }

}

test();
