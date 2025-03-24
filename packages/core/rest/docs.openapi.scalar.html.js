export default 
`<!doctype html>
<html>
  <head>
    <title>API Reference</title>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <!-- Add your own OpenAPI/Swagger spec file URL here: -->
    <!-- Note: this includes our proxy, you can remove the following line if you do not need it -->
    <!-- data-proxy-url="https://api.scalar.com/request-proxy" -->
    <script
      id="api-reference"
      data-url="/api/reference/openapi.json"
      ></script>
    <!-- You can also set a full configuration object like this -->
    <!-- easier for nested objects -->
    <!-- /* theme?: 'alternate' | 'default' | 'moon' | 'purple' | 'solarized' |
    'bluePlanet' | 'saturn' | 'kepler' | 'mars' | 'deepSpace' | 'none' */ -->
    <script>
      var configuration = {
        theme: 'default',
        layout: 'modern',
        servers: [
          {
            url: '/api',
            description: 'Production server',
          },
        ]
      }

      var apiReference = document.getElementById('api-reference')
      apiReference.dataset.configuration = JSON.stringify(configuration)
    </script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>
`