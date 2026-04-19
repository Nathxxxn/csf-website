# MarketWaveBackground — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a fixed full-screen 3D particle wave background that evokes quantitative market data flows, with a breathing animation and a scroll-driven camera fly-through.

**Architecture:** A Three.js `Points` mesh built from a deformed 2D grid (80×80 = 6 400 points) is animated inside a `@react-three/fiber` Canvas. Scroll progress is captured with a passive `window.scroll` listener stored in a `useRef` so the `useFrame` loop reads it without React re-renders. The Canvas div is `position: fixed`, so it sits behind all page content without affecting layout; it is loaded with Next.js `dynamic` + `ssr: false` to avoid SSR errors.

**Tech Stack:** Next.js 16 (app router), React 19, `three` 0.183, `@react-three/fiber` ≥8.17, `@react-three/drei` ≥9.122, TypeScript, Vitest + @testing-library/react (tests)

---

## File Structure

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `components/ui/market-wave-background.tsx` | Full 3D component (Canvas + particles + scroll logic) |
| Create | `components/ui/__tests__/market-wave-background.test.tsx` | Smoke test (mocked Three.js) |
| Modify | `app/page.tsx` | Dynamic import + render behind page sections |

---

### Task 1: Install `@react-three/fiber` and `@react-three/drei`

**Files:**
- Modify: `package.json` (auto-updated by npm)

- [ ] **Step 1: Install packages**

```bash
npm install @react-three/fiber @react-three/drei --legacy-peer-deps
```

Expected output: packages added, no error. The `--legacy-peer-deps` flag is required because r3f declares `react@^18` peer dep while the project uses React 19.

- [ ] **Step 2: Verify types are present**

`@types/three` is already in `devDependencies` (verified in `package.json`). Confirm the install succeeded:

```bash
node -e "require('@react-three/fiber'); console.log('OK')"
```

Expected output: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @react-three/fiber and @react-three/drei"
```

---

### Task 2: Write the failing smoke test

**Files:**
- Create: `components/ui/__tests__/market-wave-background.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
// components/ui/__tests__/market-wave-background.test.tsx
import { render } from "@testing-library/react"
import { describe, it, expect, vi, beforeAll } from "vitest"

// Mock @react-three/fiber — jsdom cannot run WebGL
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
  useFrame: vi.fn(),
  useThree: () => ({ camera: { position: { set: vi.fn() }, lookAt: vi.fn() } }),
}))

vi.mock("@react-three/drei", () => ({}))

vi.mock("three", () => ({
  Points: class {},
  BufferGeometry: class {},
  Float32BufferAttribute: class {},
  PointsMaterial: class {},
}))

import MarketWaveBackground from "@/components/ui/market-wave-background"

