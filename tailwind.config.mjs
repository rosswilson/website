import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,md}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Fira Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        serif: [
          'Libre Baskerville',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'serif',
        ],
      },
      colors: {
        ink: '#15171A',
      },
    },
  },
  plugins: [typography],
};
