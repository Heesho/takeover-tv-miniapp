import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'retro-pink': '#ff00ff',
        'retro-cyan': '#00ffff',
        'retro-bg': '#000000',
        'retro-container': '#111111',
      },
      fontFamily: {
        'retro': ['VT323', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
