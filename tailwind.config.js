const plugin = require("tailwindcss/plugin");


module.exports = {
  darkMode: 'class',
  purge: {
    enabled: true,
    content: [
      "./src/**/*.vue",
      "./src/**/*.js",
      "./src/**/*.jsx",
      "./src/**/*.html",
      "./src/**/*.pug",
      "./src/**/*.md",
    ],
    safelist: [
      "body",
      "html",
      "img",
      "a",
      "ol",
      "ul",
      "g-image",
      "g-image--lazy",
      "g-image--loaded",
    ],
  },
  theme: {
    fontFamily: {
      sans: ['Fira Sans', 'Inter', 'Graphik', 'sans-serif'],
      serif: ['Lato', 'Merriweather', 'serif'],
    },
    extend: {
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      typography: (theme) => ({
        light: {
          css: {
            color: theme('colors.gray.700'),
            a: {
              color: theme('colors.blue.500'),
              '&:hover': {
                color: theme('colors.blue.700')
              },
              code: { color: theme('colors.blue.400') }
            },
            code: { color: theme('colors.pink.500') },
            'blockquote p:first-of-type::before': false,
            'blockquote p:last-of-type::after': false
          }
        },
        dark: {
          css: {
            color: theme('colors.white'),
            a: {
              color: theme('colors.indigo.400'),
              '&:hover': {
                color: theme('colors.indigo.600')
              },
              code: { color: theme('colors.blue.400') }
            },
            blockquote: {
              borderLeftColor: theme('colors.gray.100'),
              color: theme('colors.gray.300')
            },
            figcaption: {
              color: theme('colors.white')
            },
            hr: { borderColor: theme('colors.gray.700') },
            ol: {
              li: {
                '&:before': { color: theme('colors.gray.200') }
              }
            },
            ul: {
              li: {
                '&:before': { backgroundColor: theme('colors.gray.200') }
              }
            },
            strong: { color: theme('colors.gray.300') },
            thead: {
              color: theme('colors.gray.100')
            },
            tbody: {
              tr: {
                borderBottomColor: theme('colors.gray.700')
              }
            }
          }
        }
      }),
    }
  },
  variants: {
    extend: {
      typography: ['dark']
    }
  },
  plugins: [require("@tailwindcss/typography"),
  require('@tailwindcss/line-clamp')],
};
