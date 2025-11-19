import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // I added this one just in case
  ],
  theme: {
    extend: {
      // --- This is the new animation you're adding ---
      transitionTimingFunction: {
        'bouncy': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }
      // --- End of new animation ---
    },
  },
  plugins: [],
}
export default config