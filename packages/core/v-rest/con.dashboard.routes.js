import { App } from '../index.js';
import { Polka } from '../v-polka/index.js'

const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAA11JREFUOE9VklloXGUYhp//LJNlzmyZSUxm2mk108aQpk0gtMWmFlsxIOKFVkVR9EIwoBa0VKJYxKU2FyJu1Su3C61WhYK44YJLF6qmMZqkS/bNTCeTzJmZnGQyc+b8MgmCvjffxcv38n0vjxi6OCS7Dj7J6a9Pc7tzF58oH7JCARXBTqcdFZWzyi8UKFBGBXc79/Cx8hG7Oq6j++WjiM6Oh+TvP/QQJESrbOMn8R0FbDQ0mtmGIlX6xHlsbHShcX1xH38qvcyRoG1vG+KQ3iV1dIIyhE/6GFNGcQAF2P/KbWjlOkZjJVcuzxH/K878WyZmPs28SJAXecQjlQek7misc6JIAX+LSep2RLj1+VuINkcRqoLL0FmxVshlc/S83svAsYuM54coqEXEs+7npCY1ovZG0koGU1ng/p/vI9wSJjOSYeSzcVybVWoaa6huqGbq1DRn7/iNUWsIW6wgXvQekarUiOU3Ma1NEnswxk3dHWjlGucO/8rk8UlS/nlaO1upDLqxszbjB6e4tDJIofTC06EnpI6LxqWtXKjso/2pPex5+AZUl0ZqKMXg+wPMF+eYODOKU3AQUiEyuIELrj5ypYB3A+9Id9EgYAeJ6zNE9kdoPrCVYFMQoQqW4zkcp4gVt+h9oYe5U0lqrTBpLUVWSyMORx+T1XYdhu1honwY3V9G1cYqdj6wG0P1cc3NMVRNpaT+b/7g5OMnCCfXsaRaJPRZxJFNh2RdbgNFiojtkquawghFMH1ujOByLZ6Ij+auVmobIxRyeY7t7cYz60ejjNnyMcSrDc/IiBUj41qg7aV2otuvJjWR5MtHP8WfrKFqWxW7374Rd8jg8veDfNt1kvKUgT9fzYx7GPFBw5synKlnzphm13v7qN2xnmLOxhxZQLU1NEPHU+9d7eOLO09gDiyg2xo12Sgz3hHEmbofpW8xRNqToKLFoP7oZoymtYV/tTxskfj8CrNvTCFzJU7Bm60m40kivtpyXHqXQyS9U6v8eq/14wpU4IsFKHM8LF3KYOYSLE1nyafz4MhV0INmBKvSRPTee0rmzi+yaMyDKJlr0owyjFyAglnEcif/55WYdy+GcLcYiKX+tBx/bQCzPw6lq0sZpelAheUDR7DsNddS/+MHGmtZ37mFfwDMH1+Uxo0B6QAAAABJRU5ErkJggg==" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Storecraft - Next Gen Commerce-As-Code</title>
    <script 
    id='_storecraft_script_' 
    type="module">
    import { mountStorecraftDashboard } from 'https://cdn.jsdelivr.net/npm/@storecraft/dashboard@latest/dist/lib/index.min.js';
    mountStorecraftDashboard(
      document.getElementById('root'), false
    );

  </script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`

/**
 * 
 * @param {App} app
 */
export const create_routes = (app) => {

  const polka = new Polka();

  polka.get(
    '/',
    async (req, res) => {
      res.sendHtml(html);
    }
  );

  return polka;
}

