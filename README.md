# DragonForge

Public brand and manifesto site for DragonForge — a private community for the next generation of GPs and LPs.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
```

## Where to edit

- **Copy** (hero, manifesto, principles, footer): `src/lib/copy.ts`
- **Site colors** (navy, ivory, red, solar): `:root` in `src/app/globals.css`
- **Hero sun visual**: `src/components/hero/SolarForge.tsx` (layers, particles, motion) and `src/components/hero/shaders.ts` (photosphere / corona)
- **Hero layout and wordmark**: `src/components/hero/Hero.tsx`
