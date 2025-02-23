# Edward Vaisman's Website

Interactive personal website built with Astro and hosted on Cloudflare Pages. Features a macOS-inspired terminal interface with integrated LLM capabilities for resume queries and interaction. Looking for my resume? Head on over to [my resume repository](https://github.com/eddyv/awesome_cv/blob/main/cv.pdf)

## 🚀 Project Structure

```sh
/
├── public/                   # Static assets served as-is
│   └── favicon.svg          # Browser favicon
├── src/
│   ├── assets/              # Project assets (images, fonts, etc.)
│   │   └── wallpapers/      # Background wallpaper images
│   ├── components/          # Reusable UI components
│   ├── hooks/              # React custom hooks
│   ├── icons/              # Custom SVG icons
│   ├── layouts/            # Page layout templates
│   ├── middleware/         # Request middleware (rate limiting, CORS)
│   ├── pages/             # Route components and API endpoints
│   │   └── api/           # API route handlers
│   │       └── llm/       # Language model integration endpoints
│   ├── styles/            # Global styles and Tailwind config
│   └── utils/             # Shared utility functions
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project:

| Command              | Action                                      |
| :------------------- | :------------------------------------------ |
| `bun install`        | Installs dependencies                       |
| `bun run dev`        | Starts local dev server at `localhost:4321` |
| `bun run build`      | Build your production site                  |
| `bun run preview`    | Preview your build locally with Wrangler    |
| `bun run deploy`     | Deploy to Cloudflare Pages                  |
| `bun run format`     | Format code with Prettier                   |
| `bun run cf-typegen` | Generate Cloudflare types                   |

## 🛠️ Technologies

- [Astro](https://astro.build)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Cloudflare Pages](https://pages.cloudflare.com)
- [Google Gemini](https://ai.google.dev/gemini-api/docs#node.js)
