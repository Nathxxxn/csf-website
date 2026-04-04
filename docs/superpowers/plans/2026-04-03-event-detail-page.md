# Event Detail Page — Scroll Hero + Content Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework each event detail page with a scroll-driven expanding image hero, followed by a partner description, event highlights, an alternating photo+caption section, and a partnership CTA.

**Architecture:** `scroll-expansion-hero.tsx` is a client component adapted from the provided spec (image-only, `motion/react` instead of `framer-motion`). The content sections are simple presentational components rendered as children of the hero. The `Event` type gains `partnerDescription: string`, `highlights: EventHighlight[]`, and `photos: EventPhoto[]`. A shared `PartnershipCTA` is extracted from the events page and reused on the detail page.

**Tech Stack:** Next.js 15 app router, motion/react, next/image, Tailwind CSS v4, TypeScript

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `lib/types.ts` | Add EventHighlight, EventPhoto interfaces; extend Event |
| Modify | `data/events.json` | Add partnerDescription, highlights, photos to all 6 events |
| Modify | `lib/__tests__/data.test.ts` | Tests for new Event fields |
| Create | `components/ui/scroll-expansion-hero.tsx` | Scroll-driven expanding image hero (client) |
| Create | `components/events/event-partner-section.tsx` | Partner description block |
| Create | `components/events/event-highlights-section.tsx` | Activity highlights card grid |
| Create | `components/events/event-photos-section.tsx` | Alternating photo + caption layout |
| Create | `components/shared/partnership-cta.tsx` | Shared partnership CTA (extracted from events page) |
| Modify | `app/evenements/[id]/page.tsx` | Full redesign using new components |
| Modify | `app/evenements/page.tsx` | Use shared PartnershipCTA |

---

## Task 1: Extend Event data model

**Files:**
- Modify: `lib/types.ts`
- Modify: `data/events.json`
- Modify: `lib/__tests__/data.test.ts`

- [ ] **Step 1: Write failing tests**

Add a new `describe` block at the end of `lib/__tests__/data.test.ts` (after the existing `describe('event images')` block):

```ts
describe('event detail data', () => {
  it('events have a non-empty partnerDescription', () => {
    const events = getEvents()
    for (const event of events) {
      expect(event.partnerDescription, `${event.id} should have partnerDescription`).toBeTruthy()
    }
  })

  it('events have at least one highlight with title and description', () => {
    const events = getEvents()
    for (const event of events) {
      expect(event.highlights.length, `${event.id} should have highlights`).toBeGreaterThan(0)
      for (const h of event.highlights) {
        expect(h.title, `highlight title in ${event.id}`).toBeTruthy()
        expect(h.description, `highlight description in ${event.id}`).toBeTruthy()
      }
    }
  })

  it('events have at least one photo with src and caption', () => {
    const events = getEvents()
    for (const event of events) {
      expect(event.photos.length, `${event.id} should have photos`).toBeGreaterThan(0)
      for (const p of event.photos) {
        expect(p.src, `photo src in ${event.id}`).toBeTruthy()
        expect(p.caption, `photo caption in ${event.id}`).toBeTruthy()
      }
    }
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/nathandifraja/CSF_website && npx vitest run lib/__tests__/data.test.ts 2>&1 | tail -15
```

Expected: 3 new tests FAIL with `event.partnerDescription is not a property` / type errors.

- [ ] **Step 3: Extend lib/types.ts**

Replace the entire contents of `lib/types.ts` with:

```ts
export interface Member {
  name: string
  role: string
  photo: string | null
  linkedin: string | null
  bio?: string
  skills?: string[]
  email?: string
}

export interface PoleData {
  pole: string
  badge: string
  description: string
  members: Member[]
}

export interface EventHighlight {
  title: string
  description: string
}

export interface EventPhoto {
  src: string
  caption: string
}

export interface Event {
  id: string
  title: string
  date: string
  partner: string
  partnerDescription: string
  pole: string
  description: string
  image: string | null
  images: string[]
  highlights: EventHighlight[]
  photos: EventPhoto[]
  status: 'upcoming' | 'past'
}

export interface Partner {
  name: string
  logo: string
}
```

- [ ] **Step 4: Replace data/events.json entirely**

