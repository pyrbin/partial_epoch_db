# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Static build**: `npm run build` (exports to `./out` directory)
- **Production server**: `npm start` (for SSR mode, not used with static export)
- **Linting**: `npm run lint`
- **Build index**: `npm run build-index` (custom build script)

The development server runs on http://localhost:3000 and supports hot reloading.

### Static Site Generation
This app is configured for **static export only**. The `npm run build` command generates a complete static website in the `./out` directory that can be served from any static hosting service. The Next.js config includes:
- `output: 'export'` for static site generation
- `trailingSlash: true` for better static hosting compatibility
- `images: { unoptimized: true }` since static export doesn't support Next.js Image Optimization

## Project Architecture

This is a Next.js 15.4.6 application using the App Router architecture with the following key characteristics:

### Framework Stack
- **Next.js**: App Router with React 19.1.0
- **TypeScript**: Strict mode enabled with ES2017 target
- **Styling**: Tailwind CSS v4 with PostCSS integration
- **Fonts**: Geist Sans and Geist Mono fonts via `next/font/google`

### Project Structure
- `src/app/`: App Router pages and layouts
  - `layout.tsx`: Root layout with font configuration and metadata
  - `page.tsx`: Homepage component
  - `globals.css`: Global styles with Tailwind CSS imports and CSS custom properties
- `public/`: Static assets (SVG icons and images)
- Path aliases: `@/*` maps to `./src/*`

### Styling System
- Uses Tailwind CSS v4 with the new `@import "tailwindcss"` syntax
- CSS custom properties for theme colors (background/foreground)
- Built-in dark mode support via `prefers-color-scheme`
- Responsive design with mobile-first approach using Tailwind's responsive prefixes

### TypeScript Configuration
- Strict TypeScript with Next.js plugin integration
- JSX preservation for Next.js compilation
- Module resolution set to "bundler" for optimal Next.js compatibility

The codebase follows Next.js 15 conventions and is scaffolded from `create-next-app` with TypeScript and Tailwind CSS.