# Site Bug Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix six identified issues on the CSF website: scroll-to-top on event navigation, partner image server crash, page loader gradient removal, data migration to static JSON, events gallery empty space, and past events clickability.

**Architecture:** Six independent bug fixes applied in order of dependency — Task 4 (JSON migration) must complete before Task 5 (gallery) since the gallery benefits from richer image data in the JSON file. All other tasks are independent.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, Framer Motion, `next/image`

---

## File Map

| File | Change |
|------|--------|
| `components/ui/scroll-expansion-hero.tsx` | Add `window.scrollTo(0, 0)` on mount |
| `components/ui/scrolling-partners-intro.tsx` | Replace `next/image` with `<img>` in `OrbitCard` |
| `app/layout.tsx` | Remove `<PageLoader />` and its import |
| `lib/data.ts` | Replace DB calls with JSON reads for public functions |
| `data/events.json` | Verify structure; ensure `status` field is set correctly |
| `data/partners.json` | Already correct — no changes needed |
| `components/events/events-gallery.tsx` | Dynamic height + empty state |
| `components/shared/event-card.tsx` | Wrap with `Link` to event detail page |

---

## Task 1: Fix scroll-to-top on event page navigation

**Problem:** When clicking an event card and arriving at `/evenements/[id]`, the browser preserves the scroll position from the previous page. The `ScrollExpansionHero` handles scroll during the hero expansion phase, but on first mount the page doesn't snap to top, causing a visual glitch.

**Files:**
- Modify: `components/ui/scroll-expansion-hero.tsx:31-37`

- [ ] **Step 1: Add mount scroll-to-top effect**

Open `components/ui/scroll-expansion-hero.tsx`. After the existing `useEffect` at line 31 (the `prefers-reduced-motion` check), add a new `useEffect`:

```tsx
// After the existing prefers-reduced-motion useEffect (line 31-37):

useEffect(() => {
  window.scrollTo(0, 0)
}, [])
```

The full block after the change (lines 31-45) should look like:

```tsx
  // Skip animation entirely when user prefers reduced motion
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setScrollProgress(1)
      setMediaFullyExpanded(true)
      setShowContent(true)
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768)
```

- [ ] **Step 2: Test manually**

Run `npm run dev`, navigate to landing page, click a past event card, verify the page opens at the very top with no visible scroll from the previous position.

- [ ] **Step 3: Commit**

```bash
git add components/ui/scroll-expansion-hero.tsx
git commit -m "fix: scroll to top on event detail page mount"
```

---

## Task 2: Fix partner image crash on /contact page

**Problem:** `app/contact/page.tsx` renders `ScrollingPartnersIntro` which uses `next/image` with `partner.logo` values like `/images/partners/goldman.png`. These files don't exist in `/public`, so Next.js image optimization throws a server error when the page is visited. The component already has an `onError` fallback that shows the partner name — the fix is to bypass Next.js image optimization by using a plain `<img>` tag.

**Files:**
- Modify: `components/ui/scrolling-partners-intro.tsx:1-60`

- [ ] **Step 1: Remove `next/image` import**

In `components/ui/scrolling-partners-intro.tsx`, remove line 4:
```tsx
// DELETE this line:
import Image from 'next/image'
```

- [ ] **Step 2: Replace `Image` with `<img>` in `OrbitCard`**

Find the `OrbitCard` function (line 24). Replace the `<div className="relative h-full w-full bg-[#0d0d0d]">` block (lines 47-57):

```tsx
// BEFORE:
        <div className="relative h-full w-full bg-[#0d0d0d]">
          <Image
            src={partner.logo}
            alt={`Logo ${partner.name}`}
            fill
            className="object-contain p-3"
            sizes={mobile ? '72px' : '96px'}
            onError={() => setImageFailed(true)}
          />
        </div>
```

