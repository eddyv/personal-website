# AGENTS.md

This document provides guidance for AI coding agents working in this repository.

## Project Overview

A personal website built with Astro 5.x (SSR mode), React 19.x, TypeScript, and Tailwind CSS 4.x. Deployed to Cloudflare Pages using Bun as the package manager.

## Build/Lint/Test Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start local dev server |
| `bun run build` | Type check and build (`astro check && astro build`) |
| `bun run preview` | Preview build with Wrangler Pages |
| `bun run deploy` | Build and deploy to Cloudflare Pages |
| `bun run check` | Lint check via Ultracite/Biome |
| `bun run fix` | Auto-fix lint/format issues |
| `bun run clean` | Remove `./dist` and `./.astro` directories |
| `bun run cf-typegen` | Generate Cloudflare Worker types |

### Testing

No test suite is currently configured. The pre-commit hook runs `ultracite fix` only.

### Running a Single Test

Not applicable - no test files exist in this codebase.

## Code Style Guidelines

This project uses **Ultracite**, a zero-config Biome preset for linting and formatting. Run `bun run fix` before committing.

### Imports

- Use path aliases consistently: `@components/`, `@hooks/`, `@utils/`, `@layouts/`, `@pages/`, `@middleware/`, `@assets/`, `@icons/`
- Prefer named imports over default imports
- Use `type` keyword for type-only imports: `import type { APIRoute } from "astro"`
- Order imports: external packages first, then internal path aliases

```typescript
import { useState, useCallback } from "react";
import type { APIRoute } from "astro";
import { Terminal } from "@components/terminal";
import { useTerminalCommands } from "@hooks/use-terminal-commands";
```

### Formatting

- **Quotes**: Double quotes for strings
- **Semicolons**: Required
- **Indentation**: 2 spaces
- **JSX Attributes**: Sorted alphabetically
- Run `bun run fix` to auto-format

### TypeScript

- Use explicit types for function parameters and return values
- Prefer `unknown` over `any` when type is genuinely unknown
- Use const assertions (`as const`) for immutable values
- Leverage type narrowing instead of type assertions
- Define component props as interface named `Props`

```typescript
interface Props {
  title: string;
  count?: number;
}

export function Component({ title, count = 0 }: Props): React.ReactElement {
  // ...
}
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `terminal-utils.tsx`, `use-terminal-commands.ts` |
| Components | PascalCase | `Terminal`, `LoadingDots` |
| Hooks | camelCase with `use` prefix | `useTerminalCommands`, `useTypingAnimation` |
| Functions/Variables | camelCase | `renderPrompt`, `executeCommand` |
| Types/Interfaces | PascalCase | `CommandOutput`, `RateLimitConfig` |
| Constants | camelCase | `defaultTimeout`, `maxRetries` |

### React Patterns

- Use function components (no class components)
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays
- Use `useCallback` for memoized event handlers
- Use `useRef` for DOM element references
- Default exports for main components, named exports for utilities

```typescript
export function Terminal({ initialCommand }: Props): React.ReactElement {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // ...
  }, []);

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Error Handling

- Use try-catch blocks in async handlers
- Check error type with `instanceof Error`
- Return proper HTTP status codes (200, 429, 500)
- Prefer early returns over nested conditionals
- Throw Error objects with descriptive messages

```typescript
try {
  const result = await fetchData();
  return new Response(JSON.stringify(result), { status: 200 });
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return new Response(JSON.stringify({ error: message }), { status: 500 });
}
```

### Async/Promises

- Always `await` promises in async functions
- Use `async/await` syntax instead of promise chains
- Handle errors with try-catch blocks
- Don't use async functions as Promise executors

### Security

- Add `rel="noopener"` when using `target="_blank"`
- Avoid `dangerouslySetInnerHTML` unless necessary
- Never use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)

### Accessibility

- Provide meaningful alt text for images
- Use proper heading hierarchy
- Add labels for form inputs
- Include keyboard event handlers alongside mouse events
- Use semantic HTML (`<button>`, `<nav>`) over divs with roles

## Project Structure

```
src/
├── components/     # UI components (.astro and .tsx)
├── hooks/          # Custom React hooks
├── icons/          # Custom SVG icons
├── layouts/        # Page layout templates
├── middleware/     # Request middleware (CORS, rate limiter)
├── pages/          # Route components and API endpoints
├── styles/         # Global CSS
└── utils/          # Utility functions
```

## Architecture Notes

- **Astro components** (`.astro`) for static UI
- **React components** (`.tsx`) for interactive features with `client:load` directive
- **Middleware chain** uses Astro's `sequence()` function
- **Environment variables** typed via Astro's `envField` schema in `astro.config.mjs`
- **API routes** use Astro's `APIRoute` type for server-side endpoints

## Pre-commit Hook

The Husky pre-commit hook automatically runs `ultracite fix` on staged files. Ensure your changes pass linting before committing.

## When to Use Manual Review

Biome catches most issues automatically. Focus manual attention on:

1. Business logic correctness
2. Meaningful naming for functions, variables, and types
3. Architecture decisions (component structure, data flow)
4. Edge cases and error states
5. User experience and accessibility
6. Documentation for complex logic


# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun x ultracite fix`
- **Check for issues**: `bun x ultracite check`
- **Diagnose setup**: `bun x ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `bun x ultracite fix` before committing to ensure compliance.
