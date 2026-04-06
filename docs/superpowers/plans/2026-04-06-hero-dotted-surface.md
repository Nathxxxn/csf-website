# Hero Dotted Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer les lignes blanches animées derrière le header par un fond `DottedSurface` en Three.js, intégré au Hero et au thème actuel du site.

**Architecture:** Le Hero garde sa structure de contenu actuelle, mais son fond visuel passe d’un SVG `FloatingPaths` local à un composant `DottedSurface` réutilisable dans `components/ui`. Comme `DottedSurface` dépend de `useTheme()` depuis `next-themes`, on ajoute un `ThemeProvider` minimal au layout racine. L’intégration reste limitée au Hero: suppression des anciennes lignes, ajout du nouveau canvas animé, puis voile léger pour préserver la lisibilité.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, next-themes, three, Vitest, Testing Library

---

## File Structure

- **Create:** `components/ui/theme-provider.tsx`
  Responsabilité: encapsuler `next-themes` pour fournir `useTheme()` dans l’app.

- **Create:** `components/ui/dotted-surface.tsx`
  Responsabilité: rendre le fond de points animé Three.js, fidèle au composant fourni mais adapté au Hero et au thème sombre du site.

- **Modify:** `app/layout.tsx`
  Responsabilité: brancher le `ThemeProvider` au niveau racine sans casser le rendu actuel.

- **Modify:** `components/landing/hero.tsx`
  Responsabilité: supprimer `FloatingPaths` et remplacer le fond du Hero par `DottedSurface`.

- **Modify:** `package.json`
  Responsabilité: déclarer `three` en dépendance applicative.

- **Modify:** `package-lock.json`
  Responsabilité: verrouiller l’installation de `three`.

- **Test:** `__tests__/hero.test.tsx`
  Responsabilité: vérifier que le Hero rend `DottedSurface` et n’expose plus l’ancien fond `Background Paths`.

---

### Task 1: Add the failing Hero regression test

**Files:**
- Test: `__tests__/hero.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/components/ui/blur-fade', () => ({
  BlurFade: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/ui/animated-shiny-text', () => ({
  AnimatedShinyText: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/ui/liquid-glass-button', () => ({
  LiquidButton: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/motion-button', () => ({
  default: ({ label, ...props }: { label: string } & React.ComponentProps<'button'>) => (
    <button {...props}>{label}</button>
  ),
}))

vi.mock('@/components/ui/dotted-surface', () => ({
  DottedSurface: ({ className }: { className?: string }) => (
    <div data-testid="dotted-surface" className={className} />
  ),
}))

describe('Hero', () => {
  it('uses the dotted surface background instead of the old path lines', async () => {
    const { Hero } = await import('@/components/landing/hero')

    render(<Hero />)

    expect(screen.getByTestId('dotted-surface')).toBeInTheDocument()
    expect(screen.queryByText('Background Paths')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- __tests__/hero.test.tsx`

Expected: FAIL because `Hero` still renders `FloatingPaths` and does not import `DottedSurface`.

- [ ] **Step 3: Commit the red test**

```bash
git add __tests__/hero.test.tsx
git commit -m "test: add hero background regression test"
```

---

### Task 2: Add a minimal ThemeProvider for next-themes

**Files:**
- Create: `components/ui/theme-provider.tsx`
- Modify: `app/layout.tsx`
- Test: `__tests__/hero.test.tsx`

- [ ] **Step 1: Create the provider component**