```json
[
  {
    "id": "mock-trading-bnp-2025-04",
    "title": "Mock Trading Session",
    "date": "2025-04-15",
    "partner": "BNP Paribas CIB",
    "partnerDescription": "BNP Paribas CIB est la division Corporate & Institutional Banking du groupe BNP Paribas, l'une des banques les mieux notées d'Europe. Présente dans 57 pays, elle offre des solutions sur mesure en matière de financement, de marchés de capitaux et de gestion des risques à ses clients institutionnels et grands corporates. Son pôle Global Markets est l'un des plus actifs de la Place de Paris.",
    "pole": "Finance de Marché",
    "description": "Simulation de trading en live avec des traders senior. Accès aux outils professionnels de BNP Paribas CIB.",
    "image": "https://images.unsplash.com/photo-1529218402470-5dec8fea0761?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1529218402470-5dec8fea0761?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608875004752-2fdb6a39ba4c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1528361237150-8a9a7df33035?w=800&auto=format&fit=crop&q=80"
    ],
    "highlights": [
      {
        "title": "Session de trading live",
        "description": "Simulation en conditions réelles sur les plateformes professionnelles de BNP Paribas, avec accès aux flux de marché en direct et aux outils d'exécution institutionnels."
      },
      {
        "title": "Masterclass traders senior",
        "description": "Échange approfondi avec des traders du desk sur les stratégies de trading, la gestion du P&L et les parcours de carrière en salle des marchés."
      },
      {
        "title": "Buffet & networking",
        "description": "Soirée de networking dans les locaux de BNP Paribas CIB, permettant des échanges libres avec les équipes Sales & Trading et Fixed Income."
      }
    ],
    "photos": [
      {
        "src": "https://images.unsplash.com/photo-1529218402470-5dec8fea0761?w=800&auto=format&fit=crop&q=80",
        "caption": "Accès direct aux plateformes de trading de BNP Paribas CIB en conditions de marché réelles, avec supervision des traders en poste."
      },
      {
        "src": "https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?w=800&auto=format&fit=crop&q=80",
        "caption": "Présentation des stratégies de gestion de portefeuille par un trader senior du desk Rates, devant l'ensemble des participants."
      },
      {
        "src": "https://images.unsplash.com/photo-1608875004752-2fdb6a39ba4c?w=800&auto=format&fit=crop&q=80",
        "caption": "Sessions de simulation en binôme : prise de position, gestion du P&L et analyse post-trade en conditions réelles."
      },
      {
        "src": "https://images.unsplash.com/photo-1528361237150-8a9a7df33035?w=800&auto=format&fit=crop&q=80",
        "caption": "Moment de networking avec les équipes Sales & Trading autour d'un buffet dans les locaux parisiens de la banque."
      }
    ],
    "status": "upcoming"
  },
  {
    "id": "crack-the-case-mckinsey-2025-04",
    "title": "Crack the Case",
    "date": "2025-04-22",
    "partner": "McKinsey & Company",
    "partnerDescription": "McKinsey & Company est l'un des cabinets de conseil en stratégie les plus reconnus au monde, présent dans plus de 65 pays. Ses consultants accompagnent les dirigeants des plus grandes entreprises et institutions publiques sur leurs enjeux de transformation, de fusion-acquisition et de performance opérationnelle. Le bureau de Paris est l'un des plus importants en Europe.",
    "pole": "Finance d'Entreprise",
    "description": "Workshop case study M&A en présence de consultants senior. Simulation d'entretien incluse.",
    "image": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1529218402470-5dec8fea0761?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1564284369929-026ba231f89b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?w=800&auto=format&fit=crop&q=80"
    ],
    "highlights": [
      {
        "title": "Workshop case M&A",
        "description": "Résolution d'un cas de fusion-acquisition réel présenté par des consultants senior de McKinsey, avec analyse financière et recommandation stratégique en équipe."
      },
      {
        "title": "Simulation d'entretien",
        "description": "Entraînement aux entretiens de conseil en conditions réelles : présentation de pitch, questions de fit et correction en direct par les consultants présents."
      },
      {
        "title": "Speed networking",
        "description": "Séquence de rencontres courtes avec les consultants pour recueillir des conseils personnalisés sur les candidatures et les parcours de carrière en conseil."
      }
    ],
    "photos": [
      {
        "src": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
        "caption": "Présentation du cas M&A par des consultants senior de McKinsey : structuration du problème et identification des leviers de valeur."
      },
      {
        "src": "https://images.unsplash.com/photo-1529218402470-5dec8fea0761?w=800&auto=format&fit=crop&q=80",
        "caption": "Travail en groupe sur l'analyse financière du cas : modélisation des synergies et construction de la recommandation stratégique."
      },
      {
        "src": "https://images.unsplash.com/photo-1564284369929-026ba231f89b?w=800&auto=format&fit=crop&q=80",
        "caption": "Restitution des livrables devant un jury de consultants McKinsey simulant les conditions réelles d'un entretien de recrutement."
      },
      {
        "src": "https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?w=800&auto=format&fit=crop&q=80",
        "caption": "Échanges informels après les sessions pour des conseils personnalisés sur les candidatures et les parcours en conseil stratégique."
      }
    ],
    "status": "upcoming"
  },
  {
    "id": "alumni-networking-2025-05",
    "title": "Alumni Networking Evening",
    "date": "2025-05-05",
    "partner": "Alumni CS Finance",
    "partnerDescription": "Le réseau alumni de CentraleSupélec Finance regroupe des professionnels de la finance issus de l'association, travaillant aujourd'hui au sein des plus grandes institutions financières — banques d'investissement, fonds de private equity, asset managers et cabinets de conseil. Leur engagement auprès des étudiants actuels est au cœur de la mission de l'association.",
    "pole": "Alumni",
    "description": "Soirée networking avec des alumni en poste dans des institutions financières de premier rang.",
    "image": "https://images.unsplash.com/photo-1564284369929-026ba231f89b?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1564284369929-026ba231f89b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608875004752-2fdb6a39ba4c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1528361237150-8a9a7df33035?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80"
    ],
    "highlights": [
      {
        "title": "Tables rondes thématiques",
        "description": "Échanges structurés par thème — Private Equity, M&A, Sales & Trading — avec des alumni en poste dans les institutions de référence de la Place."
      },
      {
        "title": "Témoignages de parcours",
        "description": "Interventions d'alumni sur leurs trajectoires depuis CentraleSupélec jusqu'aux postes qu'ils occupent aujourd'hui, avec les conseils qu'ils auraient aimé recevoir."
      },
      {
        "title": "Cocktail networking",
        "description": "Soirée ouverte pour créer des contacts durables avec un réseau de professionnels engagés auprès de l'association depuis leurs débuts de carrière."
      }
    ],
    "photos": [
      {
        "src": "https://images.unsplash.com/photo-1564284369929-026ba231f89b?w=800&auto=format&fit=crop&q=80",
        "caption": "Soirée d'ouverture en présence d'alumni occupant des postes dans les principales institutions financières de la Place de Paris."
      },
      {
        "src": "https://images.unsplash.com/photo-1608875004752-2fdb6a39ba4c?w=800&auto=format&fit=crop&q=80",
        "caption": "Tables rondes thématiques par secteur d'activité — PE, M&A, marchés — permettant des échanges approfondis en petits groupes."
      },
      {
        "src": "https://images.unsplash.com/photo-1528361237150-8a9a7df33035?w=800&auto=format&fit=crop&q=80",
        "caption": "Témoignages de parcours : les alumni reviennent sur leur passage à CS Finance et les portes qu'il leur a ouvertes dans leurs carrières."
      },
      {
        "src": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
        "caption": "Cocktail de clôture pour prolonger les échanges et consolider les connexions établies au cours de la soirée."
      }
    ],
    "status": "upcoming"
  },
  {
    "id": "sales-trading-gs-2025-03",
    "title": "Sales & Trading Day",
    "date": "2025-03-10",
    "partner": "Goldman Sachs",
    "partnerDescription": "Goldman Sachs est l'une des banques d'investissement les plus influentes au monde, présente dans plus de 40 pays. Reconnue pour son excellence en fusion-acquisition, sur les marchés de capitaux et en gestion d'actifs, sa présence à Paris en fait un acteur central de la Place financière européenne et un partenaire de premier rang pour nos membres.",
    "pole": "Finance de Marché",
    "description": "Une journée immersive dans les desks de trading de Goldman Sachs à Paris. 30 membres présents, sessions Q&A avec des MDs.",
    "image": "https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1529218402470-5dec8fea0761?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1564284369929-026ba231f89b?w=800&auto=format&fit=crop&q=80"
    ],
    "highlights": [
      {
        "title": "Visite des desks de trading",
        "description": "Immersion au sein des desks Equities, Fixed Income et FX de Goldman Sachs à Paris, avec présentation des outils, flux d'information et organisation des équipes."
      },
      {
        "title": "Sessions Q&A avec des MDs",
        "description": "Questions-réponses ouvertes avec des Managing Directors sur les carrières en Sales & Trading, les processus de recrutement et les dynamiques de marché actuelles."
      },
      {
        "title": "Déjeuner avec les équipes",
        "description": "Déjeuner informel en petits groupes permettant des échanges libres avec les collaborateurs Goldman Sachs, en dehors du cadre formel des présentations."
      }
    ],
    "photos": [
      {
        "src": "https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?w=800&auto=format&fit=crop&q=80",
        "caption": "Visite des desks de trading Goldman Sachs à Paris, en présence de 30 membres de l'association accompagnés par les équipes RH."
      },
      {
        "src": "https://images.unsplash.com/photo-1529218402470-5dec8fea0761?w=800&auto=format&fit=crop&q=80",
        "caption": "Présentation des marchés actions et fixed income par des Managing Directors en poste, avec focus sur les stratégies de 2025."
      },
      {
        "src": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
        "caption": "Sessions Q&A ouvertes avec les MDs sur les parcours en Sales & Trading, les stages d'été et les programmes de graduate."
      },
      {
        "src": "https://images.unsplash.com/photo-1564284369929-026ba231f89b?w=800&auto=format&fit=crop&q=80",
        "caption": "Déjeuner avec les équipes Goldman Sachs : l'occasion d'échanges informels et de contacts durables avec des professionnels en poste."
      }
    ],
    "status": "past"
  },
  {
    "id": "ma-conference-lazard-2025-02",
    "title": "M&A Conference",
    "date": "2025-02-18",
    "partner": "Lazard",
    "partnerDescription": "Lazard est l'un des cabinets de conseil financier indépendants les plus prestigieux au monde, spécialisé dans le conseil en fusion-acquisition et la gestion d'actifs. Fondé en 1848, il compte parmi ses références les plus grandes transactions de marché et opère dans plus de 40 pays, avec une présence historique à Paris.",
    "pole": "Finance d'Entreprise",
    "description": "Conférence sur les grandes transactions M&A de 2024. Présentation des deals par des banquiers d'affaires Lazard.",
    "image": "https://images.unsplash.com/photo-1608875004752-2fdb6a39ba4c?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1608875004752-2fdb6a39ba4c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1528361237150-8a9a7df33035?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1529218402470-5dec8fea0761?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?w=800&auto=format&fit=crop&q=80"
    ],
    "highlights": [
      {
        "title": "Décryptage de deals 2024",
        "description": "Présentation détaillée des plus grandes transactions M&A de l'année par des banquiers d'affaires Lazard : méthodologie, structuration et enjeux de négociation."
      },
      {
        "title": "Panel de discussion",
        "description": "Table ronde sur les tendances du marché M&A en Europe : secteurs actifs, dynamiques de valorisation et perspectives pour 2025 animée par des professionnels Lazard."
      },
      {
        "title": "Networking banque d'affaires",
        "description": "Moment dédié aux échanges avec l'équipe Lazard sur les opportunités de stage, les processus de recrutement et les conseils pour intégrer la banque d'affaires."
      }
    ],
    "photos": [
      {
        "src": "https://images.unsplash.com/photo-1608875004752-2fdb6a39ba4c?w=800&auto=format&fit=crop&q=80",
        "caption": "Conférence d'ouverture sur les grandes transactions M&A de 2024 présentée par des banquiers d'affaires Lazard devant nos membres."
      },
      {
        "src": "https://images.unsplash.com/photo-1528361237150-8a9a7df33035?w=800&auto=format&fit=crop&q=80",
        "caption": "Décryptage d'un deal step-by-step : de la due diligence à la structuration de l'offre, en passant par la négociation et le closing."
      },
      {
        "src": "https://images.unsplash.com/photo-1529218402470-5dec8fea0761?w=800&auto=format&fit=crop&q=80",
        "caption": "Panel de discussion sur les tendances M&A en Europe pour 2025 : secteurs sous tension, consolidation et nouvelles dynamiques de valorisation."
      },
      {
        "src": "https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?w=800&auto=format&fit=crop&q=80",
        "caption": "Networking avec l'équipe Lazard : échanges sur les stages, le processus de recrutement et les conseils pour intégrer la banque d'affaires."
      }
    ],
    "status": "past"
  },
  {
    "id": "cfa-bootcamp-2025-01",
    "title": "CFA Study Bootcamp",
    "date": "2025-01-25",
    "partner": "CS Finance Formation",
    "partnerDescription": "CS Finance Formation est le pôle pédagogique interne de CentraleSupélec Finance, dédié à la préparation des certifications professionnelles et au renforcement des fondamentaux financiers. En partenariat avec des formateurs certifiés CFA, il propose des sessions intensives tout au long de l'année pour accompagner nos membres vers l'excellence technique.",
    "pole": "Formation",
    "description": "Weekend intensif de préparation CFA Level 1. 40 participants, taux de réussite élevé aux sessions suivantes.",
    "image": "https://images.unsplash.com/photo-1528361237150-8a9a7df33035?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1528361237150-8a9a7df33035?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1564284369929-026ba231f89b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608875004752-2fdb6a39ba4c?w=800&auto=format&fit=crop&q=80"
    ],
    "highlights": [
      {
        "title": "Révisions intensives",
        "description": "Sessions thématiques couvrant l'intégralité du programme CFA Level 1 : Fixed Income, Equity, Derivatives, Economics et Ethical Standards, animées par des formateurs certifiés."
      },
      {
        "title": "Examens blancs chronométrés",
        "description": "Simulations d'examens en conditions réelles suivies de corrections collectives et d'analyse des erreurs fréquentes pour maximiser le score le jour J."
      },
      {
        "title": "Coaching personnalisé",
        "description": "Accompagnement individuel pour identifier les points faibles de chaque participant et construire un plan de révision ciblé pour les semaines suivant le bootcamp."
      }
    ],
    "photos": [
      {
        "src": "https://images.unsplash.com/photo-1528361237150-8a9a7df33035?w=800&auto=format&fit=crop&q=80",
        "caption": "Weekend intensif de préparation CFA Level 1 avec 40 participants et des formateurs certifiés, dans les salles de CentraleSupélec."
      },
      {
        "src": "https://images.unsplash.com/photo-1564284369929-026ba231f89b?w=800&auto=format&fit=crop&q=80",
        "caption": "Sessions de révision thématiques en groupes de travail : Fixed Income et Derivatives avec analyse de cas pratiques."
      },
      {
        "src": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
        "caption": "Simulations d'examens chronométrées en conditions réelles, suivies d'une correction collective des points difficiles."
      },
      {
        "src": "https://images.unsplash.com/photo-1608875004752-2fdb6a39ba4c?w=800&auto=format&fit=crop&q=80",
        "caption": "Bilan de fin de bootcamp : analyse des performances individuelles et construction du plan de révision personnalisé pour chaque participant."
      }
    ],
    "status": "past"
  }
]
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /Users/nathandifraja/CSF_website && npx vitest run lib/__tests__/data.test.ts 2>&1 | tail -10
```

