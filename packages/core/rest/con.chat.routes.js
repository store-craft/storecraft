import { App } from '../index.js';
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
      StorecraftChat.mountStorecraftChat(
        document.getElementById('root'), false
      );
    </script>
  </body>
</html>
`

/**
 * @param {string} version `npm` package versioning such as 'latest' | '1.0.26' | etc.. 
 * {@link https://www.npmjs.com/package/@storecraft/chat?activeTab=versions}
 */
const html_esm = (version='latest') => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" sizes="any" type="image/svg+xml" href="/api/dashboard/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Storecraft Chat - Next Gen Commerce-As-Code</title>
    <script 
    id='_storecraft_script_' 
    type="module">
    import { mountStorecraftChat } from 'https://www.unpkg.com/@storecraft/chat@${version}/dist/lib/src/index.js';
    mountStorecraftChat(
      document.getElementById('root'), false
    );

  </script>
  </head>
  <body style="background-color: black">
    <div id="root"></div>
  </body>
</html>
`

const favicon = `
<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:bx="https://boxy-svg.com">
  <defs>
    <linearGradient id="gradient-0-0" gradientUnits="userSpaceOnUse" x1="128" y1="0" x2="128" y2="256" xlink:href="#gradient-0"/>
    <linearGradient id="gradient-0" bx:pinned="true">
      <stop offset="0" style="stop-color: rgb(6, 2, 8);"/>
      <stop offset="1" style="stop-color: rgb(203, 60, 178);"/>
    </linearGradient>
    <filter id="drop-shadow-filter-1" color-interpolation-filters="sRGB" x="-50%" y="-50%" width="200%" height="200%" bx:preset="drop-shadow 1 0 0 9 0.32 #d302dd">
      <feGaussianBlur in="SourceAlpha" stdDeviation="9"/>
      <feOffset dx="0" dy="0"/>
      <feComponentTransfer result="offsetblur">
        <feFuncA id="spread-ctrl" type="linear" slope="0.64"/>
      </feComponentTransfer>
      <feFlood flood-color="#d302dd"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect style="stroke: rgb(0, 0, 0); fill: url('#gradient-0-0'); stroke-width: 0px; transform-origin: 128px 128px;" x="0" y="0" width="256" height="256" rx="40" ry="40"/>
  <g style="filter: url('#drop-shadow-filter-1'); isolation: isolate;" transform="matrix(1.0046420097351074, 0, 0, 1.0286140441894531, 0, -2.5584280490875244)">
    <g style="filter: none;" transform="matrix(1, 0, 0, 1.192275, 0, -38.412273)">
      <g>
        <rect y="128" width="256" height="4" style="stroke-opacity: 0; stroke: rgb(0, 0, 0); paint-order: markers stroke; fill: rgba(245, 0, 255, 0.984);"/>
        <rect y="131.778" width="256" height="4" style="stroke-opacity: 0; stroke: rgb(0, 0, 0); paint-order: markers stroke; fill: rgba(245, 0, 255, 0.984);"/>
      </g>
      <g transform="matrix(1, 0, 0, 1, 0, 64)">
        <rect y="128" width="256" height="4" style="stroke-opacity: 0; stroke: rgb(0, 0, 0); paint-order: markers; fill: rgba(245, 0, 255, 0.984);"/>
        <rect y="131.778" width="256" height="4" style="stroke-opacity: 0; stroke: rgb(0, 0, 0); paint-order: markers stroke; fill: rgba(245, 0, 255, 0.984);"/>
      </g>
      <g transform="matrix(1, 0, 0, 1, 0, -64)">
        <rect y="128" width="256" height="4" style="stroke-opacity: 0; stroke: rgb(0, 0, 0); paint-order: markers stroke; fill: rgba(245, 0, 255, 0.984);"/>
        <rect y="131.778" width="256" height="4" style="stroke-opacity: 0; stroke: rgb(0, 0, 0); paint-order: markers stroke; fill: rgba(245, 0, 255, 0.984);"/>
      </g>
      <g transform="matrix(1, 0, 0, 1, 0, -96)"/>
      <g transform="matrix(1, 0, 0, 1, 0, -32)">
        <rect y="128" width="256" height="4" style="stroke-opacity: 0; stroke: rgb(0, 0, 0); paint-order: markers stroke; fill: rgba(245, 0, 255, 0.984);"/>
        <rect y="131.778" width="256" height="4" style="stroke-opacity: 0; stroke: rgb(0, 0, 0); paint-order: markers stroke; fill: rgba(245, 0, 255, 0.984);"/>
      </g>
    </g>
    <g style="">
      <g transform="matrix(0, 1, -1, 0, -228.235992, 16.342003)" style="transform-origin: 356.236px 111.658px;">
        <rect y="107.769" width="256" height="4" style="stroke: rgb(0, 0, 0); stroke-opacity: 0; fill: rgba(245, 0, 255, 0.984);" x="228.236"/>
        <rect y="111.547" width="256" height="4" style="stroke: rgb(0, 0, 0); stroke-opacity: 0; fill: rgba(245, 0, 255, 0.984);" x="228.236"/>
      </g>
      <g transform="matrix(0.184501, 1.046358, -0.984807, 0.173648, -136.347, 16.342016)" style="transform-origin: 356.236px 111.658px;">
        <rect y="107.769" width="234.402" height="3.663" style="stroke: rgb(0, 0, 0); stroke-opacity: 0; fill: rgba(245, 0, 255, 0.984);" x="228.236"/>
        <rect y="111.547" width="237.149" height="3.706" style="stroke: rgb(0, 0, 0); paint-order: stroke; stroke-opacity: 0; fill: rgba(245, 0, 255, 0.984);" x="228.236" rx="2" ry="2"/>
      </g>
      <g transform="matrix(-0.184502, 1.046358, -0.984807, -0.173648, -321.502838, 17.971649)" style="transform-origin: 356.236px 111.658px;">
        <rect y="107.769" width="234.402" height="3.663" style="stroke: rgb(0, 0, 0); stroke-opacity: 0; fill: rgba(245, 0, 255, 0.984);" x="228.236"/>
        <rect y="111.547" width="231.655" height="3.62" style="stroke: rgb(0, 0, 0); stroke-opacity: 0; fill: rgba(245, 0, 255, 0.984);" x="228.236"/>
      </g>
    </g>
  </g>
  <path d="M 167.124 91.72 C 168.117 85.455 166.814 80.572 163.217 77.07 C 159.621 73.568 153.693 71.817 145.437 71.817 C 139.971 71.817 135.237 72.528 131.238 73.952 C 127.238 75.376 124.018 77.326 121.578 79.803 C 119.138 82.281 117.493 85.113 116.641 88.302 C 115.873 90.922 115.826 93.227 116.496 95.221 C 117.166 97.215 118.438 98.965 120.311 100.475 C 122.184 101.983 124.573 103.307 127.478 104.447 C 130.383 105.585 133.723 106.581 137.496 107.435 L 151.677 110.852 C 159.864 112.732 166.884 115.237 172.737 118.37 C 178.589 121.501 183.241 125.231 186.689 129.56 C 190.137 133.886 192.326 138.868 193.254 144.506 C 194.184 150.143 193.804 156.465 192.114 163.468 C 189.302 174.516 184.148 183.997 176.652 191.913 C 169.154 199.828 159.713 205.893 148.327 210.106 C 136.941 214.321 123.959 216.428 109.381 216.428 C 94.746 216.428 82.538 214.236 72.755 209.851 C 62.971 205.466 56.176 198.803 52.368 189.863 C 48.561 180.923 48.276 169.618 51.513 155.952 L 92.001 155.952 C 90.937 161.59 91.275 166.288 93.013 170.046 C 94.753 173.805 97.731 176.651 101.946 178.587 C 106.161 180.523 111.372 181.491 117.578 181.491 C 123.273 181.491 128.319 180.723 132.718 179.186 C 137.116 177.648 140.737 175.513 143.583 172.78 C 146.427 170.046 148.319 166.913 149.256 163.383 C 150.022 160.081 149.704 157.247 148.299 154.885 C 146.897 152.521 144.347 150.471 140.651 148.735 C 136.956 146.998 132.104 145.388 126.096 143.908 L 108.881 139.638 C 94.6 136.163 84.072 130.541 77.297 122.767 C 70.523 114.995 68.818 104.475 72.183 91.207 C 74.823 80.387 80.092 70.905 87.987 62.762 C 95.883 54.62 105.581 48.27 117.081 43.715 C 128.581 39.158 140.964 36.881 154.232 36.881 C 167.784 36.881 178.987 39.172 187.837 43.757 C 196.689 48.341 202.847 54.762 206.312 63.02 C 209.777 71.276 210.209 80.842 207.612 91.72 L 167.124 91.72 Z" style="fill: rgb(255, 255, 255);"/>
</svg>
`;


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