```tsx
// AFTER:
        <div className="relative h-full w-full bg-[#0d0d0d]">
          <img
            src={partner.logo}
            alt={`Logo ${partner.name}`}
            className="h-full w-full object-contain p-3"
            onError={() => setImageFailed(true)}
          />
        </div>
```

- [ ] **Step 3: Verify the existing test still passes**

```bash
npm run test:run -- __tests__/scrolling-partners-intro.test.tsx
```

Expected: all 3 tests PASS. The test already mocks `next/image`, but now the component uses `<img>` natively so the mock is no longer needed. The test assertions (`getAllByAltText`, `getByText`, error fallback) still work because they target the DOM output.

- [ ] **Step 4: Test manually**

Navigate to `http://localhost:3000/contact`. Verify the page loads without server errors in the terminal. The partner orbit cards should show their fallback names (since logo files don't exist), which is the correct behavior.

- [ ] **Step 5: Commit**

```bash
git add components/ui/scrolling-partners-intro.tsx
git commit -m "fix: replace next/image with img in OrbitCard to prevent server crash on missing partner logos"
```

---

## Task 3: Remove page loader gradient

**Problem:** The `PageLoader` component shows a WebGL animated gradient (900ms) when any page loads. The user finds this effect jarring. The fix is to remove it from the root layout.

**Files:**
- Modify: `app/layout.tsx:3-4,21`

- [ ] **Step 1: Remove PageLoader from layout**

In `app/layout.tsx`, remove the import and the component usage. The file currently looks like:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SiteChrome } from '@/components/layout/site-chrome'
import { PageLoader } from '@/components/ui/page-loader'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/ui/theme-provider'
import './globals.css'

...

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

Change it to:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SiteChrome } from '@/components/layout/site-chrome'
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
          <SiteChrome>{children}</SiteChrome>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npm run build 2>&1 | head -30
```

Expected: no TypeScript compilation errors related to the removed import.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "fix: remove page loader gradient animation on page load"
```

---

## Task 4: Switch event and partner data from database to static JSON

**Problem:** The site uses a Turso (LibSQL) database managed via an admin console. The user wants to abandon the admin console and instead edit event data directly in code. `data/events.json` already contains rich event data (with `images[]`, `highlights[]`, `photos[]`) which the DB version lacks. This migration also fixes the gallery (more images per event) and simplifies the data layer.

**Files:**
- Modify: `lib/data.ts:1-88` (public functions only — admin functions stay unchanged)
- Verify: `data/events.json` (check `status` field on all events)

- [ ] **Step 1: Verify events JSON has correct status values**

Open `data/events.json`. For each event object, confirm there is a `"status"` field set to either `"upcoming"` or `"past"`. Events that have already occurred should have `"status": "past"`. Events in the future should have `"status": "upcoming"`.

The JSON structure per event must match the `Event` type in `lib/types.ts`:
```json
{
  "id": "mock-trading-bnp-2025-04",
  "title": "Mock Trading Session",
  "date": "2025-04-15",
  "partner": "BNP Paribas CIB",
  "partnerDescription": "...",
  "pole": "Finance de Marché",
  "description": "...",
  "image": "https://...",
  "images": ["https://...", "https://..."],
  "highlights": [{ "title": "...", "description": "..." }],
  "photos": [{ "src": "https://...", "caption": "..." }],
  "status": "past"
}
```

Update `status` values as needed based on the current date (2026-04-06). Events dated before today should be `"past"`.

- [ ] **Step 2: Replace public data functions in lib/data.ts**

Open `lib/data.ts`. Replace the top section (lines 1-88, everything before `// --- Fonctions admin (avec IDs) ---`) with:

```typescript
import eventsJson from '@/data/events.json'
import partnersJson from '@/data/partners.json'
import type { PoleData, Event, Partner, AdminPole, AdminEvent, AdminPartner, SiteContent } from './types'
import { getDb } from './db'

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string') throw new Error(`Expected string for field "${field}", got ${typeof value}`)
  return value
}

// --- Fonctions publiques (utilisées par les pages du site) ---

export async function getTeam(): Promise<PoleData[]> {
  const db = getDb()
  const { rows: poles } = await db.execute('SELECT * FROM poles ORDER BY order_index')
  const { rows: members } = await db.execute('SELECT * FROM team_members ORDER BY order_index')

  return poles.map(pole => ({
    pole: requireString(pole.name, 'pole.name'),
    badge: requireString(pole.badge, 'pole.badge'),
    description: requireString(pole.description, 'pole.description'),
    members: members
      .filter(m => m.pole_id === pole.id)
      .map(m => ({
        name: requireString(m.name, 'member.name'),
        role: requireString(m.role, 'member.role'),
        photo: (m.photo_url as string | null) ?? null,
        linkedin: (m.linkedin as string | null) ?? null,
      })),
  }))
}

export async function getEvents(): Promise<Event[]> {
  return eventsJson as Event[]
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const events = await getEvents()
  return events
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export async function getPastEvents(): Promise<Event[]> {
  const events = await getEvents()
  return events
    .filter(e => e.status === 'past')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getPartners(): Promise<Partner[]> {
  return partnersJson as Partner[]
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const events = await getEvents()
  return events.find(e => e.id === id)
}
```

Leave the `// --- Fonctions admin (avec IDs) ---` section (lines 89-188) completely unchanged.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors. If you see `Type '...' is not assignable to type 'Event'`, check that the JSON field names match the TypeScript interface exactly (e.g., `partnerDescription` not `partner_description`, `photos[].src` not `photos[].url`).

- [ ] **Step 4: Run dev server and test pages**

```bash
npm run dev
```

- Visit `http://localhost:3000` — upcoming/past events tabs should show data
- Visit `http://localhost:3000/evenements` — gallery should show event photos
- Visit `http://localhost:3000/evenements/mock-trading-bnp-2025-04` — event detail should work

- [ ] **Step 5: Commit**

```bash
git add lib/data.ts data/events.json
git commit -m "feat: switch public data layer from database to static JSON files"
```

---

## Task 5: Fix events page gallery excessive empty space

**Problem:** `EventsGallery` renders a scroll container with a fixed height of `700vh`. When there are few events or few images per event, the gallery content is much shorter than 700vh, leaving a large black void after the last image. Additionally, if no images exist at all, nothing renders in the `700vh` container.

**Fix:** Compute the gallery item count and scale the container height dynamically. Add an empty state for when there are no images.

**Files:**
- Modify: `components/events/events-gallery.tsx:109-186`

- [ ] **Step 1: Move `toGalleryItems` call into `EventsGallery`**

In `components/events/events-gallery.tsx`, update the `EventsGallery` function (lines 165-186) to compute items, derive a proportional height, and add an empty state:

```tsx
export function EventsGallery({ events }: EventsGalleryProps) {
  const items = toGalleryItems(events)

  if (items.length === 0) {
    return (
      <div className="py-24 text-center text-sm text-muted-foreground">
        Aucune photo disponible pour l&apos;instant.
      </div>
    )
  }

  // Scale container height based on item count.
  // The gallery uses 25% of its height for the flip animation and 75% for browsing.
  // Each item needs ~120vh of browse space; capped between 400vh and 700vh.
  const maxPerCol = Math.ceil(items.length / 3)
  const containerVh = Math.min(700, Math.max(400, 175 + maxPerCol * 120))

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative">
        <div
          className="pointer-events-none absolute z-10 h-[60vh] w-full top-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)",
            filter: "blur(40px)",
            mixBlendMode: "screen",
          }}
        />
        <ContainerScroll className="relative" style={{ height: `${containerVh}vh` }}>
          <ContainerSticky className="h-svh">
            <ScrollTracker events={events} />
          </ContainerSticky>
        </ContainerScroll>
      </div>
    </MotionConfig>
  )
}
```