describe("MarketWaveBackground", () => {
  it("renders without throwing", () => {
    const { getByTestId } = render(<MarketWaveBackground />)
    expect(getByTestId("r3f-canvas")).toBeTruthy()
  })

  it("mounts a fixed-position wrapper", () => {
    const { container } = render(<MarketWaveBackground />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.position).toBe("fixed")
    expect(wrapper.style.zIndex).toBe("-1")
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails (file not yet created)**

```bash
npm run test:run -- components/ui/__tests__/market-wave-background.test.tsx
```

Expected: `FAIL` — module `@/components/ui/market-wave-background` not found.

---

### Task 3: Create `market-wave-background.tsx`

**Files:**
- Create: `components/ui/market-wave-background.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/ui/market-wave-background.tsx
"use client"

import { useRef, useEffect, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import type { Points } from "three"

// Grid dimensions — 80 × 80 = 6 400 particles
const COLS = 80
const ROWS = 80
const COUNT = COLS * ROWS

// World-space extent of the grid
const EXTENT_X = 14
const EXTENT_Z = 14

function buildGrid(): { positions: Float32Array; baseY: Float32Array } {
  const positions = new Float32Array(COUNT * 3)
  const baseY = new Float32Array(COUNT)

  let idx = 0
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = (col / (COLS - 1)) * EXTENT_X * 2 - EXTENT_X
      const z = (row / (ROWS - 1)) * EXTENT_Z * 2 - EXTENT_Z

      // Quantitative wave shape: two sine/cosine frequencies + market noise
      const y =
        Math.sin(x * 0.45) * 0.9 +
        Math.cos(z * 0.38) * 0.7 +
        Math.sin((x + z) * 0.25) * 0.4 +
        (Math.random() - 0.5) * 0.28

      positions[idx * 3 + 0] = x
      positions[idx * 3 + 1] = y
      positions[idx * 3 + 2] = z
      baseY[idx] = y
      idx++
    }
  }

  return { positions, baseY }
}

interface WaveParticlesProps {
  scrollRef: React.MutableRefObject<number>
}

function WaveParticles({ scrollRef }: WaveParticlesProps) {
  const pointsRef = useRef<Points>(null)
  const { positions, baseY } = useMemo(() => buildGrid(), [])

  useFrame((state) => {
    if (!pointsRef.current) return

    const attr = pointsRef.current.geometry.attributes.position
    const array = attr.array as Float32Array
    const t = state.clock.elapsedTime

    // Animate Y per-vertex: breathing wave
    for (let i = 0; i < COUNT; i++) {
      const x = array[i * 3]
      const z = array[i * 3 + 2]
      array[i * 3 + 1] =
        baseY[i] +
        Math.sin(x * 0.5 + t * 0.38) * 0.28 +
        Math.cos(z * 0.42 + t * 0.31) * 0.22
    }
    attr.needsUpdate = true

    // Scroll-driven camera: fly through the wave as user scrolls down
    const s = scrollRef.current
    state.camera.position.z = 9 - s * 6
    state.camera.position.y = 1.5 + s * 2.5
    state.camera.lookAt(0, 0, 0)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        {/* @ts-expect-error — r3f bufferAttribute JSX typing varies by version */}
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#e2e2e2"
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  )
}

export default function MarketWaveBackground() {
  const scrollRef = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        backgroundColor: "#050505",
      }}
    >
      <Canvas
        camera={{ position: [0, 1.5, 9], fov: 58 }}
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
      >
        <WaveParticles scrollRef={scrollRef} />
      </Canvas>
    </div>
  )
}
```

**Why each choice:**
- `antialias: false` + `dpr={[1, 1.5]}` — keeps GPU load low; particles look fine without anti-aliasing.
- `sizeAttenuation` — particles shrink with distance, giving real depth.
- `passive: true` on scroll listener — never blocks the main thread.
- `@ts-expect-error` on `bufferAttribute` — r3f's JSX type for this intrinsic differs across minor versions; this is the correct runtime pattern.

---

### Task 4: Run the tests and make them pass

**Files:**
- Read: `components/ui/__tests__/market-wave-background.test.tsx`

- [ ] **Step 1: Run the test**

```bash
npm run test:run -- components/ui/__tests__/market-wave-background.test.tsx
```

Expected output:
```
✓ renders without throwing
✓ mounts a fixed-position wrapper
Test Files  1 passed (1)
```

- [ ] **Step 2: If tests fail, diagnose**

Common failures and fixes:
- `Cannot find module '@react-three/fiber'` → run Task 1 Step 1 again.
- `SyntaxError: Cannot use import statement` → check `vitest.config.ts` has `environment: 'jsdom'` and that `@react-three/fiber` is in `transformIgnorePatterns` exclusion list. Add to `vitest.config.ts`:
  ```ts
  server: {
    deps: {
      inline: ["@react-three/fiber", "@react-three/drei", "three"],
    },
  },
  ```
- [ ] **Step 3: Commit**

```bash
git add components/ui/market-wave-background.tsx components/ui/__tests__/market-wave-background.test.tsx
git commit -m "feat: add MarketWaveBackground 3D particle wave component"
```

---

### Task 5: Integrate into `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Read the current file**

Current content of `app/page.tsx`:
```tsx
import { Hero } from '@/components/landing/hero'
import { Stats } from '@/components/landing/stats'
import { TeamPreview } from '@/components/landing/team-preview'
import { EventsPreview } from '@/components/landing/events-preview'
import { PartnersMarquee } from '@/components/landing/partners-marquee'
import { PartnersCta } from '@/components/landing/partners-cta'
import { getUpcomingEvents, getPastEvents } from '@/lib/data'

export default async function HomePage() {
  const upcoming = (await getUpcomingEvents()).slice(0, 3)
  const past = (await getPastEvents()).slice(0, 3)

  return (
    <>
      <Hero />
      <Stats />
      <TeamPreview />
      <EventsPreview upcoming={upcoming} past={past} />
      <PartnersMarquee />
      <PartnersCta />
    </>
  )
}
```

- [ ] **Step 2: Add dynamic import and render background**

The component must be loaded with `ssr: false` because Three.js / WebGL do not exist in Node.js. Follow the same pattern used by `DottedSurface` in `hero.tsx`.

Replace `app/page.tsx` with:

```tsx
import dynamic from 'next/dynamic'
import { Hero } from '@/components/landing/hero'
import { Stats } from '@/components/landing/stats'
import { TeamPreview } from '@/components/landing/team-preview'
import { EventsPreview } from '@/components/landing/events-preview'
import { PartnersMarquee } from '@/components/landing/partners-marquee'
import { PartnersCta } from '@/components/landing/partners-cta'
import { getUpcomingEvents, getPastEvents } from '@/lib/data'

const MarketWaveBackground = dynamic(
  () => import('@/components/ui/market-wave-background'),
  { ssr: false }
)

export default async function HomePage() {
  const upcoming = (await getUpcomingEvents()).slice(0, 3)
  const past = (await getPastEvents()).slice(0, 3)

  return (
    <>
      <MarketWaveBackground />
      <Hero />
      <Stats />
      <TeamPreview />
      <EventsPreview upcoming={upcoming} past={past} />
      <PartnersMarquee />
      <PartnersCta />
    </>
  )
}
```

- [ ] **Step 3: Run the dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:3000` and check:
- [ ] Black/near-black background visible behind all content
- [ ] White particle wave visible and animating (breathing motion)
- [ ] Scrolling down causes camera to advance through the wave (particles appear to grow / surround the viewer)
- [ ] No console errors in the browser
- [ ] Page sections (Hero, Stats, etc.) are readable in front of the background

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: integrate MarketWaveBackground into homepage"
```

---

## Self-Review

### Spec Coverage

| Requirement | Covered by |
|-------------|-----------|
| `Canvas` fixed, inset 0, z-index -1, bg `#050505` | Task 3 — wrapper div styles |
| No mouse/orbit controls | Task 3 — no `OrbitControls` mounted |
| 6 000–8 000 particles | Task 3 — 80×80 = 6 400 points |
| Grid deformed with sin/cos, not random | Task 3 — `buildGrid()` function |
| Random noise per point | Task 3 — `(Math.random() - 0.5) * 0.28` |
| `PointsMaterial`, size 0.02–0.05 | Task 3 — `size={0.035}` |
| White/light-grey, translucent monochrome | Task 3 — `color="#e2e2e2"`, `opacity={0.55}` |
| `useFrame` wave breathing animation | Task 3 — per-vertex Y update each frame |
| Scroll interaction → camera moves through wave | Task 3 — `scrollRef` + camera position in `useFrame` |
| `export default` | Task 3 — `export default function MarketWaveBackground` |
| Window resize handled | Task 3 — `Canvas` from r3f resizes automatically with its parent div; `position: fixed; inset: 0` keeps parent full-screen |
| SSR safe | Task 5 — `dynamic(..., { ssr: false })` |

### Placeholder Scan

No TBDs, TODOs, or "similar to Task N" patterns present. All code blocks are complete.

### Type Consistency

- `WaveParticlesProps.scrollRef`: `React.MutableRefObject<number>` — used consistently in `WaveParticles` and `MarketWaveBackground`.
- `pointsRef`: typed as `useRef<Points>(null)` using `three`'s `Points` class — matches r3f's expectation.
- `buildGrid()` return type `{ positions: Float32Array; baseY: Float32Array }` — destructured identically in `useMemo`.
