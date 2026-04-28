import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#173054',
          sub: '#4b628a',
          line: '#d9e5ff'
        }
      },
      boxShadow: {
        hero: '0 18px 40px rgb(32 73 177 / 25%)'
      }
    }
  },
  plugins: []
};

export default config;
