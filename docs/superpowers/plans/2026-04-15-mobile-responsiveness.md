# Mobile Responsiveness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 6 broken mobile layouts on the CS Finance website — making each component clean and functional on mobile without touching any desktop behavior.

**Architecture:** Targeted refactors per component using Tailwind responsive prefixes (`md:hidden`, `hidden md:flex`). Each component gets a dedicated mobile layout below 768px; the existing desktop layout is wrapped in `hidden md:*` and left untouched. No new files created — all changes live in the existing component files.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, Vitest + React Testing Library (jsdom)

---

## File Map

| File | Change |
|------|--------|
| `components/shared/event-row.tsx` | Grid: 3-col → 2-col on mobile |
| `app/a-propos/page.tsx` | H1: `text-5xl` → `text-4xl sm:text-5xl` |
| `components/ui/scrolling-partners-intro.tsx` | Circle widths computed from viewport |
| `components/landing/team-preview.tsx` | Add mobile "Voir toute l'équipe" link |
| `components/events/events-gallery.tsx` | Add `MobileEventsGrid`, hide parallax on mobile |
| `components/ui/team-showcase.tsx` | Add 2-col photo grid + name/role overlay for mobile |
| `__tests__/event-row.test.tsx` | New |
| `__tests__/about-page.test.tsx` | Update stale test, add h1 breakpoint test |
| `__tests__/scrolling-partners-intro.test.tsx` | Add narrow-viewport test |
| `__tests__/team-preview.test.tsx` | New |
| `__tests__/events-gallery.test.tsx` | New |
| `__tests__/team-showcase.test.tsx` | New |

---

### Task 1: EventRow — 2-column grid on mobile

**Files:**
- Modify: `components/shared/event-row.tsx`
- Create: `__tests__/event-row.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/event-row.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Event } from '@/lib/types'

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  formatEventDay: () => '14',
  formatEventMonth: () => 'AVRL',
}))

const event: Event = {
  id: '1',
  title: 'Test Event',
  date: '2026-04-14',
  partner: 'Test Partner',
  partnerDescription: '',
  pole: 'Formation',
  description: 'Test description',
  image: null,
  images: [],
  status: 'upcoming',
  highlights: [],
  photos: [],
}

describe('EventRow', () => {
  it('uses a 2-column grid on mobile and 3-column on sm+', async () => {
    const { EventRow } = await import('@/components/shared/event-row')
    const { container } = render(<EventRow event={event} />)
    const row = container.firstElementChild as HTMLElement
    expect(row.className).toContain('grid-cols-[64px_1fr]')
    expect(row.className).toContain('sm:grid-cols-[80px_1fr_auto]')
  })
})
```

- [ ] **Step 2: Run the test — expect FAIL**

```bash
npx vitest run __tests__/event-row.test.tsx
```

Expected: FAIL — `grid-cols-[64px_1fr]` not found in className.

- [ ] **Step 3: Implement the fix**

In `components/shared/event-row.tsx`, change the root `<div>` className from:

```tsx
<div className={cn('grid grid-cols-[80px_1fr_auto] gap-6 items-center px-6 py-5 bg-card', featured ? 'border border-border rounded-xl' : 'border-b border-border last:border-0')}>
```

To:

```tsx
<div className={cn('grid grid-cols-[64px_1fr] sm:grid-cols-[80px_1fr_auto] gap-4 sm:gap-6 items-center px-6 py-5 bg-card', featured ? 'border border-border rounded-xl' : 'border-b border-border last:border-0')}>
```

- [ ] **Step 4: Run the test — expect PASS**

```bash
npx vitest run __tests__/event-row.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/shared/event-row.tsx __tests__/event-row.test.tsx
git commit -m "fix: EventRow 2-col grid on mobile, remove empty auto column"
```

---

### Task 2: À propos — responsive H1

**Files:**
- Modify: `app/a-propos/page.tsx`
- Modify: `__tests__/about-page.test.tsx`

