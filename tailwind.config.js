/** @type {import('tailwindcss').Config} */

// tailwind.config.js
module.exports = {
  content: ["./**/*.{html,js}"], // Caminhos onde Tailwind deve procurar classes
  theme: {
    extend: {
      backgroundImage: {
        "home": "url('/assets/bg.png')" // Caminho para a imagem de fundo
      }
    }
  },
  plugins: [],
}
