# Contact Partners Intro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sticky, scroll-driven partners intro at the top of the contact page, using real partner logos and preserving the existing contact form behavior.

**Architecture:** Convert the contact route back to a Server Component so it can load partners via `getPartners()`, move the current form into a focused client component, and introduce a new client UI component that renders the scroll-driven sticky hero. Keep the prompt's interaction model, but re-theme it to the current monochrome site and simplify the mobile version while preserving the sticky pattern.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, TypeScript, shadcn/ui primitives already in repo, Vitest + Testing Library

---

### Task 1: Refactor contact page around server data + isolated client form

**Files:**
- Create: `components/contact/contact-form.tsx`
- Modify: `app/contact/page.tsx`
- Test: `npm run build`

- [ ] **Step 1: Move the current interactive form into a dedicated client component**

Create `components/contact/contact-form.tsx` with the existing `useState`, `toast`, `sendContactEmail`, and submit logic from `app/contact/page.tsx`. Keep the current fields, copy, validation, and button text unchanged.

- [ ] **Step 2: Convert the route to a Server Component**

Update `app/contact/page.tsx` to:

```tsx
import { getPartners } from '@/lib/data'
import { ContactForm } from '@/components/contact/contact-form'

export default async function ContactPage() {
  const partners = await getPartners()
  return (...)
}
```

The page should stop using `useState` and stop declaring `"use client"`.

- [ ] **Step 3: Keep the existing contact intro + form layout intact below the new hero area**

Render the future sticky partners intro first, then the current editorial copy ("Parlons-en.") and the refactored `ContactForm`.

- [ ] **Step 4: Run a route-level verification**

Run: `npm run build`
Expected: the contact route compiles as a server page and no client/server boundary errors appear.

- [ ] **Step 5: Commit the refactor checkpoint**

```bash
git add app/contact/page.tsx components/contact/contact-form.tsx
git commit -m "refactor: split contact page server data and client form"
```

### Task 2: Build the sticky partners intro component

**Files:**
- Create: `components/ui/scrolling-partners-intro.tsx`
- Modify: `lib/types.ts`
- Test: `__tests__/scrolling-partners-intro.test.tsx`

- [ ] **Step 1: Add focused props support for the partners intro**

If needed, reuse the existing `Partner` type from `lib/types.ts`. Do not add a new duplicate type.

- [ ] **Step 2: Write a failing component test**

Create `__tests__/scrolling-partners-intro.test.tsx` that renders the component with a small partner list and checks:

```tsx
it('renders partner logos with name fallbacks and center copy', () => {
  // expect partner names to be present
  // expect the central editorial copy to be present
})
```

- [ ] **Step 3: Run the failing test**

Run: `npm run test:run -- __tests__/scrolling-partners-intro.test.tsx`
Expected: FAIL because the component does not exist yet.

- [ ] **Step 4: Implement the sticky hero component**

Create `components/ui/scrolling-partners-intro.tsx` as a client component that:

```tsx
interface ScrollingPartnersIntroProps {
  partners: Partner[]
}
```

Implementation requirements:
- listen to `window.scrollY`
- derive normalized progress from scroll
- compute orbital radius from progress
- place partner cards around the center using angle math
- render logos from `partner.logo`
- render partner name fallback text inside the card if the image fails
- reveal central text after a threshold
- use dark site colors, subtle borders, and rounded logo cards
- reduce radius, card size, and section height on mobile

- [ ] **Step 5: Make the test pass with the minimal complete implementation**

Run: `npm run test:run -- __tests__/scrolling-partners-intro.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit the component checkpoint**

```bash
git add components/ui/scrolling-partners-intro.tsx __tests__/scrolling-partners-intro.test.tsx lib/types.ts
git commit -m "feat: add scrolling partners intro component"
```

### Task 3: Integrate the sticky intro into the contact page and verify the whole route

**Files:**
- Modify: `app/contact/page.tsx`
- Modify: `components/contact/contact-form.tsx`
- Modify: `components/ui/scrolling-partners-intro.tsx`
- Test: `npm run test:run`
- Test: `npm run build`

- [ ] **Step 1: Integrate the component at the top of the contact page**

Render the new component above the current contact copy:

```tsx
<ScrollingPartnersIntro partners={partners} />
```

Keep the editorial section and form reachable after the sticky area. The form should not be trapped inside the sticky viewport.

- [ ] **Step 2: Tune spacing and hierarchy**

Adjust page containers so the final page order is:
- sticky partners intro
- contact heading and copy
- contact form card

The intro should feel dominant, but the form must still become visible naturally after the sticky section.

- [ ] **Step 3: Run full test suite**

Run: `npm run test:run`
Expected: PASS with no regressions.

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: PASS with the contact route prerendering successfully.

- [ ] **Step 5: Commit the integrated feature**

```bash
git add app/contact/page.tsx components/contact/contact-form.tsx components/ui/scrolling-partners-intro.tsx __tests__/scrolling-partners-intro.test.tsx
git commit -m "feat: add partners intro to contact page"
```
