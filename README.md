# SwiftUI Layout Lab

Fumadocs documentation and interactive SwiftUI playgrounds running on TanStack Start.

## Run

```bash
bun install
bun run dev
```

Open `http://127.0.0.1:4173`.

## Add a playground

1. Create the interactive component in `src/playgrounds`.
2. Add its slug, copy, and component to `src/playgrounds/registry.tsx`.
3. Link its guide from `content/docs`.

The homepage and `/playgrounds/$slug` route read the same registry, so no new route file is needed.