```tsx
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      forcedTheme="dark"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

- [ ] **Step 2: Wrap the app layout with ThemeProvider**

Replace `app/layout.tsx` body tree with:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SiteChrome } from '@/components/layout/site-chrome'
import { PageLoader } from '@/components/ui/page-loader'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/ui/theme-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'CentraleSupélec Finance',
  description: "Association étudiante de finance à CentraleSupélec : événements, formations et réseau.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <PageLoader />
          <SiteChrome>{children}</SiteChrome>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Run the targeted Hero test**

Run: `npm run test:run -- __tests__/hero.test.tsx`

Expected: still FAIL, but only because `Hero` has not yet been switched to `DottedSurface`.

- [ ] **Step 4: Commit provider setup**

```bash
git add app/layout.tsx components/ui/theme-provider.tsx
git commit -m "feat: add app theme provider"
```

---

### Task 3: Install three and add the DottedSurface component

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `components/ui/dotted-surface.tsx`
- Test: `__tests__/hero.test.tsx`

- [ ] **Step 1: Install Three.js**

Run: `npm install three`

Expected: `package.json` and `package-lock.json` include `three`.

- [ ] **Step 2: Create the dotted surface component**

```tsx
'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils'

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight
    const isDark = theme !== 'light'

    const SEPARATION = 150
    const AMOUNTX = 40
    const AMOUNTY = 60

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(isDark ? 0x060606 : 0xffffff, 2000, 10000)

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000)
    camera.position.set(0, 355, 1220)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(scene.fog.color, 0)
    container.appendChild(renderer.domElement)

    const geometry = new THREE.BufferGeometry()
    const positions: number[] = []
    const colors: number[] = []

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2

        positions.push(x, 0, z)

        if (isDark) {
          colors.push(190 / 255, 190 / 255, 190 / 255)
        } else {
          colors.push(0.12, 0.12, 0.12)
        }
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 8,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.42 : 0.3,
      sizeAttenuation: true,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    let count = 0
    let animationId = 0

    const animate = () => {
      animationId = window.requestAnimationFrame(animate)

      const positionAttribute = geometry.attributes.position
      const positionArray = positionAttribute.array as Float32Array

      let i = 0
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const index = i * 3
          positionArray[index + 1] =
            Math.sin((ix + count) * 0.3) * 50 + Math.sin((iy + count) * 0.5) * 50
          i++
        }
      }

      positionAttribute.needsUpdate = true
      renderer.render(scene, camera)
      count += 0.1
    }

    const handleResize = () => {
      const nextWidth = container.clientWidth || window.innerWidth
      const nextHeight = container.clientHeight || window.innerHeight

      camera.aspect = nextWidth / nextHeight
      camera.updateProjectionMatrix()
      renderer.setSize(nextWidth, nextHeight)
    }

    window.addEventListener('resize', handleResize)
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.cancelAnimationFrame(animationId)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [theme])

  return (
    <div
      ref={containerRef}
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      {...props}
    />
  )
}
```

- [ ] **Step 3: Run the targeted Hero test**

Run: `npm run test:run -- __tests__/hero.test.tsx`

Expected: still FAIL, because the Hero still imports and renders `FloatingPaths`.

- [ ] **Step 4: Commit the new background primitive**

```bash
git add package.json package-lock.json components/ui/dotted-surface.tsx
git commit -m "feat: add dotted surface background component"
```

---

### Task 4: Replace FloatingPaths in the Hero

**Files:**
- Modify: `components/landing/hero.tsx`
- Test: `__tests__/hero.test.tsx`

- [ ] **Step 1: Remove FloatingPaths and import DottedSurface**

Replace the top of `components/landing/hero.tsx` with:

```tsx
"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import MotionButton from "@/components/ui/motion-button";
```

Delete the entire `FloatingPaths` component and its `useState` / `useEffect` imports.

- [ ] **Step 2: Replace the Hero background layer**

Replace the old background block:

```tsx
<div className="absolute inset-0">
  <FloatingPaths position={1} bloomDelay={PATHS_BLOOM_START_MS} />
  <FloatingPaths position={-1} bloomDelay={PATHS_BLOOM_START_MS} />
</div>
```

with:

```tsx
<div className="absolute inset-0">
  <DottedSurface className="absolute inset-0 opacity-70" />
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_40%),linear-gradient(to_bottom,rgba(6,6,6,0.18),rgba(6,6,6,0.82))]" />
</div>
```

- [ ] **Step 3: Remove dead constants**

Delete:

```tsx
const PATHS_BLOOM_START_MS = 700
const PATHS_BLOOM_DURATION = 0.8
```

Keep the text animation delays and CTA class constants.

- [ ] **Step 4: Run the targeted Hero test**

Run: `npm run test:run -- __tests__/hero.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit the Hero swap**

```bash
git add components/landing/hero.tsx __tests__/hero.test.tsx
git commit -m "feat: replace hero path lines with dotted surface"
```

---

### Task 5: Full verification

**Files:**
- Verify only

- [ ] **Step 1: Run the full test suite**

Run: `npm run test:run`

Expected: all tests pass with no new failures.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: build succeeds. The existing Next.js warning about `middleware` deprecation may still appear, but no new errors should be introduced.

- [ ] **Step 3: Commit final verification state**

```bash
git add app/layout.tsx components/ui/theme-provider.tsx components/ui/dotted-surface.tsx components/landing/hero.tsx package.json package-lock.json __tests__/hero.test.tsx
git commit -m "feat: add dotted surface hero background"
```

---

## Self-Review

- **Spec coverage:** The plan covers the exact requested changes: suppress old white lines, add `DottedSurface`, integrate it in the Hero, and support `useTheme()` through a proper provider.
- **Placeholder scan:** No `TODO`, `TBD`, or vague “handle appropriately” steps remain.
- **Type consistency:** `DottedSurface`, `ThemeProvider`, and `Hero` imports/paths are consistent across tasks.
