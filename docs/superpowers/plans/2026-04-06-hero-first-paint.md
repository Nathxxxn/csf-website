# Hero First Paint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supprimer la sensation d'attente avant l'affichage du hero tout en conservant une animation d'entrée légère.

**Architecture:** Le correctif reste local au composant `Hero`. Les délais d'animation sont centralisés dans un objet exporté afin de rendre la configuration testable et d'ajouter un garde-fou simple contre la réintroduction de délais trop longs.

**Tech Stack:** Next.js App Router, React 19, TypeScript, framer-motion, Vitest, Testing Library

---

### Task 1: Verrouiller le comportement attendu par test

**Files:**
- Modify: `__tests__/hero.test.tsx`
- Test: `__tests__/hero.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it('keeps hero entrance delays close to first paint', async () => {
  const { HERO_ANIMATION_DELAYS } = await import('@/components/landing/hero')

  expect(HERO_ANIMATION_DELAYS.badge).toBeLessThanOrEqual(0.02)
  expect(HERO_ANIMATION_DELAYS.title).toBeLessThanOrEqual(0.04)
  expect(HERO_ANIMATION_DELAYS.subtitle).toBeLessThanOrEqual(0.12)
  expect(HERO_ANIMATION_DELAYS.buttons).toBeLessThanOrEqual(0.18)
  expect(HERO_ANIMATION_DELAYS.titleWordStep).toBeLessThanOrEqual(0.05)
  expect(HERO_ANIMATION_DELAYS.titleLetterStep).toBeLessThanOrEqual(0.02)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- __tests__/hero.test.tsx`
Expected: FAIL because `HERO_ANIMATION_DELAYS` is missing or because current delays exceed the thresholds

### Task 2: Réduire les délais du hero

**Files:**
- Modify: `components/landing/hero.tsx`
- Test: `__tests__/hero.test.tsx`

- [ ] **Step 1: Write minimal implementation**

```tsx
export const HERO_ANIMATION_DELAYS = {
  badge: 0,
  title: 0.02,
  subtitle: 0.08,
  buttons: 0.14,
  titleWordStep: 0.035,
  titleLetterStep: 0.012,
} as const
```

Utiliser cet objet dans les transitions du hero et supprimer le délai d'opacité redondant du conteneur du titre.

- [ ] **Step 2: Run test to verify it passes**

Run: `npm run test:run -- __tests__/hero.test.tsx`
Expected: PASS

- [ ] **Step 3: Run one broader safety check**

Run: `npm run test:run -- __tests__/hero.test.tsx __tests__/navbar.test.tsx`
Expected: PASS