- [ ] **Step 1: Replace the stale test**

The current `__tests__/about-page.test.tsx` checks for `max-w-screen-2xl` which no longer exists in the code. Replace the entire file:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/data', () => ({
  getTeam: vi.fn().mockResolvedValue([
    {
      pole: 'Bureau',
      badge: 'Bureau',
      description: "Donne la direction de l'association et coordonne les pôles.",
      members: [],
    },
  ]),
}))

vi.mock('@/components/ui/blur-fade', () => ({
  BlurFade: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}))

vi.mock('@/components/ui/number-ticker', () => ({
  NumberTicker: ({ value }: { value: number }) => <span>{value}</span>,
}))

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}))

describe('AboutPage', () => {
  it('h1 uses responsive text sizing (text-4xl on mobile, text-5xl on sm+)', async () => {
    const { default: AboutPage } = await import('@/app/a-propos/page')
    const page = await AboutPage()
    render(page)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.className).toContain('text-4xl')
    expect(h1.className).toContain('sm:text-5xl')
  })
})
```

- [ ] **Step 2: Run the test — expect FAIL**

```bash
npx vitest run __tests__/about-page.test.tsx
```

Expected: FAIL — h1 has `text-5xl` but not `text-4xl`.

- [ ] **Step 3: Implement the fix**

In `app/a-propos/page.tsx`, change:

```tsx
<h1 className="text-5xl font-extrabold tracking-tighter mb-8 max-w-2xl">
```

To:

```tsx
<h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter mb-8 max-w-2xl">
```

- [ ] **Step 4: Run the test — expect PASS**

```bash
npx vitest run __tests__/about-page.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/a-propos/page.tsx __tests__/about-page.test.tsx
git commit -m "fix: responsive h1 on about page (text-4xl mobile, text-5xl sm+)"
```

---

### Task 3: ScrollingPartnersIntro — dynamic circle width

**Files:**
- Modify: `components/ui/scrolling-partners-intro.tsx`
- Modify: `__tests__/scrolling-partners-intro.test.tsx`

- [ ] **Step 1: Add the failing test**

Append this test inside the existing `describe('ScrollingPartnersIntro')` block in `__tests__/scrolling-partners-intro.test.tsx`:

```tsx
it('caps circle width to viewport width minus 32px on narrow screens', async () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 320,
  })
  const { ScrollingPartnersIntro } = await import(
    '@/components/ui/scrolling-partners-intro'
  )
  const { container } = render(<ScrollingPartnersIntro partners={partners} />)

  // Trigger resize to update mobileWidth state (320px viewport → mobileWidth = 288)
  fireEvent(window, new Event('resize'))

  // Outermost circle must not exceed 288px (320 - 32)
  const sticky = container.querySelector('.sticky')
  const styledDivs = Array.from(
    sticky?.querySelectorAll('[style]') ?? [],
  ) as HTMLElement[]
  const widths = styledDivs
    .map((el) => parseFloat(el.style.width))
    .filter((w) => !isNaN(w) && w > 0)

  expect(widths.length).toBeGreaterThan(0)
  expect(Math.max(...widths)).toBeLessThanOrEqual(288)
})
```

Note: `fireEvent` is already imported from `@testing-library/react` in this file.

- [ ] **Step 2: Run the tests — expect the new one to FAIL**

```bash
npx vitest run __tests__/scrolling-partners-intro.test.tsx
```

Expected: 3 existing tests PASS, 1 new test FAIL (max width exceeds 288).

- [ ] **Step 3: Implement dynamic mobileWidth**

In `components/ui/scrolling-partners-intro.tsx`:

**a)** Add a new state variable after `isMobile`:

```tsx
const [isMobile, setIsMobile] = useState(false)
const [mobileWidth, setMobileWidth] = useState(320)
```

**b)** In `handleResize`, add after `setIsMobile(window.innerWidth < 768)`:

```tsx
setMobileWidth(Math.min(320, window.innerWidth - 32))
```

**c)** Replace the three hardcoded mobile circle sizes (lines 124–142):

```tsx
// Outer circle — was: width: isMobile ? 320 : 600
style={{
  width: isMobile ? mobileWidth : 600,
  height: isMobile ? mobileWidth : 600,
}}