Expected: all 19 tests PASS.

- [ ] **Step 6: TypeScript check**

```bash
cd /Users/nathandifraja/CSF_website && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output (clean).

- [ ] **Step 7: Commit**

```bash
cd /Users/nathandifraja/CSF_website && git add lib/types.ts data/events.json lib/__tests__/data.test.ts && git commit -m "feat: add partnerDescription, highlights, photos to Event type and mock data"
```

---

## Task 2: Create ScrollExpansionHero component

**Files:**
- Create: `components/ui/scroll-expansion-hero.tsx`

This is an image-only adaptation of the provided `scroll-expansion-hero` component spec. Key changes from the original:
- Uses `motion/react` instead of `framer-motion`
- Image-only (no video branch)
- `useRef` for `touchStartY` instead of `useState` (avoids stale closure issues)
- Single `useEffect` dependency on `mediaFullyExpanded` only
- Dark theme text (white, not blue-200)
- `h1` instead of `h2` for accessibility
- Background uses `fill` instead of fixed width/height
- `key` prop support for route reset handled by caller

- [ ] **Step 1: Create the file**

Create `components/ui/scroll-expansion-hero.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'

interface ScrollExpansionHeroProps {
  mediaSrc: string
  bgImageSrc: string
  title?: string
  date?: string
  scrollToExpand?: string
  children?: ReactNode
}

