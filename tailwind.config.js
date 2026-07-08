/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Jetons pilotés par variables CSS (voir globals.css) : une seule classe
        // Tailwind (bg-noir, text-or, border-or/20...) sert les deux thèmes.
        noir: 'rgb(var(--noir) / <alpha-value>)',
        'noir-2': 'rgb(var(--noir-2) / <alpha-value>)',
        'noir-3': 'rgb(var(--noir-3) / <alpha-value>)',
        or: 'rgb(var(--or) / <alpha-value>)',
        'or-light': 'rgb(var(--or-light) / <alpha-value>)',
        creme: 'rgb(var(--creme) / <alpha-value>)',
        'gris-chaud': 'rgb(var(--gris-chaud) / <alpha-value>)',
        'gris-sombre': 'rgb(var(--gris-sombre) / <alpha-value>)',
        'gris-tres-sombre': 'rgb(var(--gris-tres-sombre) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        wider: '0.15em',
        widest: '0.25em',
      },
    },
  },
  plugins: [],
}