// Middle circle — was: width: isMobile ? 250 : 500
style={{
  width: isMobile ? Math.round(mobileWidth * 0.78) : 500,
  height: isMobile ? Math.round(mobileWidth * 0.78) : 500,
}}

// Inner circle — was: width: isMobile ? 190 : 400
style={{
  width: isMobile ? Math.round(mobileWidth * 0.59) : 400,
  height: isMobile ? Math.round(mobileWidth * 0.59) : 400,
}}
```

- [ ] **Step 4: Run the tests — expect all 4 to PASS**

```bash
npx vitest run __tests__/scrolling-partners-intro.test.tsx
```

Expected: all 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add components/ui/scrolling-partners-intro.tsx __tests__/scrolling-partners-intro.test.tsx
git commit -m "fix: ScrollingPartnersIntro circles constrained to viewport width on mobile"
```

---

### Task 4: TeamPreview — mobile navigation link

**Files:**
- Modify: `components/landing/team-preview.tsx`
- Create: `__tests__/team-preview.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/team-preview.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
  }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

vi.mock('@/lib/data', () => ({
  getTeam: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/components/ui/blur-fade', () => ({
  BlurFade: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/ui/team-showcase', () => ({
  default: () => <div data-testid="team-showcase" />,
}))

describe('TeamPreview', () => {
  it('renders a mobile-only link to /equipe below the showcase', async () => {
    const { TeamPreview } = await import('@/components/landing/team-preview')
    const component = await TeamPreview()
    render(component)

    const links = screen.getAllByRole('link', { name: /voir toute l'équipe/i })
    const mobileLink = links.find((link) => link.className?.includes('sm:hidden'))
    expect(mobileLink).toBeDefined()
    expect(mobileLink?.getAttribute('href')).toBe('/equipe')
  })
})
```

- [ ] **Step 2: Run the test — expect FAIL**

```bash
npx vitest run __tests__/team-preview.test.tsx
```

Expected: FAIL — no link with `sm:hidden` found.

- [ ] **Step 3: Implement the fix**

In `components/landing/team-preview.tsx`, add a mobile link after `<TeamShowcase members={displayed} />`:

```tsx
      <TeamShowcase members={displayed} />

      <div className="px-6 max-w-6xl mx-auto">
        <Link
          href="/equipe"
          className="block sm:hidden text-center text-sm text-muted-foreground mt-4 pb-8 hover:text-foreground transition-colors"
        >
          Voir toute l&apos;équipe →
        </Link>
      </div>
    </section>
```

- [ ] **Step 4: Run the test — expect PASS**

```bash
npx vitest run __tests__/team-preview.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/landing/team-preview.tsx __tests__/team-preview.test.tsx
git commit -m "fix: add mobile navigation link to /equipe in TeamPreview"
```

---

### Task 5: EventsGallery — MobileEventsGrid

