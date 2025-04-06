import { api, rest } from './test-runner/index.js';
import { create_app } from './create-app.test.js';

async function test() {
  const app = await create_app();

  // app.extensions.

  // test twice on a hot database
  for(const i of [0, 1]) {
    { // test api
      Object.entries(api).slice(0).forEach(
        ([name, runner]) => {
          runner.create(app).run();
        }
      );
    }
  
    { // test rest
      Object.entries(rest).slice(0, -1).forEach(
        ([name, runner]) => {
          runner.create(app).run();
        }
      );

      const last_test = Object.values(rest).at(-1).create(app);
      // last_test.after(async () => { await app.db.disconnect() });
      last_test.run();
    }
  }

}

test();
