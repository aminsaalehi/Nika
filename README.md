# Hero Particle Ring Section

A full-screen Next.js hero section with an interactive GPU-driven particle system that responds to cursor position on an invisible center ring.

## Features

- **Full-screen dark background** with a 3D particle-based object (sphere with dissolving edges)
- **Dev control panel** (Leva) – in development mode, a collapsible panel on the right for live-tuning all parameters
- **Cursor tracking** – converts pointer position to angle around a center ring
- **Ring attractor** – particles orbit/swirl in response to cursor movement
- **Chromatic aberration** – RGB shift effect that intensifies on interaction
- **Subtle bloom** – soft glow on bright particles
- **Idle motion** – gentle breathing and drift when cursor is still

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Three.js + react-three-fiber + drei
- @react-three/postprocessing (EffectComposer, ChromaticAberration, Bloom)
- GSAP (available for UI timing; not used for particle motion)

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If port 3000 is in use, Next.js will try 3001, 3002, etc. – check the terminal for the actual URL.

**Troubleshooting:** If you see "Internal Server Error" or a black screen:
- Stop any process on port 3000: `lsof -i :3000` then `kill <PID>`
- Restart: `npm run dev`
- Try the URL shown in the terminal (e.g. http://localhost:3001)

## Deploy Online (Share Your Site)

To publish and share your site with a public URL:

1. **Push to GitHub**
   ```bash
   # Create a new repo at github.com/new, then:
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Deploy on Vercel** (recommended for Next.js)
   - Go to [vercel.com/new](https://vercel.com/new)
   - Sign in with GitHub
   - Click **Import** on your repository
   - Keep defaults and click **Deploy**
   - Your site will be live at `https://your-project.vercel.app`

3. **Share the URL** – Send the Vercel URL to anyone; it works on desktop and mobile.

## Configuration

**Development:** Use the Leva control panel (right side) when running `npm run dev` to tune all parameters in real time.

**Static:** Edit `src/components/HeroParticles/hooks/useHeroControls.ts` default values, or the config:

- `PARTICLE_COUNT` – 10k–100k points
- `RING_RADIUS` – ring size
- `SWIRL_STRENGTH` / `ATTRACTOR_STRENGTH` – interaction strength
- `RGB_IDLE` / `RGB_INTERACT` – chromatic aberration intensity
- `PARTICLE_SIZE` – point size
- `BLOOM_INTENSITY` / `BLOOM_THRESHOLD` – bloom effect

## Structure

```
src/components/HeroParticles/
  index.tsx           – Main export, full-screen Canvas
  ParticleField.tsx   – Scene, particles, postprocessing
  config.ts           – All tunable constants
  particles/
    ParticlePoints.tsx – GPU particle system
    shaders.ts        – Vertex/fragment shaders
  effects/
    ChromaticAberrationPass.tsx – Interaction-driven RGB shift
  hooks/
    useRingAngle.ts   – Cursor → ring angle + damping
```