**Files:**
- Modify: `components/events/events-gallery.tsx`
- Create: `__tests__/events-gallery.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/events-gallery.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Event } from '@/lib/types'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
  }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    className,
  }: React.ComponentProps<'img'>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  ),
}))

vi.mock('motion/react', () => ({
  MotionConfig: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useMotionValueEvent: vi.fn(),
}))

vi.mock('@/components/ui/animated-gallery', () => ({
  ContainerScroll: ({
    children,
    className,
    style,
  }: React.ComponentProps<'div'>) => (
    <div data-testid="container-scroll" className={className} style={style}>
      {children}
    </div>
  ),
  ContainerSticky: ({ children, className }: React.ComponentProps<'div'>) => (
    <div className={className}>{children}</div>
  ),
  GalleryContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  GalleryCol: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useContainerScrollContext: () => ({
    scrollYProgress: { on: vi.fn() },
  }),
}))

const makeEvent = (id: string): Event => ({
  id,
  title: `Event ${id}`,
  date: '2026-04-01',
  partner: 'Partner',
  partnerDescription: '',
  pole: 'Formation',
  description: 'Desc',
  image: `/img/${id}.jpg`,
  images: [],
  status: 'past',
  highlights: [],
  photos: [],
})

describe('EventsGallery', () => {
  it('renders a mobile grid (md:hidden) with one link per event that has an image', async () => {
    const { EventsGallery } = await import('@/components/events/events-gallery')
    const events = [makeEvent('1'), makeEvent('2'), makeEvent('3')]
    const { container } = render(<EventsGallery events={events} />)

    const mobileGrid = container.querySelector('.md\\:hidden')
    expect(mobileGrid).not.toBeNull()

    const links = mobileGrid?.querySelectorAll('a')
    expect(links?.length).toBe(3)
  })

  it('wraps the desktop ContainerScroll in hidden md:block', async () => {
    const { EventsGallery } = await import('@/components/events/events-gallery')
    const { container } = render(<EventsGallery events={[makeEvent('a')]} />)

    const desktopWrapper = container.querySelector('.hidden.md\\:block')
    expect(desktopWrapper).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run the tests — expect FAIL**

```bash
npx vitest run __tests__/events-gallery.test.tsx
```

Expected: FAIL — no `.md:hidden` or `.hidden.md:block` wrappers found.

- [ ] **Step 3: Add MobileEventsGrid and update EventsGallery**

In `components/events/events-gallery.tsx`:

**a)** Add the `MobileEventsGrid` function before the `EventsGallery` export:

```tsx
function MobileEventsGrid({ events }: { events: Event[] }) {
  const items = toGalleryItems(events)

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Aucune photo disponible pour l&apos;instant.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 px-4 py-8">
      {items.map((item, i) => (
        <GalleryItemCard
          key={`${item.eventId}-${item.image}`}
          item={item}
          isRevealed={true}
          priority={i < 4}
        />
      ))}
    </div>
  )
}
```

**b)** Replace the `EventsGallery` return statement (keep everything above `return` unchanged):

```tsx
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative">
        {/* Mobile: static 2-column grid */}
        <div className="md:hidden">
          <MobileEventsGrid events={events} />
        </div>

        {/* Desktop: parallax scroll gallery */}
        <div className="hidden md:block">
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
      </div>
    </MotionConfig>
  )
```

- [ ] **Step 4: Run the tests — expect PASS**

```bash
npx vitest run __tests__/events-gallery.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/events/events-gallery.tsx __tests__/events-gallery.test.tsx
git commit -m "fix: add MobileEventsGrid static fallback for EventsGallery on mobile"
```

---

### Task 6: TeamShowcase — 2-column photo grid on mobile

**Files:**
- Modify: `components/ui/team-showcase.tsx`
- Create: `__tests__/team-showcase.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/team-showcase.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { TeamMember } from '@/components/ui/team-showcase'

vi.mock('react-icons/fa', () => ({
  FaLinkedinIn: () => null,
  FaTwitter: () => null,
  FaBehance: () => null,
  FaInstagram: () => null,
}))

const members: TeamMember[] = [
  { id: '1', name: 'Alice Martin', role: 'Présidente', image: '/alice.jpg' },
  { id: '2', name: 'Bob Dupont', role: 'Trésorier', image: '/bob.jpg' },
  { id: '3', name: 'Claire Morin', role: 'VP Partenariats', image: '/claire.jpg' },
  { id: '4', name: 'David Petit', role: 'VP Formation', image: '/david.jpg' },
]

