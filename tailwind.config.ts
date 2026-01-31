import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
        colors: {
        'rich-black': '#000F81', // Note: Image says 000F81, but visual is deep black
        'dark-green': '#032221',
        'mountain-meadow': '#2CC295',
        'caribbean-green': '#00DF81',
        'anti-flash-white': '#F1F7F6',
      },
      fontFamily: {
        axiforma: ['Axiforma', 'sans-serif'], // The font shown in the image
      },
  } },
  plugins: [],
}
export default config