const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
	content: ['./src/**/*.{html,js}'],
	theme: {
		extend: {
			fontFamily: {
				inter: ["'Inter'", ...defaultTheme.fontFamily.sans],
			},
			screens: {
				lg: '1045px',
			},
		},
	},
	plugins: [require('@tailwindcss/forms')],
};