describe('TeamShowcase', () => {
  it('renders a mobile 2-column photo grid (md:hidden grid-cols-2)', async () => {
    const { default: TeamShowcase } = await import('@/components/ui/team-showcase')
    const { container } = render(<TeamShowcase members={members} />)

    const mobileGrid = container.querySelector('.md\\:hidden')
    expect(mobileGrid).not.toBeNull()
    expect(mobileGrid?.className).toContain('grid-cols-2')

    const photos = mobileGrid?.querySelectorAll('img')
    expect(photos?.length).toBe(4)
  })

  it('renders name and role on each mobile photo card via data-member-name', async () => {
    const { default: TeamShowcase } = await import('@/components/ui/team-showcase')
    const { container } = render(<TeamShowcase members={members} />)

    const mobileGrid = container.querySelector('.md\\:hidden')
    const nameEls = mobileGrid?.querySelectorAll('[data-member-name]')
    expect(nameEls?.length).toBe(4)
    expect(nameEls?.[0].textContent).toBe('Alice Martin')
  })

  it('hides the staggered desktop grid on mobile (hidden md:flex)', async () => {
    const { default: TeamShowcase } = await import('@/components/ui/team-showcase')
    const { container } = render(<TeamShowcase members={members} />)

    const desktopGrid = container.querySelector('.hidden.md\\:flex')
    expect(desktopGrid).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run the tests — expect FAIL**

```bash
npx vitest run __tests__/team-showcase.test.tsx
```

Expected: FAIL — no `.md:hidden` grid or `.hidden.md:flex` desktop grid found.

- [ ] **Step 3: Add the mobile photo grid**

In `components/ui/team-showcase.tsx`:

**a)** Add a `MobilePhotoCard` function after the imports, before `TeamShowcase`:

```tsx
function MobilePhotoCard({ member }: { member: TeamMember }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
      <img
        src={member.image}
        alt={member.name}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <p
          className="text-xs font-semibold text-white leading-tight truncate"
          data-member-name
        >
          {member.name}
        </p>
        <p className="text-[10px] text-white/70 truncate">{member.role}</p>
      </div>
    </div>
  )
}
```

**b)** In `TeamShowcase`, update the return statement. The outer container and member list are unchanged; only the photo grid section is restructured:

```tsx
  return (
    <div className="flex flex-col md:flex-row items-start gap-8 md:gap-10 lg:gap-14 select-none w-full max-w-5xl mx-auto py-8 px-4 md:px-6 font-sans">

      {/* Mobile: uniform 2-col grid with name/role overlay */}
      <div className="grid grid-cols-2 gap-2 w-full md:hidden">
        {members.map((member) => (
          <MobilePhotoCard key={member.id} member={member} />
        ))}
      </div>

      {/* Desktop: staggered 3-col grid (unchanged) */}
      <div className="hidden md:flex gap-3 flex-shrink-0">
        {/* Column 1 */}
        <div className="flex flex-col gap-2 md:gap-3">
          {col1.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="w-[110px] h-[120px] sm:w-[130px] sm:h-[140px] md:w-[155px] md:h-[165px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-2 md:gap-3 mt-[48px] sm:mt-[56px] md:mt-[68px]">
          {col2.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="w-[122px] h-[132px] sm:w-[145px] sm:h-[155px] md:w-[172px] md:h-[182px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-2 md:gap-3 mt-[22px] sm:mt-[26px] md:mt-[32px]">
          {col3.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="w-[115px] h-[125px] sm:w-[136px] sm:h-[146px] md:w-[162px] md:h-[172px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>
      </div>

      {/* Member name list — flex-col on all sizes (remove sm:grid-cols-2 intermediate) */}
      <div className="flex flex-col gap-4 md:gap-5 pt-0 md:pt-2 flex-1 w-full">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            hoveredId={hoveredId}
            onHover={setHoveredId}
          />
        ))}
      </div>
    </div>
  )
```

- [ ] **Step 4: Run the tests — expect PASS**

```bash
npx vitest run __tests__/team-showcase.test.tsx
```

Expected: all 3 tests PASS

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run
```

Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add components/ui/team-showcase.tsx __tests__/team-showcase.test.tsx
git commit -m "fix: add 2-col mobile photo grid with name/role overlay to TeamShowcase"
```
