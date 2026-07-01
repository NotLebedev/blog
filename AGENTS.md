# AGENTS.md

Personal blog and photo site built with SolidJS + Vite. No test suite - verification is lint and typecheck only.

## Setup

Requires Nix. Devshell provides Node 25, TypeScript, and `cog` (conventional commits linter).

## Commands

| Task | Command |
|------|---------|
| Lint | `npx eslint src plugin` |
| Fix lint errors | `npx eslint src plugin --fix` |
| Typecheck | `tsc` |

Run lint then typecheck before committing. Use 

## Commit convention

CI enforces [Conventional Commits](https://www.conventionalcommits.org/) via `cocogitto` (`cog check`).

## Virtual modules (codegen)

The custom Vite plugin (`plugin/plugin.ts`) generates two virtual modules at build/dev time by scanning content directories:

- `virtual:data` — exports `photos: ImageInfo[]` and `posts: PostInfo[]`
- `virtual:photo` — type-only helper used in `info.tsx` files
- `virtual:post` — type-only helper used in `post.tsx` files

Type declarations live in `src/Virtual/`.

App can read this information from `src/Data/Database.ts`

## Content authoring

### Photos

Each photo lives in `src/Content/photos/<NNNN>-<slug>/`:
- `image.jpg` — source image
- `info.tsx` — metadata file, must call `photo({...})` from `virtual:photo`

Directory name prefix (`NNNN-`) controls sort order (descending). The clean slug (without the numeric prefix) becomes the photo `id` at runtime.

Example `info.tsx`:
```tsx
import photo from "virtual:photo";

photo({
  name: "Title",
  camera: "Sony α7c",
  tags: ["digital", "architecture", "moscow"],
});
```

Valid tag values are defined in `src/Virtual/photo.d.ts`.

### Blog posts

Each post lives in `src/Content/blogs/<slug>/`:
- `post.tsx` — calls `post({...})` from `virtual:post` at the top, then exports a default SolidJS component

Posts with `status: "draft"` are visible in dev but excluded from production builds.

## Image processing

`sharp` handles image resizing. In dev, images are served on-the-fly via a Vite middleware at `/__images__/<id>/{full,preview}.jpg`. In production builds, Vite emits them as assets under `assets/images/<id>/`.

SVGs imported as components are processed by `vite-plugin-solid-svg` with SVGO (config in `svgo.config.mjs`), defined in `src/Icons` and imported as components in `src/Components/Devicons.ts`.

## Routing

Defined in `src/index.tsx`. Routes:
- `/` — Home (no header, no footer)
- `/photo` — photo gallery
- `/photo/:id` — single photo (no header)
- `/blog` — blog list
- `/about` — about page

## Tech stack quirks

- **SolidJS**, not React. Reactivity model is signals-based. Do not use React patterns (no `useState`, `useEffect` only when necessary).
- JSX is configured with `jsxImportSource: "solid-js"` — no React import needed.
- CSS Modules are used throughout (`*.module.css`). TypeScript support via `typescript-plugin-css-modules`.
- `strict: true` TypeScript. `noEmit: true` — `tsc` is typecheck only, not a build step.
