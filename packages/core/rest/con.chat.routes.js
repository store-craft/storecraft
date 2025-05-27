import { App } from '../index.js';
import { favicon } from './con.dashboard.routes.js';
import { Polka } from './polka/index.js'

/**
 * @param {string} version `npm` package versioning such as 'latest' | '1.0.26' | etc.. 
 * {@link https://www.npmjs.com/package/@storecraft/chat?activeTab=versions}
 */
const html_umd = (version='latest') => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link 
      rel="icon" 
      sizes="any" 
      type="image/svg+xml" 
      href="/api/dashboard/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Storecraft Chat - Next Gen Commerce-As-Code</title>
  </head>
  <body style="background-color: black">
    <div id="root"></div>
    <script 
      id='_storecraft_script_' 
      type="application/javascript"
      src="https://www.unpkg.com/@storecraft/chat@${version}/dist/lib/src/index.umd.cjs">
    </script>
    <script>
      console.log({StorecraftChat})

      const { threadId } = Object.fromEntries(
        new URLSearchParams(window.location.search)
      );

      console.log({ threadId });

      StorecraftChat.mountChatApp(
        document.getElementById('root'), 
        {
          config: {
            chat: {
              threadId,
              apply_default_background_style: true,
              default_dark_mode: true
            },
          }        
        }
      );
    </script>
  </body>
</html>
`

/**
 * @param {App} app
 */
export const create_routes = (app) => {

  const polka = new Polka();

  polka.get(
    '/',
    async (req, res) => {
      res.headers.append('Cache-Control', 'stale-while-revalidate')
      res.sendHtml(html_umd(app.config.chat_version ?? 'latest'));
    }
  );

  polka.get(
    '/favicon.svg',
    async (req, res) => {
      res.headers.set("Content-Type", "image/svg+xml");
      res.send(favicon);
    }
  );

  polka.get(
    '/:version',
    async (req, res) => {
      const version = req?.params?.version ?? 'latest';
      res.headers.append('Cache-Control', 'stale-while-revalidate')
      res.sendHtml(html_umd(version));
    }
  );

  polka.get(
    '/:version/favicon.svg',
    async (req, res) => {
      res.headers.set("Content-Type", "image/svg+xml");
      res.send(favicon);
    }
  );

  return polka;
}