export function ScrollExpansionHero({
  mediaSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand = 'Défiler pour découvrir',
  children,
}: ScrollExpansionHeroProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showContent, setShowContent] = useState(false)
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const touchStartY = useRef(0)

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768)
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  useEffect(() => {
    const handleWheel = (e: Event) => {
      const we = e as globalThis.WheelEvent
      if (mediaFullyExpanded && we.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false)
        we.preventDefault()
      } else if (!mediaFullyExpanded) {
        we.preventDefault()
        setScrollProgress((prev) => {
          const next = Math.min(Math.max(prev + we.deltaY * 0.0009, 0), 1)
          if (next >= 1) {
            setMediaFullyExpanded(true)
            setShowContent(true)
          } else if (next < 0.75) {
            setShowContent(false)
          }
          return next
        })
      }
    }

    const handleTouchStart = (e: Event) => {
      touchStartY.current = (e as TouchEvent).touches[0].clientY
    }

    const handleTouchMove = (e: Event) => {
      const te = e as TouchEvent
      if (!touchStartY.current) return
      const deltaY = touchStartY.current - te.touches[0].clientY
      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false)
        te.preventDefault()
      } else if (!mediaFullyExpanded) {
        te.preventDefault()
        const factor = deltaY < 0 ? 0.008 : 0.005
        setScrollProgress((prev) => {
          const next = Math.min(Math.max(prev + deltaY * factor, 0), 1)
          if (next >= 1) {
            setMediaFullyExpanded(true)
            setShowContent(true)
          } else if (next < 0.75) {
            setShowContent(false)
          }
          return next
        })
        touchStartY.current = te.touches[0].clientY
      }
    }

    const handleTouchEnd = () => {
      touchStartY.current = 0
    }

    const handleScroll = () => {
      if (!mediaFullyExpanded) window.scrollTo(0, 0)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [mediaFullyExpanded])

  const mediaWidth = 300 + scrollProgress * (isMobile ? 650 : 1250)
  const mediaHeight = 400 + scrollProgress * (isMobile ? 200 : 400)
  const textTranslateX = scrollProgress * (isMobile ? 180 : 150)

  const firstWord = title?.split(' ')[0] ?? ''
  const restOfTitle = title?.split(' ').slice(1).join(' ') ?? ''

  return (
    <div className="overflow-x-hidden">
      <section className="relative flex flex-col items-center justify-start min-h-[100dvh]">
        <div className="relative w-full flex flex-col items-center min-h-[100dvh]">
          {/* Fading background image */}
          <motion.div
            className="absolute inset-0 z-0 h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            <Image
              src={bgImageSrc}
              alt=""
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>

          <div className="container mx-auto flex flex-col items-center justify-start relative z-10">
            <div className="flex flex-col items-center justify-center w-full h-[100dvh] relative">
              {/* Expanding image */}
              <div
                className="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden"
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: '95vw',
                  maxHeight: '85vh',
                  boxShadow: '0px 0px 50px rgba(0, 0, 0, 0.4)',
                }}
              >
                <Image
                  src={mediaSrc}
                  alt={title ?? ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 95vw, 1250px"
                  priority
                />
                <motion.div
                  className="absolute inset-0 bg-black/50"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 0.7 - scrollProgress * 0.4 }}
                  transition={{ duration: 0.2 }}
                />
              </div>

              {/* Date sliding left + hint sliding right */}
              <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10">
                {date && (
                  <p
                    className="text-sm text-white/60 tabular-nums"
                    style={{ transform: `translateX(-${textTranslateX}vw)` }}
                  >
                    {date}
                  </p>
                )}
                {!mediaFullyExpanded && (
                  <p
                    className="text-white/40 text-xs font-medium"
                    style={{ transform: `translateX(${textTranslateX}vw)` }}
                  >
                    {scrollToExpand}
                  </p>
                )}
              </div>

              {/* Title — first word slides left, rest slides right */}
              <div className="flex items-center justify-center text-center gap-3 w-full relative z-10 flex-col pointer-events-none select-none">
                <span
                  className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white"
                  style={{ transform: `translateX(-${textTranslateX}vw)` }}
                >
                  {firstWord}
                </span>
                <span
                  className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white"
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                >
                  {restOfTitle}
                </span>
              </div>
            </div>

            {/* Content shown after full expansion */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/nathandifraja/CSF_website && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /Users/nathandifraja/CSF_website && git add components/ui/scroll-expansion-hero.tsx && git commit -m "feat: add ScrollExpansionHero component (image-only scroll expansion)"
```

---

## Task 3: Create content sections and shared PartnershipCTA

**Files:**
- Create: `components/events/event-partner-section.tsx`
- Create: `components/events/event-highlights-section.tsx`
- Create: `components/events/event-photos-section.tsx`
- Create: `components/shared/partnership-cta.tsx`

- [ ] **Step 1: Create components/events/event-partner-section.tsx**

```tsx
import type { Event } from "@/lib/types"

interface EventPartnerSectionProps {
  event: Event
}

export function EventPartnerSection({ event }: EventPartnerSectionProps) {
  return (
    <section className="px-6 max-w-3xl mx-auto pt-20 pb-0">
      <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
        Partenaire
      </p>
      <h2 className="text-2xl font-bold tracking-tighter mb-4">{event.partner}</h2>
      <p className="text-muted-foreground leading-relaxed">{event.partnerDescription}</p>
    </section>
  )
}
```

- [ ] **Step 2: Create components/events/event-highlights-section.tsx**

```tsx
import type { Event } from "@/lib/types"

interface EventHighlightsSectionProps {
  event: Event
}

export function EventHighlightsSection({ event }: EventHighlightsSectionProps) {
  return (
    <section className="px-6 max-w-5xl mx-auto pt-16 pb-0">
      <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
        Programme
      </p>
      <h2 className="text-2xl font-bold tracking-tighter mb-8">
        Ce que nous avons organisé
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {event.highlights.map((highlight) => (
          <div
            key={highlight.title}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold mb-2 text-sm">{highlight.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {highlight.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create components/events/event-photos-section.tsx**

```tsx
import Image from "next/image"
import type { Event } from "@/lib/types"

interface EventPhotosSectionProps {
  event: Event
}

export function EventPhotosSection({ event }: EventPhotosSectionProps) {
  if (event.photos.length === 0) return null

  return (
    <section className="px-6 max-w-5xl mx-auto pt-16 pb-0 space-y-12">
      <div>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
          Galerie
        </p>
        <h2 className="text-2xl font-bold tracking-tighter">
          En images
        </h2>
      </div>
      {event.photos.map((photo, i) => (
        <div
          key={photo.src}
          className={`flex flex-col md:flex-row gap-8 items-center ${
            i % 2 === 1 ? "md:flex-row-reverse" : ""
          }`}
        >
          <div className="w-full md:w-1/2 aspect-video relative rounded-xl overflow-hidden border border-border flex-shrink-0">
            <Image
              src={photo.src}
              alt={photo.caption}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <p className="w-full md:w-1/2 text-muted-foreground leading-relaxed">
            {photo.caption}
          </p>
        </div>
      ))}
    </section>
  )
}
```

- [ ] **Step 4: Create components/shared/partnership-cta.tsx**

```tsx
import Link from "next/link"

export function PartnershipCTA() {
  return (
    <div className="mt-24 px-6 max-w-3xl mx-auto pb-32 text-center">
      <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
        Partenariats
      </p>
      <h2 className="text-3xl font-bold tracking-tighter mb-4">
        Vous souhaitez collaborer avec nous&nbsp;?
      </h2>
      <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
        Nous sommes toujours à la recherche de nouvelles entreprises partenaires
        pour organiser des événements à forte valeur ajoutée pour nos membres.
        Conférences, workshops, visites de desk&nbsp;— parlons-en.
      </p>
      <Link
        href="/contact"
        className="inline-flex items-center gap-2 rounded-md bg-white text-black text-sm font-semibold px-6 py-3 transition-opacity hover:opacity-80"
      >
        Nous contacter
      </Link>
    </div>
  )
}
```

- [ ] **Step 5: TypeScript check**

```bash
cd /Users/nathandifraja/CSF_website && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output.

- [ ] **Step 6: Commit**

```bash
cd /Users/nathandifraja/CSF_website && git add components/events/event-partner-section.tsx components/events/event-highlights-section.tsx components/events/event-photos-section.tsx components/shared/partnership-cta.tsx && git commit -m "feat: add event content sections and shared PartnershipCTA"
```

---

## Task 4: Rework event detail page + refactor events page CTA

**Files:**
- Modify: `app/evenements/[id]/page.tsx`
- Modify: `app/evenements/page.tsx`

- [ ] **Step 1: Replace app/evenements/[id]/page.tsx entirely**

```tsx
import { getEvents, getEventById } from "@/lib/data"
import { notFound } from "next/navigation"
import { ScrollExpansionHero } from "@/components/ui/scroll-expansion-hero"
import { EventPartnerSection } from "@/components/events/event-partner-section"
import { EventHighlightsSection } from "@/components/events/event-highlights-section"
import { EventPhotosSection } from "@/components/events/event-photos-section"
import { PartnershipCTA } from "@/components/shared/partnership-cta"

export async function generateStaticParams() {
  return getEvents().map((e) => ({ id: e.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = getEventById(id)
  if (!event) return {}
  return {
    title: `${event.title} — CentraleSupélec Finance`,
    description: event.description,
  }
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = getEventById(id)
  if (!event) notFound()

  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(event.date))

  const mediaSrc = event.image ?? event.images[0]

  return (
    <ScrollExpansionHero
      key={event.id}
      mediaSrc={mediaSrc}
      bgImageSrc={mediaSrc}
      title={event.title}
      date={formattedDate}
    >
      <EventPartnerSection event={event} />
      <EventHighlightsSection event={event} />
      <EventPhotosSection event={event} />
      <PartnershipCTA />
    </ScrollExpansionHero>
  )
}
```

- [ ] **Step 2: Update app/evenements/page.tsx to use shared PartnershipCTA**

Replace the current inline CTA block in `app/evenements/page.tsx`. The current file is:

```tsx
import { getEvents } from "@/lib/data"
import { EventsPageHeader } from "@/components/events/events-page-header"
import { EventsGallery } from "@/components/events/events-gallery"
import { BlurFade } from "@/components/ui/blur-fade"
import Link from "next/link"

export const metadata = {
  title: "Événements — CentraleSupélec Finance",
  description: "Tous les événements organisés par CentraleSupélec Finance.",
}

export default function EventsPage() {
  const allEvents = getEvents()

  return (
    <div>
      <EventsPageHeader />

      <EventsGallery events={allEvents} />

      <div className="mt-24 px-6 max-w-3xl mx-auto pb-32 text-center">
        <BlurFade delay={0.1} inView>
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
            Partenariats
          </p>
          <h2 className="text-3xl font-bold tracking-tighter mb-4">
            Vous souhaitez collaborer avec nous&nbsp;?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Nous sommes toujours à la recherche de nouvelles entreprises partenaires
            pour organiser des événements à forte valeur ajoutée pour nos membres.
            Conférences, workshops, visites de desk&nbsp;— parlons-en.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-white text-black text-sm font-semibold px-6 py-3 transition-opacity hover:opacity-80"
          >
            Nous contacter
          </Link>
        </BlurFade>
      </div>
    </div>
  )
}
```

Replace it with:

```tsx
import { getEvents } from "@/lib/data"
import { EventsPageHeader } from "@/components/events/events-page-header"
import { EventsGallery } from "@/components/events/events-gallery"
import { PartnershipCTA } from "@/components/shared/partnership-cta"

export const metadata = {
  title: "Événements — CentraleSupélec Finance",
  description: "Tous les événements organisés par CentraleSupélec Finance.",
}

export default function EventsPage() {
  const allEvents = getEvents()

  return (
    <div>
      <EventsPageHeader />

      <EventsGallery events={allEvents} />

      <PartnershipCTA />
    </div>
  )
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/nathandifraja/CSF_website && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output.

- [ ] **Step 4: Run all tests**

```bash
cd /Users/nathandifraja/CSF_website && npx vitest run 2>&1 | tail -8
```

Expected: all 19 tests pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/nathandifraja/CSF_website && git add app/evenements/[id]/page.tsx app/evenements/page.tsx && git commit -m "feat: rework event detail page with scroll hero, partner info, highlights, photos"
```

---

## Verification

- [ ] `npm run dev` → navigate to `/evenements/sales-trading-gs-2025-03`
- [ ] Scrolling on page load triggers the image expansion animation (image grows from ~300px wide to full viewport)
- [ ] Title words slide apart as image expands (first word left, rest right)
- [ ] Date slides left, "Défiler pour découvrir" hint slides right and disappears on full expansion
- [ ] After full expansion, content fades in: partner block → highlights grid → alternating photos → CTA
- [ ] Photos alternate layout: even index = photo left / text right, odd index = text left / photo right
- [ ] CTA button navigates to `/contact`
- [ ] Navigate to `/evenements` → PartnershipCTA appears at bottom (same as detail page)
- [ ] Navigate to `/evenements/does-not-exist` → Next.js 404
