# CentraleSupélec Finance — Site Vitrine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium dark-theme showcase website for CentraleSupélec Finance with Apple-style scroll animations using Next.js, shadcn/ui, and MagicUI.

**Architecture:** Next.js App Router with RSC by default — `"use client"` only on interactive/animated components. Static JSON data files in `/data/` for team, events, and partners. Contact form uses a Server Action to send email via Resend.

**Tech Stack:** Next.js 15 · Tailwind CSS v4 · shadcn/ui (base-nova) · MagicUI · Framer Motion · Resend · Vitest + React Testing Library

---

## File Map

```
/
├── app/
│   ├── layout.tsx                    # Root layout: html, body, Navbar, Footer, AnimatePresence
│   ├── page.tsx                      # Landing — assembles all landing sections
│   ├── globals.css                   # Tailwind + CSS variables (dark theme tokens)
│   ├── evenements/
│   │   └── page.tsx                  # Events page
│   ├── equipe/
│   │   └── page.tsx                  # Team page
│   ├── a-propos/
│   │   └── page.tsx                  # About page
│   └── contact/
│       ├── page.tsx                  # Contact page
│       └── actions.ts                # Server Action: sendContactEmail()
├── components/
│   ├── layout/
│   │   ├── navbar.tsx                # Glassmorphism sticky nav, scroll-triggered blur
│   │   └── footer.tsx                # Minimal footer
│   ├── landing/
│   │   ├── hero.tsx                  # dot-pattern, text-animate, shimmer-button
│   │   ├── stats.tsx                 # 4-column grid, number-ticker
│   │   ├── team-preview.tsx          # Pôles scroll section with member cards
│   │   ├── events-preview.tsx        # Tabs À venir/Passés, animated-list, border-beam
│   │   ├── partners-marquee.tsx      # Dual-row marquee of partner logos
│   │   └── partners-cta.tsx          # Final CTA section with shimmer-button
│   ├── shared/
│   │   ├── member-card.tsx           # Avatar + name + role + magic-card + HoverCard
│   │   ├── pole-section.tsx          # Pole header (avatar-circles + desc) + member grid
│   │   ├── event-card.tsx            # Past event card with photo + info + magic-card
│   │   └── event-row.tsx             # Upcoming event row (timeline style)
│   └── ui/                           # shadcn/ui auto-generated components
├── data/
│   ├── events.json                   # Array of Event objects
│   ├── team.json                     # Array of PoleData objects
│   └── partners.json                 # Array of Partner objects
├── lib/
│   ├── types.ts                      # TypeScript interfaces: Event, Member, PoleData, Partner
│   └── data.ts                       # Typed getters: getEvents(), getTeam(), getPartners()
├── public/
│   ├── logo.png                      # CSF logo (already present)
│   └── images/
│       ├── team/                     # Member photos (placeholder: empty, use AvatarFallback)
│       └── events/                   # Event photos (placeholder: empty, use gradient)
└── __tests__/
    ├── actions.test.ts               # Unit tests for sendContactEmail()
    └── data.test.ts                  # Unit tests for data getters
```

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json` (via CLI)
- Create: `app/globals.css`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Scaffold Next.js project with shadcn**

Run from `/Users/nathandifraja/CSF_website/`:
```bash
npx shadcn@latest init --name csf-website --preset base-nova --template next
```
When prompted:
- TypeScript: yes
- App Router: yes
- Tailwind: yes (auto-detected)

- [ ] **Step 2: Verify project created**
```bash
ls -la
# Should see: app/ components/ public/ package.json next.config.ts tsconfig.json
```

- [ ] **Step 3: Install additional dependencies**
```bash
npm install framer-motion resend
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 4: Configure Vitest**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

Create `vitest.setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

Add to `package.json` scripts:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 5: Configure dark theme CSS variables**

Replace the contents of `app/globals.css` with:
```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: #060606;
  --color-foreground: #ffffff;
  --color-card: #0d0d0d;
  --color-card-foreground: #ffffff;
  --color-popover: #0d0d0d;
  --color-popover-foreground: #ffffff;
  --color-primary: #ffffff;
  --color-primary-foreground: #000000;
  --color-secondary: #111111;
  --color-secondary-foreground: #ffffff;
  --color-muted: #1a1a1a;
  --color-muted-foreground: #555555;
  --color-accent: #111111;
  --color-accent-foreground: #ffffff;
  --color-border: #1a1a1a;
  --color-input: #1a1a1a;
  --color-ring: #333333;
  --radius: 0.5rem;
}

body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
}
```

- [ ] **Step 6: Force dark mode in root layout**

Open `app/layout.tsx` (generated by shadcn). Add `className="dark"` to the `<html>` tag:
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 7: Run dev server to verify**
```bash
npm run dev
```
Expected: Next.js running at http://localhost:3000, dark background visible.

- [ ] **Step 8: Commit**
```bash
git init
git add .
git commit -m "feat: initialize Next.js project with shadcn base-nova and dark theme"
```

---

## Task 2: TypeScript Types + Data Files

**Files:**
- Create: `lib/types.ts`
- Create: `lib/data.ts`
- Create: `data/team.json`
- Create: `data/events.json`
- Create: `data/partners.json`
- Create: `__tests__/data.test.ts`

- [ ] **Step 1: Write the failing tests for data getters**

Create `__tests__/data.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { getTeam, getEvents, getPartners, getUpcomingEvents, getPastEvents } from '@/lib/data'

describe('getTeam', () => {
  it('returns an array of pole data', () => {
    const team = getTeam()
    expect(Array.isArray(team)).toBe(true)
    expect(team.length).toBeGreaterThan(0)
    expect(team[0]).toHaveProperty('pole')
    expect(team[0]).toHaveProperty('members')
    expect(Array.isArray(team[0].members)).toBe(true)
  })
})

describe('getEvents', () => {
  it('returns an array of events', () => {
    const events = getEvents()
    expect(Array.isArray(events)).toBe(true)
    expect(events[0]).toHaveProperty('id')
    expect(events[0]).toHaveProperty('status')
  })

  it('returns events with valid status', () => {
    const events = getEvents()
    events.forEach(e => {
      expect(['upcoming', 'past']).toContain(e.status)
    })
  })
})

describe('getUpcomingEvents', () => {
  it('returns only upcoming events', () => {
    const events = getUpcomingEvents()
    events.forEach(e => expect(e.status).toBe('upcoming'))
  })
})

