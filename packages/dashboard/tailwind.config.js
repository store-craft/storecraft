import colors from 'tailwindcss/colors.js'
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import scrollbar from 'tailwind-scrollbar'

import resolveConfig from "tailwindcss/resolveConfig.js"
import screens from './screens.js'

const config = {
	darkMode: 'class',
	content: [
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./content/**/*.mdx",
		"./src/comps/**/*.{js,ts,jsx,tsx}",
		"./src/**/*.{js,ts,jsx,tsx}",
		"./src/admin/**/*.{js,ts,jsx,tsx}",
		"./src/docs/**/*.{js,ts,jsx,tsx}",
		"./styles/*.scss",
	  ],
	theme: {
		screens: screens,
		extend: {
			screens: {
				'm': {'raw': '(hover: hover)'},
			},
			backgroundImage: {
				'bubbles': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100'  xmlns='http://www.w3.org/2000/svg'  %3E%3Cpath fill='%239C92AC' fill-opacity='0.3' d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z'  fill-rule='evenodd'/%3E%3C/svg%3E\")",
				'bubbles-op-low': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.43' fill-rule='evenodd'/%3E%3C/svg%3E\")",
				'bubbles-2': "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd' %3E%3Cg fill='%2301303f' fill-opacity='0.09' %3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
			},
			fontFamily: {
				Oswald: ["Oswald", "sans-serif"],
				erica_one: ["Erica_One", "sans-serif"],
				heb_1: ["sans-serif"],
				PRESS_START: ["PRESS_START", "sans-serif"],
				// admin: ['Inter', 'Open Sans', 'sans-serif', 'heb_1'],
				open_sans: ['Open Sans', 'sans-serif'],
				inter: ['Inter', 'sans-serif']
			},		
			transitionProperty: {
				'height': 'height',
				'max-height': 'max-height',
				'max-width': 'max-width',
			},
			animation: {
				'spin-slow': 'spin 0.3s linear',
				'fadein': 'fadein 0.5s linear',
				'fadeout': 'fadeout 0.6s linear',
				'ltr-linear-infinite': 'move-bg 10s linear infinite',
        'waving-hand': 'wave 2s linear infinite',
        'wave': 'spin2 2s ease-out infinite',
			},
			keyframes: {
				'spin2': {
					'0%' : { transform : 'rotate(-10.0deg) scale(2)'},
					'20%' : { transform : 'rotate(20.0deg) translateY(-10px) scale(2.2)'},
					'40%' : { transform : 'rotate(0.0deg) translateY(-4px) scale(2)'},
					'60%' : { transform : 'rotate(-10.0deg) translateY(-5px) scale(1.4)'},
					'100%' : { transform : 'rotate(0.0deg) translateY(-0px) scale(0.8)'},
				},
				'fadein': {
					'0%' : { opacity : 0},
					'100%' : { opacity : 1},
				},
				'fadeout': {
					'0%' : { opacity : 1},
					'100%' : { opacity : 0},
				},
				'move-bg': {
					'0%': { 'background-position': '0 0' },
					'100%': { 'background-position': '100px 100px' },
				},
        wave: {
          '0%': { transform: 'rotate(0.0deg)' },
          '10%': { transform: 'rotate(14deg)' },
          '20%': { transform: 'rotate(-8deg)' },
          '30%': { transform: 'rotate(14deg)' },
          '40%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(10.0deg)' },
          '60%': { transform: 'rotate(0.0deg)' },
          '100%': { transform: 'rotate(0.0deg)' },
        },
        astro: {
          '0%': { transform: 'rotate(0.0deg)' },
          '10%': { transform: 'rotate(14deg)' },
          '20%': { transform: 'rotate(-8deg)' },
          '30%': { transform: 'rotate(14deg)' },
          '40%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(10.0deg)' },
          '60%': { transform: 'rotate(0.0deg)' },
          '100%': { transform: 'rotate(0.0deg)' },
        },
			},
			colors: {
				'typo' : colors.gray['800'],
				'malibu': {
					'50': '#ebfeff',
					'100': '#cdfaff',
					'200': '#a1f3ff',
					'300': '#51e5ff',
					'400': '#1ad2f6',
					'500': '#00b5dc',
					'600': '#018fb9',
					'700': '#097295',
					'800': '#115d79',
					'900': '#134c66',
				},
				'kf': {
					'50': '#f5f1ff',
					'100': '#ede5ff',
					'200': '#deceff',
					'300': '#c6a6ff',
					'400': '#ad74ff',
					'500': '#973cff',
					'600': '#8f15ff',
					'700': '#8403fe',
					'800': '#6e02d5',
					'900': '#440381',
				},
			}
		},
	},

	variants: {},
	plugins: [
		tailwindcss,
		autoprefixer,
		scrollbar
		// require( 'precss' ),
		// require('@tailwindcss/line-clamp'),
		// require('tailwind-scrollbar'),
	]
}

export default resolveConfig(config);


// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