Note: `ContainerScroll` accepts `React.HtmlHTMLAttributes<HTMLDivElement>` which includes `style`, so `style={{ height: \`${containerVh}vh\` }}` is valid.

- [ ] **Step 2: Verify the page renders correctly**

```bash
npm run dev
```

Visit `http://localhost:3000/evenements`. The gallery should:
- Show the animated flip reveal
- Have a scroll container that ends shortly after the last image, with no large empty black area at the bottom

- [ ] **Step 3: Commit**

```bash
git add components/events/events-gallery.tsx
git commit -m "fix: scale events gallery height dynamically, add empty state"
```

---

## Task 6: Make past events clickable on landing page

**Problem:** On the landing page (`/`), the "Passés" tab in `EventsPreview` shows past events using `EventCard` components. These cards are not clickable — there's no link to the event detail page. The fix is to wrap the `MagicCard` in `EventCard` with a `Next.js Link`.

**Files:**
- Modify: `components/shared/event-card.tsx:1-55`

- [ ] **Step 1: Add `Link` import and wrap card**

In `components/shared/event-card.tsx`, add the `Link` import and wrap the `MagicCard`:

```tsx
'use client'

import Link from 'next/link'
import { MagicCard } from '@/components/ui/magic-card'
import { Badge } from '@/components/ui/badge'
import type { Event } from '@/lib/types'

interface EventCardProps {
  event: Event
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/evenements/${event.id}`} className="block group/card">
      <MagicCard
        className="overflow-hidden rounded-xl border border-border bg-card"
        gradientColor="#1a1a1a"
      >
        <div className="h-40 bg-secondary flex items-center justify-center border-b border-border">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs tracking-widest uppercase text-muted-foreground/40">
              Photo événement
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs tracking-widest uppercase text-muted-foreground">
              {formatDate(event.date)}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{event.partner}</span>
          </div>
          <h4 className="text-base font-semibold mb-2 leading-tight group-hover/card:underline">
            {event.title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {event.description}
          </p>
          <Badge variant="secondary" className="text-xs">
            {event.pole}
          </Badge>
        </div>
      </MagicCard>
    </Link>
  )
}
```

Key changes:
- Added `Link` import
- Wrapped `MagicCard` with `<Link href={/evenements/${event.id}} className="block group/card">`
- Added `group-hover/card:underline` on the title for a subtle hover cue

- [ ] **Step 2: Test on landing page**

```bash
npm run dev
```

- Visit `http://localhost:3000`
- Click the "Passés" tab
- Hover over a past event card — the title should underline
- Click a past event card — should navigate to `/evenements/[id]`

- [ ] **Step 3: Commit**

```bash
git add components/shared/event-card.tsx
git commit -m "feat: make past event cards clickable, link to event detail page"
```

---

## Self-Review

### Spec coverage check

| Requirement | Task | Status |
|-------------|------|--------|
| Scroll latence on event page navigation | Task 1 | ✓ |
| Partner image server crash | Task 2 | ✓ |
| Abandon admin console / switch to code | Task 4 | ✓ |
| Remove page loader gradient | Task 3 | ✓ |
| Events page large black space | Task 5 | ✓ |
| Past events clickable on landing page | Task 6 | ✓ |

### Dependency order

Tasks 1, 2, 3, 6 are fully independent.
Task 4 should run before Task 5 (JSON migration adds richer image data that reduces the empty space problem).

### Placeholder scan

No TBDs or vague instructions. All code blocks are complete.

### Type consistency

- `Event` type used consistently throughout — `event.id`, `event.image`, `event.status` match `lib/types.ts`
- `Partner` type `{ name, logo }` matches `data/partners.json` and `lib/types.ts`
- `ContainerScroll` accepts `style` prop (confirmed in `animated-gallery.tsx:54-59`)