describe('getPastEvents', () => {
  it('returns only past events', () => {
    const events = getPastEvents()
    events.forEach(e => expect(e.status).toBe('past'))
  })
})

describe('getPartners', () => {
  it('returns an array of partners', () => {
    const partners = getPartners()
    expect(Array.isArray(partners)).toBe(true)
    expect(partners[0]).toHaveProperty('name')
    expect(partners[0]).toHaveProperty('logo')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**
```bash
npm run test:run -- __tests__/data.test.ts
```
Expected: FAIL — `Cannot find module '@/lib/data'`

- [ ] **Step 3: Define TypeScript interfaces**

Create `lib/types.ts`:
```typescript
export interface Member {
  name: string
  role: string
  photo: string | null
  linkedin: string | null
}

export interface PoleData {
  pole: string
  badge: string
  description: string
  members: Member[]
}

export interface Event {
  id: string
  title: string
  date: string          // ISO 8601: "2025-04-15"
  partner: string
  pole: string
  description: string
  image: string | null
  status: 'upcoming' | 'past'
}

export interface Partner {
  name: string
  logo: string          // path in /public/images/partners/
}
```

- [ ] **Step 4: Create data files**

Create `data/team.json`:
```json
[
  {
    "pole": "Bureau",
    "badge": "Bureau",
    "description": "Pilote la stratégie de l'association, coordonne les pôles et représente CSF auprès des partenaires et de l'école.",
    "members": [
      { "name": "Prénom Nom", "role": "Président(e)", "photo": null, "linkedin": null },
      { "name": "Prénom Nom", "role": "Vice-Président(e)", "photo": null, "linkedin": null },
      { "name": "Prénom Nom", "role": "Trésorier(ère)", "photo": null, "linkedin": null },
      { "name": "Prénom Nom", "role": "Secrétaire", "photo": null, "linkedin": null }
    ]
  },
  {
    "pole": "Finance de Marché",
    "badge": "Marchés",
    "description": "Trading, produits dérivés, analyse quantitative. Organisation de mock-trading sessions et partenariats avec les desks de banques.",
    "members": [
      { "name": "Prénom Nom", "role": "Responsable", "photo": null, "linkedin": null },
      { "name": "Prénom Nom", "role": "Analyste", "photo": null, "linkedin": null },
      { "name": "Prénom Nom", "role": "Analyste", "photo": null, "linkedin": null },
      { "name": "Prénom Nom", "role": "Analyste", "photo": null, "linkedin": null },
      { "name": "Prénom Nom", "role": "Analyste", "photo": null, "linkedin": null }
    ]
  },
  {
    "pole": "Finance d'Entreprise",
    "badge": "Corporate",
    "description": "M&A, LBO, valorisation, conseil stratégique. Crack the Case, workshops avec banques d'affaires et cabinets de conseil.",
    "members": [
      { "name": "Prénom Nom", "role": "Responsable", "photo": null, "linkedin": null },
      { "name": "Prénom Nom", "role": "Analyste", "photo": null, "linkedin": null },
      { "name": "Prénom Nom", "role": "Analyste", "photo": null, "linkedin": null },
      { "name": "Prénom Nom", "role": "Analyste", "photo": null, "linkedin": null }
    ]
  },
  {
    "pole": "Formation",
    "badge": "Skills",
    "description": "Excel financier, Python quantitatif, préparation CFA, SIG. Sessions de formation hebdomadaires pour les membres.",
    "members": [
      { "name": "Prénom Nom", "role": "Responsable", "photo": null, "linkedin": null },
      { "name": "Prénom Nom", "role": "Formateur(trice)", "photo": null, "linkedin": null },
      { "name": "Prénom Nom", "role": "Formateur(trice)", "photo": null, "linkedin": null }
    ]
  },
  {
    "pole": "Alumni",
    "badge": "Network",
    "description": "Réseau des anciens en poste dans la finance. Mentorat, sessions de networking, soirées alumni.",
    "members": [
      { "name": "Prénom Nom", "role": "Responsable", "photo": null, "linkedin": null },
      { "name": "Prénom Nom", "role": "Chargé(e) Alumni", "photo": null, "linkedin": null }
    ]
  },
  {
    "pole": "Partenariat",
    "badge": "Business Dev",
    "description": "Relations entreprises, sponsoring, conventions partenaires. Interface entre CSF et les institutions financières.",
    "members": [
      { "name": "Prénom Nom", "role": "Responsable", "photo": null, "linkedin": null },
      { "name": "Prénom Nom", "role": "Chargé(e) de compte", "photo": null, "linkedin": null },
      { "name": "Prénom Nom", "role": "Chargé(e) de compte", "photo": null, "linkedin": null }
    ]
  }
]
```

Create `data/events.json`:
```json
[
  {
    "id": "mock-trading-bnp-2025-04",
    "title": "Mock Trading Session",
    "date": "2025-04-15",
    "partner": "BNP Paribas CIB",
    "pole": "Finance de Marché",
    "description": "Simulation de trading en live avec des traders senior. Accès aux outils professionnels de BNP Paribas CIB.",
    "image": null,
    "status": "upcoming"
  },
  {
    "id": "crack-the-case-mckinsey-2025-04",
    "title": "Crack the Case",
    "date": "2025-04-22",
    "partner": "McKinsey & Company",
    "pole": "Finance d'Entreprise",
    "description": "Workshop case study M&A en présence de consultants senior. Simulation d'entretien incluse.",
    "image": null,
    "status": "upcoming"
  },
  {
    "id": "alumni-networking-2025-05",
    "title": "Alumni Networking Evening",
    "date": "2025-05-05",
    "partner": "Alumni CSF",
    "pole": "Alumni",
    "description": "Soirée networking avec des alumni en poste dans des institutions financières de premier rang.",
    "image": null,
    "status": "upcoming"
  },
  {
    "id": "sales-trading-gs-2025-03",
    "title": "Sales & Trading Day",
    "date": "2025-03-10",
    "partner": "Goldman Sachs",
    "pole": "Finance de Marché",
    "description": "Une journée immersive dans les desks de trading de Goldman Sachs à Paris. 30 membres présents, sessions Q&A avec des MDs.",
    "image": null,
    "status": "past"
  },
  {
    "id": "ma-conference-lazard-2025-02",
    "title": "M&A Conference",
    "date": "2025-02-18",
    "partner": "Lazard",
    "pole": "Finance d'Entreprise",
    "description": "Conférence sur les grandes transactions M&A de 2024. Présentation des deals par des banquiers d'affaires Lazard.",
    "image": null,
    "status": "past"
  },
  {
    "id": "cfa-bootcamp-2025-01",
    "title": "CFA Study Bootcamp",
    "date": "2025-01-25",
    "partner": "CSF Formation",
    "pole": "Formation",
    "description": "Weekend intensif de préparation CFA Level 1. 40 participants, taux de réussite élevé aux sessions suivantes.",
    "image": null,
    "status": "past"
  }
]
```

Create `data/partners.json`:
```json
[
  { "name": "Goldman Sachs", "logo": "/images/partners/goldman.png" },
  { "name": "BNP Paribas CIB", "logo": "/images/partners/bnp.png" },
  { "name": "McKinsey & Company", "logo": "/images/partners/mckinsey.png" },
  { "name": "Lazard", "logo": "/images/partners/lazard.png" },
  { "name": "JP Morgan", "logo": "/images/partners/jpmorgan.png" },
  { "name": "Société Générale", "logo": "/images/partners/socgen.png" },
  { "name": "Rothschild & Co", "logo": "/images/partners/rothschild.png" },
  { "name": "BCG", "logo": "/images/partners/bcg.png" }
]
```

- [ ] **Step 5: Implement data getters**

Create `lib/data.ts`:
```typescript
import type { PoleData, Event, Partner } from './types'
import teamData from '@/data/team.json'
import eventsData from '@/data/events.json'
import partnersData from '@/data/partners.json'

export function getTeam(): PoleData[] {
  return teamData as PoleData[]
}

export function getEvents(): Event[] {
  return eventsData as Event[]
}

export function getUpcomingEvents(): Event[] {
  return getEvents()
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function getPastEvents(): Event[] {
  return getEvents()
    .filter(e => e.status === 'past')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPartners(): Partner[] {
  return partnersData as Partner[]
}
```

Add to `tsconfig.json` if not already present:
```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**
```bash
npm run test:run -- __tests__/data.test.ts
```
Expected: All 5 test suites PASS.

- [ ] **Step 7: Commit**
```bash
git add lib/ data/ __tests__/data.test.ts
git commit -m "feat: add TypeScript types, JSON data files, and data getters"
```

---

## Task 3: Install shadcn/ui + MagicUI Components

**Files:**
- Modify: `components/ui/` (auto-generated by CLI)

- [ ] **Step 1: Install shadcn/ui components needed**
```bash
npx shadcn@latest add navigation-menu tabs avatar badge hover-card card select textarea input separator
```

- [ ] **Step 2: Install MagicUI components**
```bash
npx shadcn@latest add @magicui/dot-pattern
npx shadcn@latest add @magicui/text-animate
npx shadcn@latest add @magicui/animated-shiny-text
npx shadcn@latest add @magicui/shimmer-button
npx shadcn@latest add @magicui/number-ticker
npx shadcn@latest add @magicui/blur-fade
npx shadcn@latest add @magicui/magic-card
npx shadcn@latest add @magicui/avatar-circles
npx shadcn@latest add @magicui/animated-list
npx shadcn@latest add @magicui/border-beam
npx shadcn@latest add @magicui/marquee
npx shadcn@latest add @magicui/shine-border
```

- [ ] **Step 3: Install Sonner (toast)**
```bash
npx shadcn@latest add sonner
```

- [ ] **Step 4: Verify components exist**
```bash
ls components/ui/ | grep -E "dot-pattern|shimmer|magic-card|marquee|border-beam|shine-border"
```
Expected: all component files listed.

- [ ] **Step 5: Check and fix any import path issues in MagicUI components**

Run:
```bash
npx shadcn@latest info --json | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('aliases', {}))"
```
Note the actual `ui` alias (e.g., `@/components/ui`). Then grep for hardcoded paths in newly added files:
```bash
grep -r "@/components/ui" components/ui/ | grep -v "^components/ui/index"
```
If any MagicUI component uses a path that doesn't match the project alias, update it to match.

- [ ] **Step 6: Commit**
```bash
git add components/ui/
git commit -m "feat: install shadcn/ui and MagicUI components"
```

---

## Task 4: Shared Components — MemberCard + PoleSection

**Files:**
- Create: `components/shared/member-card.tsx`
- Create: `components/shared/pole-section.tsx`

- [ ] **Step 1: Create MemberCard**

Create `components/shared/member-card.tsx`:
```tsx
'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { MagicCard } from '@/components/ui/magic-card'
import type { Member } from '@/lib/types'

interface MemberCardProps {
  member: Member
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')
}

export function MemberCard({ member }: MemberCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div>
          <MagicCard
            className="cursor-pointer rounded-xl border border-border bg-card p-4 text-center"
            gradientColor="#222222"
          >
            <Avatar className="size-14 mx-auto mb-3">
              {member.photo && <AvatarImage src={member.photo} alt={member.name} />}
              <AvatarFallback className="bg-secondary text-muted-foreground text-sm font-semibold">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold leading-tight">{member.name}</p>
            <Badge variant="secondary" className="mt-2 text-xs">
              {member.role}
            </Badge>
          </MagicCard>
        </div>
      </HoverCardTrigger>
      {member.linkedin && (
        <HoverCardContent className="w-64 bg-card border-border">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">{member.name}</p>
            <p className="text-xs text-muted-foreground">{member.role}</p>
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-foreground underline underline-offset-4"
            >
              LinkedIn →
            </a>
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  )
}
```

- [ ] **Step 2: Create PoleSection**

Create `components/shared/pole-section.tsx`:
```tsx
import { AvatarCircles } from '@/components/ui/avatar-circles'
import { BlurFade } from '@/components/ui/blur-fade'
import { MemberCard } from './member-card'
import type { PoleData } from '@/lib/types'

interface PoleSectionProps {
  pole: PoleData
  index: number
}

export function PoleSection({ pole, index }: PoleSectionProps) {
  const avatarUrls = pole.members.map(m => ({
    imageUrl: m.photo ?? '',
    profileUrl: m.linkedin ?? '#',
  }))

  return (
    <BlurFade delay={index * 0.1} inView>
      <div className="mb-16 last:mb-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8 pb-6 border-b border-border">
          <div className="flex flex-col gap-2">
            <span className="text-xs tracking-widest uppercase text-muted-foreground">
              {pole.badge}
            </span>
            <h3 className="text-2xl font-bold tracking-tight">{pole.pole}</h3>
            <AvatarCircles
              numPeople={pole.members.length}
              avatarUrls={avatarUrls}
              className="mt-1"
            />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            {pole.description}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {pole.members.map((member, i) => (
            <BlurFade key={member.name} delay={index * 0.1 + i * 0.05} inView>
              <MemberCard member={member} />
            </BlurFade>
          ))}
        </div>
      </div>
    </BlurFade>
  )
}
```

- [ ] **Step 3: Commit**
```bash
git add components/shared/
git commit -m "feat: add MemberCard and PoleSection shared components"
```

---

## Task 5: Shared Components — EventCard + EventRow

**Files:**
- Create: `components/shared/event-card.tsx`
- Create: `components/shared/event-row.tsx`

- [ ] **Step 1: Create EventCard (past events)**

Create `components/shared/event-card.tsx`:
```tsx
'use client'

import { MagicCard } from '@/components/ui/magic-card'
import { Badge } from '@/components/ui/badge'
import type { Event } from '@/lib/types'

interface EventCardProps {
  event: Event
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
}

export function EventCard({ event }: EventCardProps) {
  return (
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
        <h4 className="text-base font-semibold mb-2 leading-tight">{event.title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {event.description}
        </p>
        <Badge variant="secondary" className="text-xs">
          {event.pole}
        </Badge>
      </div>
    </MagicCard>
  )
}
```

- [ ] **Step 2: Create EventRow (upcoming events timeline)**

Create `components/shared/event-row.tsx`:
```tsx
import { Badge } from '@/components/ui/badge'
import type { Event } from '@/lib/types'

interface EventRowProps {
  event: Event
  featured?: boolean
}

function formatDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit' })
}

function formatMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()
}

export function EventRow({ event, featured = false }: EventRowProps) {
  return (
    <div className={`grid grid-cols-[80px_1fr_auto] gap-6 items-center px-6 py-5 bg-card ${featured ? 'border-border' : 'border-b border-border last:border-0'}`}>
      <div className="text-center">
        <div className="text-3xl font-bold tracking-tight leading-none">
          {formatDay(event.date)}
        </div>
        <div className="text-xs text-muted-foreground tracking-widest mt-1">
          {formatMonth(event.date)}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-1">{event.title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {event.description}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">{event.partner}</p>
      </div>
      <Badge variant="outline" className="text-xs shrink-0 hidden sm:flex">
        {event.pole}
      </Badge>
    </div>
  )
}
```

- [ ] **Step 3: Commit**
```bash
git add components/shared/event-card.tsx components/shared/event-row.tsx
git commit -m "feat: add EventCard and EventRow shared components"
```

---

## Task 6: Layout — Navbar + Footer

**Files:**
- Create: `components/layout/navbar.tsx`
- Create: `components/layout/footer.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create Navbar**

Create `components/layout/navbar.tsx`:
```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BlurFade } from '@/components/ui/blur-fade'

const NAV_LINKS = [
  { href: '/evenements', label: 'Événements' },
  { href: '/equipe', label: 'Équipe' },
  { href: '/a-propos', label: 'À propos' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <BlurFade delay={0} duration={0.4}>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="CSF Logo"
              width={28}
              height={28}
              className="mix-blend-screen"
            />
            <span className="text-sm font-semibold tracking-tight">
              CentraleSupélec Finance
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/contact"
            className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Nous contacter
          </Link>
        </div>
      </header>
    </BlurFade>
  )
}
```

- [ ] **Step 2: Create Footer**

Create `components/layout/footer.tsx`:
```tsx
import Image from 'next/image'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="CSF Logo"
            width={22}
            height={22}
            className="mix-blend-screen opacity-50"
          />
          <span className="text-xs text-muted-foreground">
            CentraleSupélec Finance · 2024–2025
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <Link
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            LinkedIn
          </Link>
          <Separator orientation="vertical" className="h-3" />
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Instagram
          </Link>
          <Separator orientation="vertical" className="h-3" />
          <a
            href="mailto:contact@csf.fr"
            className="hover:text-foreground transition-colors"
          >
            contact@csf.fr
          </a>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Wire into root layout**

Replace `app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'CentraleSupélec Finance',
  description: "L'association finance de référence à CentraleSupélec.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Verify at http://localhost:3000 — navbar appears, scrolling triggers blur**

- [ ] **Step 5: Commit**
```bash
git add components/layout/ app/layout.tsx
git commit -m "feat: add Navbar with scroll-blur effect and Footer"
```

---

## Task 7: Landing — Hero Section

**Files:**
- Create: `components/landing/hero.tsx`

- [ ] **Step 1: Create Hero**

Create `components/landing/hero.tsx`:
```tsx
import { DotPattern } from '@/components/ui/dot-pattern'
import { TextAnimate } from '@/components/ui/text-animate'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { BlurFade } from '@/components/ui/blur-fade'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden pt-16">
      <DotPattern
        className={cn(
          'absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]',
        )}
        cr={1}
        cx={1}
        cy={1}
      />

      <div className="relative z-10 flex flex-col items-center px-6 max-w-4xl mx-auto">
        <BlurFade delay={0.2} inView>
          <div className="mb-8 rounded-full border border-border px-4 py-1.5">
            <AnimatedShinyText className="text-xs tracking-widest uppercase text-muted-foreground">
              Association · CentraleSupélec · 2024–2025
            </AnimatedShinyText>
          </div>
        </BlurFade>

        <TextAnimate
          animation="blurInUp"
          by="word"
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-none mb-6"
        >
          Shaping the future of Finance.
        </TextAnimate>

        <BlurFade delay={0.6} inView>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-10">
            L&apos;association finance de référence à CentraleSupélec. Événements exclusifs, formations intensives, réseau industrie.
          </p>
        </BlurFade>

        <BlurFade delay={0.75} inView>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Link href="/evenements">
              <ShimmerButton className="px-8 py-3 text-sm font-semibold">
                Découvrir nos événements →
              </ShimmerButton>
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Devenir partenaire
            </Link>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to landing page to verify rendering**

In `app/page.tsx`:
```tsx
import { Hero } from '@/components/landing/hero'

export default function HomePage() {
  return (
    <div>
      <Hero />
    </div>
  )
}
```

- [ ] **Step 3: Verify at http://localhost:3000 — dots pattern visible, text animates in on load**

- [ ] **Step 4: Commit**
```bash
git add components/landing/hero.tsx app/page.tsx
git commit -m "feat: add Hero section with dot-pattern, text-animate, shimmer-button"
```

---

## Task 8: Landing — Stats Section

**Files:**
- Create: `components/landing/stats.tsx`

- [ ] **Step 1: Create Stats section**

Create `components/landing/stats.tsx`:
```tsx
import { NumberTicker } from '@/components/ui/number-ticker'
import { BlurFade } from '@/components/ui/blur-fade'

const STATS = [
  { value: 6, suffix: '', label: 'Pôles' },
  { value: 200, suffix: '+', label: 'Membres' },
  { value: 30, suffix: '+', label: 'Partenaires' },
  { value: 20, suffix: '+', label: 'Événements / an' },
]

export function Stats() {
  return (
    <section className="border-y border-border">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
        {STATS.map((stat, i) => (
          <BlurFade key={stat.label} delay={i * 0.1} inView>
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tighter leading-none">
                <NumberTicker value={stat.value} />
                <span>{stat.suffix}</span>
              </div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mt-3">
                {stat.label}
              </p>
            </div>
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to `app/page.tsx`**
```tsx
import { Hero } from '@/components/landing/hero'
import { Stats } from '@/components/landing/stats'

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Stats />
    </div>
  )
}
```

- [ ] **Step 3: Verify — numbers count up from 0 when scrolled into view**

- [ ] **Step 4: Commit**
```bash
git add components/landing/stats.tsx app/page.tsx
git commit -m "feat: add Stats section with NumberTicker count-up animation"
```

---

## Task 9: Landing — Team Preview Section

**Files:**
- Create: `components/landing/team-preview.tsx`

- [ ] **Step 1: Create TeamPreview**

Create `components/landing/team-preview.tsx`:
```tsx
import Link from 'next/link'
import { BlurFade } from '@/components/ui/blur-fade'
import { PoleSection } from '@/components/shared/pole-section'
import { getTeam } from '@/lib/data'

const MAIN_POLES = ['Bureau', 'Finance de Marché', "Finance d'Entreprise"]
const COMPACT_POLES = ['Formation', 'Alumni', 'Partenariat']

export function TeamPreview() {
  const team = getTeam()
  const mainPoles = team.filter(p => MAIN_POLES.includes(p.pole))
  const compactPoles = team.filter(p => COMPACT_POLES.includes(p.pole))

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <BlurFade delay={0} inView>
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
              Organisation
            </p>
            <h2 className="text-4xl font-bold tracking-tight">Notre équipe</h2>
          </div>
          <Link
            href="/equipe"
            className="text-sm text-muted-foreground border-b border-muted-foreground/30 pb-0.5 hover:text-foreground transition-colors hidden sm:block"
          >
            Voir tous les membres →
          </Link>
        </div>
      </BlurFade>

      {mainPoles.map((pole, i) => (
        <PoleSection key={pole.pole} pole={pole} index={i} />
      ))}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        {compactPoles.map((pole, i) => (
          <BlurFade key={pole.pole} delay={(mainPoles.length + i) * 0.1} inView>
            <div className="rounded-xl border border-border bg-card p-6">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">
                {pole.badge}
              </span>
              <h3 className="text-lg font-semibold mt-2 mb-3">{pole.pole}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {pole.description}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {pole.members.slice(0, 3).map(member => (
                  <div key={member.name} className="flex flex-col items-center gap-1">
                    <div className="size-9 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground">
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      {member.name.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to `app/page.tsx`**
```tsx
import { Hero } from '@/components/landing/hero'
import { Stats } from '@/components/landing/stats'
import { TeamPreview } from '@/components/landing/team-preview'

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Stats />
      <TeamPreview />
    </div>
  )
}
```

- [ ] **Step 3: Verify — pôles scroll in with blur-fade, magic-card spotlight works on member cards**

- [ ] **Step 4: Commit**
```bash
git add components/landing/team-preview.tsx app/page.tsx
git commit -m "feat: add TeamPreview section with pole sections and compact grid"
```

---

## Task 10: Landing — Events Preview Section

**Files:**
- Create: `components/landing/events-preview.tsx`

- [ ] **Step 1: Create EventsPreview**

`EventsPreview` receives data as props (fetched by the RSC parent in `app/page.tsx`) and is `'use client'` only for the interactive Tabs.

Create `components/landing/events-preview.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { BlurFade } from '@/components/ui/blur-fade'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnimatedList } from '@/components/ui/animated-list'
import { BorderBeam } from '@/components/ui/border-beam'
import { EventCard } from '@/components/shared/event-card'
import { EventRow } from '@/components/shared/event-row'
import type { Event } from '@/lib/types'

interface EventsPreviewProps {
  upcoming: Event[]
  past: Event[]
}

export function EventsPreview({ upcoming, past }: EventsPreviewProps) {

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <BlurFade delay={0} inView>
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
              Agenda & Rétrospective
            </p>
            <h2 className="text-4xl font-bold tracking-tight">Événements</h2>
          </div>
          <Link
            href="/evenements"
            className="text-sm text-muted-foreground border-b border-muted-foreground/30 pb-0.5 hover:text-foreground transition-colors hidden sm:block"
          >
            Voir tous →
          </Link>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} inView>
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-8 bg-secondary border border-border">
            <TabsTrigger value="upcoming">À venir</TabsTrigger>
            <TabsTrigger value="past">Passés</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="relative rounded-xl border border-border bg-card overflow-hidden">
              {upcoming[0] && <BorderBeam size={250} duration={12} />}
              <AnimatedList delay={200}>
                {upcoming.map((event, i) => (
                  <EventRow key={event.id} event={event} featured={i === 0} />
                ))}
              </AnimatedList>
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {past.map((event, i) => (
                <BlurFade key={event.id} delay={i * 0.08} inView>
                  <EventCard event={event} />
                </BlurFade>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </BlurFade>
    </section>
  )
}
```

- [ ] **Step 2: Add to `app/page.tsx`**
```tsx
import { Hero } from '@/components/landing/hero'
import { Stats } from '@/components/landing/stats'
import { TeamPreview } from '@/components/landing/team-preview'
import { EventsPreview } from '@/components/landing/events-preview'

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Stats />
      <TeamPreview />
      <EventsPreview />
    </div>
  )
}
```

- [ ] **Step 3: Verify — tabs switch, border-beam on first event, past events in grid**

- [ ] **Step 4: Commit**
```bash
git add components/landing/events-preview.tsx app/page.tsx
git commit -m "feat: add EventsPreview with tabs, animated-list, and border-beam"
```

---

## Task 11: Landing — Partners Marquee + CTA + Assemble

**Files:**
- Create: `components/landing/partners-marquee.tsx`
- Create: `components/landing/partners-cta.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create PartnersMarquee**

Create `components/landing/partners-marquee.tsx`:
```tsx
import { Marquee } from '@/components/ui/marquee'
import { getPartners } from '@/lib/data'
import { BlurFade } from '@/components/ui/blur-fade'

export function PartnersMarquee() {
  const partners = getPartners()
  const half = Math.ceil(partners.length / 2)
  const row1 = partners.slice(0, half)
  const row2 = partners.slice(half)

  return (
    <section id="partenaires" className="py-20 border-t border-border overflow-hidden">
      <BlurFade delay={0} inView>
        <p className="text-center text-xs tracking-widest uppercase text-muted-foreground mb-10">
          Ils nous font confiance
        </p>
      </BlurFade>

      <div className="flex flex-col gap-4">
        <Marquee pauseOnHover className="[--duration:30s]">
          {row1.map(partner => (
            <div
              key={partner.name}
              className="flex items-center justify-center px-8 text-sm font-semibold text-muted-foreground/40 hover:text-muted-foreground transition-colors whitespace-nowrap"
            >
              {partner.name}
            </div>
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:25s]">
          {row2.map(partner => (
            <div
              key={partner.name}
              className="flex items-center justify-center px-8 text-sm font-semibold text-muted-foreground/40 hover:text-muted-foreground transition-colors whitespace-nowrap"
            >
              {partner.name}
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create PartnersCta**

Create `components/landing/partners-cta.tsx`:
```tsx
import Link from 'next/link'
import { DotPattern } from '@/components/ui/dot-pattern'
import { TextAnimate } from '@/components/ui/text-animate'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { BlurFade } from '@/components/ui/blur-fade'
import { cn } from '@/lib/utils'

export function PartnersCta() {
  return (
    <section className="relative py-32 px-6 overflow-hidden border-t border-border">
      <DotPattern
        className={cn(
          'absolute inset-0 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]',
        )}
        cr={1}
        cx={1}
        cy={1}
      />
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <BlurFade delay={0} inView>
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-6">
            Partenariat
          </p>
        </BlurFade>

        <TextAnimate
          animation="blurInUp"
          by="word"
          className="text-4xl sm:text-5xl font-extrabold tracking-tighter leading-tight mb-6"
        >
          Collaborez avec CentraleSupélec Finance.
        </TextAnimate>

        <BlurFade delay={0.4} inView>
          <p className="text-muted-foreground leading-relaxed mb-10 text-base">
            Accédez à un vivier d&apos;étudiants d&apos;excellence en finance. Workshops, sponsoring, conférences — construisons quelque chose ensemble.
          </p>
        </BlurFade>

        <BlurFade delay={0.5} inView>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/contact">
              <ShimmerButton className="px-8 py-3 text-sm font-semibold">
                Nous contacter →
              </ShimmerButton>
            </Link>
            <a
              href="#partenaires"
              className="px-8 py-3 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Voir nos partenaires
            </a>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Assemble full landing page**

Replace `app/page.tsx` — RSC fetches data and passes to client components:
```tsx
import { Hero } from '@/components/landing/hero'
import { Stats } from '@/components/landing/stats'
import { TeamPreview } from '@/components/landing/team-preview'
import { EventsPreview } from '@/components/landing/events-preview'
import { PartnersMarquee } from '@/components/landing/partners-marquee'
import { PartnersCta } from '@/components/landing/partners-cta'
import { getUpcomingEvents, getPastEvents } from '@/lib/data'

export default function HomePage() {
  const upcoming = getUpcomingEvents().slice(0, 3)
  const past = getPastEvents().slice(0, 3)

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

- [ ] **Step 4: Verify full landing scroll — all sections present and animated**

- [ ] **Step 5: Commit**
```bash
git add components/landing/partners-marquee.tsx components/landing/partners-cta.tsx app/page.tsx
git commit -m "feat: complete landing page with partners marquee and CTA"
```

---

## Task 12: Page Événements (/evenements)

**Files:**
- Create: `app/evenements/page.tsx`

- [ ] **Step 1: Create Events page**

Create `app/evenements/page.tsx`:
```tsx
import { BlurFade } from '@/components/ui/blur-fade'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnimatedList } from '@/components/ui/animated-list'
import { BorderBeam } from '@/components/ui/border-beam'
import { EventCard } from '@/components/shared/event-card'
import { EventRow } from '@/components/shared/event-row'
import { getUpcomingEvents, getPastEvents } from '@/lib/data'

export const metadata = {
  title: 'Événements — CentraleSupélec Finance',
  description: 'Tous les événements organisés par CentraleSupélec Finance.',
}

export default function EventsPage() {
  const upcoming = getUpcomingEvents()
  const past = getPastEvents()

  return (
    <div className="pt-24 pb-24 px-6 max-w-6xl mx-auto">
      <BlurFade delay={0.1} inView>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
          Agenda & Rétrospective
        </p>
        <h1 className="text-5xl font-extrabold tracking-tighter mb-4">Événements</h1>
        <p className="text-muted-foreground max-w-xl mb-12">
          Conférences avec des institutions de premier rang, workshops, networking, crack the case — une année riche en rencontres professionnelles.
        </p>
      </BlurFade>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-10 bg-secondary border border-border">
          <TabsTrigger value="upcoming">À venir ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Passés ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="relative rounded-xl border border-border bg-card overflow-hidden">
            {upcoming[0] && <BorderBeam size={300} duration={12} />}
            <AnimatedList delay={150}>
              {upcoming.map((event, i) => (
                <EventRow key={event.id} event={event} featured={i === 0} />
              ))}
            </AnimatedList>
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {past.map((event, i) => (
              <BlurFade key={event.id} delay={i * 0.07} inView>
                <EventCard event={event} />
              </BlurFade>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Verify at http://localhost:3000/evenements**

- [ ] **Step 3: Commit**
```bash
git add app/evenements/
git commit -m "feat: add Events page with full list and tab filtering"
```

---

## Task 13: Page Équipe (/equipe)

**Files:**
- Create: `app/equipe/page.tsx`

- [ ] **Step 1: Create Team page**

Create `app/equipe/page.tsx`:
```tsx
import { BlurFade } from '@/components/ui/blur-fade'
import { PoleSection } from '@/components/shared/pole-section'
import { AvatarCircles } from '@/components/ui/avatar-circles'
import { getTeam } from '@/lib/data'

export const metadata = {
  title: 'Équipe — CentraleSupélec Finance',
  description: "Les membres de CentraleSupélec Finance, organisés par pôle.",
}

export default function TeamPage() {
  const team = getTeam()
  const allMembers = team.flatMap(p => p.members)
  const allAvatars = allMembers.map(m => ({
    imageUrl: m.photo ?? '',
    profileUrl: m.linkedin ?? '#',
  }))

  return (
    <div className="pt-24 pb-24 px-6 max-w-6xl mx-auto">
      <BlurFade delay={0.1} inView>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
          Organisation
        </p>
        <h1 className="text-5xl font-extrabold tracking-tighter mb-4">Notre équipe</h1>
        <div className="flex items-center gap-4 mb-12">
          <AvatarCircles
            numPeople={allMembers.length}
            avatarUrls={allAvatars.slice(0, 6)}
          />
          <p className="text-sm text-muted-foreground">
            {allMembers.length} membres · 6 pôles
          </p>
        </div>
      </BlurFade>

      <div>
        {team.map((pole, i) => (
          <PoleSection key={pole.pole} pole={pole} index={i} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify at http://localhost:3000/equipe**

- [ ] **Step 3: Commit**
```bash
git add app/equipe/
git commit -m "feat: add Team page with all poles and member cards"
```

---

## Task 14: Page À propos (/a-propos)

**Files:**
- Create: `app/a-propos/page.tsx`

- [ ] **Step 1: Create About page**

Create `app/a-propos/page.tsx`:
```tsx
import { BlurFade } from '@/components/ui/blur-fade'
import { NumberTicker } from '@/components/ui/number-ticker'
import { Separator } from '@/components/ui/separator'
import { getTeam } from '@/lib/data'

export const metadata = {
  title: 'À propos — CentraleSupélec Finance',
  description: "Histoire, mission et valeurs de CentraleSupélec Finance.",
}

const STATS = [
  { value: 6, suffix: '', label: 'Pôles' },
  { value: 200, suffix: '+', label: 'Membres' },
  { value: 30, suffix: '+', label: 'Partenaires' },
  { value: 20, suffix: '+', label: 'Événements / an' },
]

export default function AboutPage() {
  const team = getTeam()

  return (
    <div className="pt-24 pb-24 max-w-6xl mx-auto px-6">
      <BlurFade delay={0.1} inView>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
          À propos
        </p>
        <h1 className="text-5xl font-extrabold tracking-tighter mb-8 max-w-2xl">
          L&apos;association finance de référence à CentraleSupélec.
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl text-base mb-12">
          CentraleSupélec Finance rassemble les étudiants passionnés par la finance. Nous organisons des événements de haut niveau avec les meilleures institutions financières, proposons des formations intensives, et construisons un réseau solide entre membres et alumni.
        </p>
      </BlurFade>

      <Separator className="mb-12" />

      <BlurFade delay={0.2} inView>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-extrabold tracking-tighter leading-none mb-2">
                <NumberTicker value={stat.value} />
                <span>{stat.suffix}</span>
              </div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </BlurFade>

      <Separator className="mb-12" />

      <BlurFade delay={0.3} inView>
        <h2 className="text-2xl font-bold tracking-tight mb-8">Nos pôles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((pole, i) => (
            <BlurFade key={pole.pole} delay={0.3 + i * 0.07} inView>
              <div className="rounded-xl border border-border bg-card p-6">
                <span className="text-xs tracking-widest uppercase text-muted-foreground">
                  {pole.badge}
                </span>
                <h3 className="text-lg font-semibold mt-2 mb-3">{pole.pole}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pole.description}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>
      </BlurFade>
    </div>
  )
}
```

- [ ] **Step 2: Verify at http://localhost:3000/a-propos**

- [ ] **Step 3: Commit**
```bash
git add app/a-propos/
git commit -m "feat: add About page with stats and pole descriptions"
```

---

## Task 15: Page Contact + Server Action (avec tests)

**Files:**
- Create: `app/contact/actions.ts`
- Create: `app/contact/page.tsx`
- Create: `__tests__/actions.test.ts`

- [ ] **Step 1: Write failing tests for the Server Action**

Create `__tests__/actions.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Resend before importing actions
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null }),
    },
  })),
}))

// Mock environment variable
vi.stubEnv('RESEND_API_KEY', 'test-key')
vi.stubEnv('CONTACT_EMAIL', 'contact@csf.fr')

const { sendContactEmail } = await import('@/app/contact/actions')

describe('sendContactEmail', () => {
  it('returns success when all fields are valid', async () => {
    const result = await sendContactEmail({
      name: 'Jean Dupont',
      company: 'Goldman Sachs',
      email: 'jean@goldman.com',
      subject: 'partnership',
      message: 'Bonjour, nous souhaitons organiser un événement avec votre association.',
    })
    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('returns error when email is invalid', async () => {
    const result = await sendContactEmail({
      name: 'Jean',
      company: 'GS',
      email: 'not-an-email',
      subject: 'partnership',
      message: 'Test',
    })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/email/i)
  })

  it('returns error when required fields are missing', async () => {
    const result = await sendContactEmail({
      name: '',
      company: 'GS',
      email: 'jean@gs.com',
      subject: 'partnership',
      message: 'Test',
    })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/nom/i)
  })

  it('returns error when message is too short', async () => {
    const result = await sendContactEmail({
      name: 'Jean',
      company: 'GS',
      email: 'jean@gs.com',
      subject: 'partnership',
      message: 'Hi',
    })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/message/i)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**
```bash
npm run test:run -- __tests__/actions.test.ts
```
Expected: FAIL — `Cannot find module '@/app/contact/actions'`

- [ ] **Step 3: Set up Resend environment variable**

Create `.env.local`:
```
RESEND_API_KEY=your_resend_api_key_here
CONTACT_EMAIL=contact@csf.fr
```

Add `.env.local` to `.gitignore` if not already there.

- [ ] **Step 4: Implement Server Action**

Create `app/contact/actions.ts`:
```typescript
'use server'

import { Resend } from 'resend'

interface ContactFormData {
  name: string
  company: string
  email: string
  subject: string
  message: string
}

interface ActionResult {
  success: boolean
  error?: string
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function sendContactEmail(data: ContactFormData): Promise<ActionResult> {
  if (!data.name.trim()) {
    return { success: false, error: 'Le nom est requis.' }
  }
  if (!validateEmail(data.email)) {
    return { success: false, error: "L'adresse email n'est pas valide." }
  }
  if (data.message.trim().length < 10) {
    return { success: false, error: 'Le message est trop court (10 caractères minimum).' }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const to = process.env.CONTACT_EMAIL ?? 'contact@csf.fr'

  const { error } = await resend.emails.send({
    from: 'CSF Contact <onboarding@resend.dev>',
    to,
    subject: `[CSF] Nouveau message — ${data.subject} (${data.company})`,
    html: `
      <h2>Nouveau message via le site CSF</h2>
      <p><strong>Nom :</strong> ${data.name}</p>
      <p><strong>Société :</strong> ${data.company}</p>
      <p><strong>Email :</strong> ${data.email}</p>
      <p><strong>Sujet :</strong> ${data.subject}</p>
      <hr />
      <p>${data.message.replace(/\n/g, '<br>')}</p>
    `,
  })

  if (error) {
    return { success: false, error: "Une erreur est survenue lors de l'envoi." }
  }

  return { success: true }
}
```

- [ ] **Step 5: Run tests to verify they pass**
```bash
npm run test:run -- __tests__/actions.test.ts
```
Expected: All 4 tests PASS.

- [ ] **Step 6: Create Contact page**

Create `app/contact/page.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ShineBorder } from '@/components/ui/shine-border'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { BlurFade } from '@/components/ui/blur-fade'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { sendContactEmail } from './actions'

const SUBJECTS = [
  { value: 'partnership', label: 'Partenariat événementiel' },
  { value: 'sponsoring', label: 'Sponsoring' },
  { value: 'conference', label: 'Conférence / Workshop' },
  { value: 'recruiting', label: 'Recrutement' },
  { value: 'other', label: 'Autre' },
]

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      company: (form.elements.namedItem('company') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      subject,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    }

    const result = await sendContactEmail(data)
    setLoading(false)

    if (result.success) {
      toast.success('Message envoyé !', {
        description: 'Nous vous répondrons dans les meilleurs délais.',
      })
      form.reset()
      setSubject('')
    } else {
      toast.error('Erreur', { description: result.error })
    }
  }

  return (
    <div className="pt-24 pb-24 px-6 max-w-2xl mx-auto">
      <BlurFade delay={0.1} inView>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
          Partenariat
        </p>
        <h1 className="text-5xl font-extrabold tracking-tighter mb-4">
          Collaborons ensemble.
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-12">
          Vous souhaitez organiser un événement, sponsoriser une activité ou rencontrer nos membres ? Écrivez-nous.
        </p>
      </BlurFade>

      <BlurFade delay={0.2} inView>
        <ShineBorder
          className="rounded-xl border border-border bg-card p-8"
          color={['#333', '#555', '#222']}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-xs tracking-widest uppercase text-muted-foreground">
                  Nom *
                </label>
                <Input id="name" name="name" required placeholder="Jean Dupont" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="company" className="text-xs tracking-widest uppercase text-muted-foreground">
                  Société *
                </label>
                <Input id="company" name="company" required placeholder="Goldman Sachs" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs tracking-widest uppercase text-muted-foreground">
                Email *
              </label>
              <Input id="email" name="email" type="email" required placeholder="jean@goldman.com" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs tracking-widest uppercase text-muted-foreground">
                Sujet *
              </label>
              <Select onValueChange={setSubject} value={subject} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un sujet" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-xs tracking-widest uppercase text-muted-foreground">
                Message *
              </label>
              <Textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="Décrivez votre projet ou demande..."
              />
            </div>

            <ShimmerButton
              type="submit"
              disabled={loading || !subject}
              className="w-full py-3 text-sm font-semibold"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le message →'}
            </ShimmerButton>
          </form>
        </ShineBorder>
      </BlurFade>
    </div>
  )
}
```

- [ ] **Step 7: Verify at http://localhost:3000/contact — form renders, submission shows toast**

- [ ] **Step 8: Commit**
```bash
git add app/contact/ __tests__/actions.test.ts .env.local
git commit -m "feat: add Contact page with Server Action and Resend email"
```

---

## Task 16: Final Polish + Build Verification

**Files:**
- Modify: `app/globals.css` (scroll behavior)
- Modify: `next.config.ts` (image domains if needed)

- [ ] **Step 1: Add smooth scrolling + scrollbar styling to globals.css**

Append to `app/globals.css`:
```css
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #0a0a0a;
}
::-webkit-scrollbar-thumb {
  background: #2a2a2a;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #3a3a3a;
}
```

- [ ] **Step 2: Add `prefers-reduced-motion` support**

Append to `app/globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Run all tests**
```bash
npm run test:run
```
Expected: All tests PASS.

- [ ] **Step 4: Run production build**
```bash
npm run build
```
Expected: Build succeeds with no errors. Note any warnings about missing images (expected — placeholder data has `null` image paths).

- [ ] **Step 5: Run full test suite one final time to confirm green**
```bash
npm run test:run
```

- [ ] **Step 6: Final commit**
```bash
git add .
git commit -m "feat: add scroll polish, reduced-motion support, verify production build"
```

---

## Summary

| Task | What's built |
|---|---|
| 1 | Next.js project, Tailwind dark theme, Vitest |
| 2 | TypeScript types, JSON data files, typed getters |
| 3 | shadcn/ui + MagicUI components installed |
| 4 | MemberCard + PoleSection shared components |
| 5 | EventCard + EventRow shared components |
| 6 | Navbar (scroll blur) + Footer + root layout |
| 7 | Hero (dot-pattern, text-animate, shimmer-button) |
| 8 | Stats (number-ticker count-up) |
| 9 | TeamPreview (poles + member grid) |
| 10 | EventsPreview (tabs, animated-list, border-beam) |
| 11 | Partners marquee + CTA + landing assembled |
| 12 | Events page (/evenements) |
| 13 | Team page (/equipe) |
| 14 | About page (/a-propos) |
| 15 | Contact page + Server Action + tests |
| 16 | Polish + build verification |
