# Admin Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire une console admin graphique permettant de modifier le contenu du site (membres, événements, partenaires, textes) depuis `/admin/dashboard`, avec persistance dans Turso et images sur Vercel Blob.

**Architecture:** Les fichiers JSON statiques (`data/*.json`) sont migrés vers Turso via un script de seed unique. `lib/data.ts` est mis à jour pour lire depuis Turso. Les Server Actions dans `app/admin/actions/` écrivent dans Turso et Vercel Blob. Le dashboard utilise des query params `?tab=` pour la navigation entre 5 onglets.

**Tech Stack:** `@libsql/client` (Turso), `@vercel/blob`, `@dnd-kit/core` + `@dnd-kit/sortable` (drag & drop), Next.js Server Actions, Vitest.

---

## Fichiers créés / modifiés

| Fichier | Action | Rôle |
|---------|--------|------|
| `lib/db.ts` | Créer | Client Turso singleton |
| `lib/schema.sql` | Créer | Définition du schéma DB |
| `lib/types.ts` | Modifier | Ajouter types admin (avec IDs) |
| `lib/data.ts` | Modifier | Remplacer imports JSON par requêtes Turso |
| `scripts/seed.ts` | Créer | Migration one-shot JSON → Turso |
| `app/admin/actions.ts` | Renommer → `app/admin/actions/auth.ts` | Login/logout (inchangé) |
| `app/admin/actions/content.ts` | Créer | Server actions : contenu hero + stats |
| `app/admin/actions/events.ts` | Créer | Server actions : CRUD événements, highlights, photos |
| `app/admin/actions/team.ts` | Créer | Server actions : CRUD pôles + membres |
| `app/admin/actions/partners.ts` | Créer | Server actions : CRUD partenaires |
| `app/admin/page.tsx` | Modifier | Mettre à jour import `login`/`logout` |
| `app/admin/dashboard/page.tsx` | Modifier | Dashboard avec 5 onglets |
| `app/admin/dashboard/evenements/[id]/page.tsx` | Créer | Page d'édition d'un événement |
| `app/admin/dashboard/evenements/new/page.tsx` | Créer | Nouvel événement (redirige vers [id]) |
| `components/admin/image-upload.tsx` | Créer | Composant upload Vercel Blob |
| `components/admin/sortable-list.tsx` | Créer | Wrapper générique dnd-kit |
| `components/admin/tabs/accueil-tab.tsx` | Créer | Tab hero + stats |
| `components/admin/tabs/evenements-tab.tsx` | Créer | Tab liste événements |
| `components/admin/tabs/equipe-tab.tsx` | Créer | Tab pôles + membres |
| `components/admin/tabs/partenaires-tab.tsx` | Créer | Tab partenaires |
| `components/admin/tabs/apropos-tab.tsx` | Créer | Tab texte mission |
| `__tests__/lib/data.test.ts` | Modifier | Adapter pour Turso mocké |
| `__tests__/admin/actions/content.test.ts` | Créer | Tests server actions content |
| `__tests__/admin/actions/events.test.ts` | Créer | Tests server actions events |
| `__tests__/admin/actions/team.test.ts` | Créer | Tests server actions team |
| `__tests__/admin/actions/partners.test.ts` | Créer | Tests server actions partners |
| `.env.example` | Modifier | Ajouter TURSO_* et BLOB_* |
| `middleware.ts` | Aucun | Déjà fonctionnel, aucun changement |

---

## Phase 1 — Setup

### Task 1 : Installer les dépendances

**Files:**
- Modify: `package.json`

- [ ] **Step 1 : Installer les packages**

```bash
cd /Users/nathandifraja/CSF_website
pnpm add @libsql/client @vercel/blob @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Expected: packages ajoutés dans `dependencies`.

- [ ] **Step 2 : Mettre à jour `.env.example`**

Ajouter à la fin de `.env.example` :

```env
# Turso (SQLite edge)
# Dev local : TURSO_DATABASE_URL=file:local.db (pas de TURSO_AUTH_TOKEN nécessaire)
# Production : obtenir sur https://turso.tech
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token-here

# Vercel Blob
# Obtenir sur https://vercel.com/dashboard → Storage → Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

- [ ] **Step 3 : Ajouter à `.env.local` la variable dev**

Ajouter dans `.env.local` :

```env
TURSO_DATABASE_URL=file:local.db
```

(Pas de `TURSO_AUTH_TOKEN` pour SQLite local.)

- [ ] **Step 4 : Commit**

```bash
git add package.json pnpm-lock.yaml .env.example
git commit -m "chore: add turso, vercel blob, dnd-kit dependencies"
```

---

### Task 2 : Créer le client Turso (`lib/db.ts`)

**Files:**
- Create: `lib/db.ts`
- Create: `__tests__/lib/db.test.ts`

- [ ] **Step 1 : Écrire le test**

```typescript
// __tests__/lib/db.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('getDb', () => {
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('throws when TURSO_DATABASE_URL is not set', async () => {
    vi.stubEnv('TURSO_DATABASE_URL', '')
    const { getDb } = await import('@/lib/db')
    expect(() => getDb()).toThrow('TURSO_DATABASE_URL is not set')
  })

  it('returns a client when TURSO_DATABASE_URL is set', async () => {
    vi.stubEnv('TURSO_DATABASE_URL', 'file::memory:')
    const { getDb } = await import('@/lib/db')
    const client = getDb()
    expect(client).toBeDefined()
    expect(typeof client.execute).toBe('function')
  })

  it('returns the same instance on multiple calls', async () => {
    vi.stubEnv('TURSO_DATABASE_URL', 'file::memory:')
    const { getDb } = await import('@/lib/db')
    expect(getDb()).toBe(getDb())
  })
})
```

- [ ] **Step 2 : Vérifier que le test échoue**

```bash
pnpm test __tests__/lib/db.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/db'`

- [ ] **Step 3 : Implémenter `lib/db.ts`**

```typescript
import { createClient, type Client } from '@libsql/client'

let client: Client | null = null

export function getDb(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL
    if (!url) throw new Error('TURSO_DATABASE_URL is not set')

    client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return client
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
pnpm test __tests__/lib/db.test.ts
```

Expected: 3 PASS

- [ ] **Step 5 : Commit**

```bash
git add lib/db.ts __tests__/lib/db.test.ts
git commit -m "feat: add turso db client"
```

---

### Task 3 : Créer le schéma SQL (`lib/schema.sql`)

**Files:**
- Create: `lib/schema.sql`

- [ ] **Step 1 : Créer le fichier de schéma**

```sql
-- lib/schema.sql
CREATE TABLE IF NOT EXISTS poles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  badge TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_url TEXT,
  linkedin TEXT,
  pole_id TEXT NOT NULL REFERENCES poles(id),
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  partner TEXT NOT NULL,
  partner_description TEXT,
  pole TEXT,
  description TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL CHECK(status IN ('upcoming', 'past')),
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS event_highlights (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS event_photos (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

- [ ] **Step 2 : Commit**

```bash
git add lib/schema.sql
git commit -m "feat: add turso database schema"
```

---

## Phase 2 — Couche données

### Task 4 : Script de seed (`scripts/seed.ts`)

Ce script lit les JSON existants et insère les données dans Turso. À exécuter une seule fois.

**Files:**
- Create: `scripts/seed.ts`

- [ ] **Step 1 : Créer le script**

```typescript
// scripts/seed.ts
import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { randomUUID } from 'crypto'
import type { PoleData, Event, Partner } from '../lib/types'

const schemaSQL = readFileSync('./lib/schema.sql', 'utf-8')

const url = process.env.TURSO_DATABASE_URL
if (!url) throw new Error('TURSO_DATABASE_URL is not set')

const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })

const team: PoleData[] = JSON.parse(readFileSync('./data/team.json', 'utf-8'))
const events: Event[] = JSON.parse(readFileSync('./data/events.json', 'utf-8'))
const partners: Partner[] = JSON.parse(readFileSync('./data/partners.json', 'utf-8'))

async function seed() {
  // Apply schema
  for (const statement of schemaSQL.split(';').map(s => s.trim()).filter(Boolean)) {
    await db.execute(statement)
  }

  // Seed poles + members
  for (let poleIndex = 0; poleIndex < team.length; poleIndex++) {
    const poleData = team[poleIndex]
    const poleId = randomUUID()
    await db.execute({
      sql: 'INSERT OR IGNORE INTO poles (id, name, badge, description, order_index) VALUES (?, ?, ?, ?, ?)',
      args: [poleId, poleData.pole, poleData.badge, poleData.description, poleIndex],
    })
    for (let memberIndex = 0; memberIndex < poleData.members.length; memberIndex++) {
      const m = poleData.members[memberIndex]
      await db.execute({
        sql: 'INSERT OR IGNORE INTO team_members (id, name, role, photo_url, linkedin, pole_id, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [randomUUID(), m.name, m.role, m.photo ?? null, m.linkedin ?? null, poleId, memberIndex],
      })
    }
  }

  // Seed events
  for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
    const e = events[eventIndex]
    await db.execute({
      sql: 'INSERT OR IGNORE INTO events (id, title, date, partner, partner_description, pole, description, image_url, status, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [e.id, e.title, e.date, e.partner, e.partnerDescription ?? null, e.pole ?? null, e.description, e.image ?? null, e.status, eventIndex],
    })
    if (e.highlights) {
      for (let hIndex = 0; hIndex < e.highlights.length; hIndex++) {
        const h = e.highlights[hIndex]
        await db.execute({
          sql: 'INSERT OR IGNORE INTO event_highlights (id, event_id, title, description, order_index) VALUES (?, ?, ?, ?, ?)',
          args: [randomUUID(), e.id, h.title, h.description, hIndex],
        })
      }
    }
    if (e.photos) {
      for (let pIndex = 0; pIndex < e.photos.length; pIndex++) {
        const p = e.photos[pIndex]
        await db.execute({
          sql: 'INSERT OR IGNORE INTO event_photos (id, event_id, url, caption, order_index) VALUES (?, ?, ?, ?, ?)',
          args: [randomUUID(), e.id, p.src, p.caption ?? null, pIndex],
        })
      }
    }
  }

  // Seed partners
  for (let partnerIndex = 0; partnerIndex < partners.length; partnerIndex++) {
    const p = partners[partnerIndex]
    await db.execute({
      sql: 'INSERT OR IGNORE INTO partners (id, name, logo_url, order_index) VALUES (?, ?, ?, ?)',
      args: [randomUUID(), p.name, p.logo, partnerIndex],
    })
  }

  // Seed site_content defaults
  const defaults: Array<[string, string]> = [
    ['hero_title', 'Cultivons l\'excellence financière'],
    ['hero_subtitle', 'La Compagnie des Étudiants en Finance vous accompagne dans votre parcours vers les métiers de la finance.'],
    ['stats_poles', '6'],
    ['stats_membres', '200+'],
    ['stats_evenements', '20+'],
    ['apropos_mission_title', 'Notre mission'],
    ['apropos_mission_text', 'La CSF a pour vocation de préparer les étudiants aux métiers de la finance.'],
  ]
  for (const [key, value] of defaults) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO site_content (key, value) VALUES (?, ?)',
      args: [key, value],
    })
  }

  console.log('✓ Seed terminé')
}

seed().catch(console.error)
```

- [ ] **Step 2 : Ajouter le script dans `package.json`**

Dans la section `"scripts"` :
```json
"seed": "tsx scripts/seed.ts"
```

Installer `tsx` si absent :
```bash
pnpm add -D tsx
```

- [ ] **Step 3 : Exécuter le seed**

```bash
pnpm seed
```

Expected: `✓ Seed terminé` — fichier `local.db` créé à la racine.

- [ ] **Step 4 : Ajouter `local.db` au `.gitignore`**

```bash
echo "local.db" >> .gitignore
```

- [ ] **Step 5 : Commit**

```bash
git add scripts/seed.ts package.json pnpm-lock.yaml .gitignore
git commit -m "feat: add db seed script from json data"
```

---

### Task 5 : Mettre à jour `lib/types.ts`

Ajouter les types admin (avec IDs) sans casser les types publics existants.

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1 : Ajouter les types admin**

Ajouter à la fin de `lib/types.ts` :

```typescript
// --- Types admin (avec IDs pour CRUD) ---

export interface AdminMember {
  id: string
  name: string
  role: string
  photo_url: string | null
  linkedin: string | null
  pole_id: string
  order_index: number
}

export interface AdminPole {
  id: string
  name: string
  badge: string
  description: string
  order_index: number
  members: AdminMember[]
}

export interface AdminHighlight {
  id: string
  event_id: string
  title: string
  description: string
  order_index: number
}

export interface AdminPhoto {
  id: string
  event_id: string
  url: string
  caption: string | null
  order_index: number
}

export interface AdminEvent {
  id: string
  title: string
  date: string
  partner: string
  partner_description: string | null
  pole: string | null
  description: string
  image_url: string | null
  status: 'upcoming' | 'past'
  order_index: number
  highlights: AdminHighlight[]
  photos: AdminPhoto[]
}

export interface AdminPartner {
  id: string
  name: string
  logo_url: string
  order_index: number
}

export interface SiteContent {
  hero_title: string
  hero_subtitle: string
  stats_poles: string
  stats_membres: string
  stats_evenements: string
  apropos_mission_title: string
  apropos_mission_text: string
}
```

- [ ] **Step 2 : Commit**

```bash
git add lib/types.ts
git commit -m "feat: add admin types with IDs"
```

---

### Task 6 : Mettre à jour `lib/data.ts` (Turso)

Remplacer les imports JSON par des requêtes Turso, en conservant les mêmes signatures de fonctions publiques.

**Files:**
- Modify: `lib/data.ts`
- Modify: `__tests__/lib/data.test.ts`

- [ ] **Step 1 : Écrire les tests pour les nouvelles fonctions**

Remplacer le contenu de `__tests__/lib/data.test.ts` :

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const executeMock = vi.fn()

vi.mock('@/lib/db', () => ({
  getDb: () => ({ execute: executeMock }),
}))

describe('getTeam', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns poles with their members', async () => {
    executeMock
      .mockResolvedValueOnce({
        rows: [
          { id: 'p1', name: 'Bureau', badge: 'BUR', description: 'Le bureau', order_index: 0 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { id: 'm1', name: 'Alice', role: 'Présidente', photo_url: null, linkedin: null, pole_id: 'p1', order_index: 0 },
        ],
      })

    const { getTeam } = await import('@/lib/data')
    const result = await getTeam()

    expect(result).toHaveLength(1)
    expect(result[0].pole).toBe('Bureau')
    expect(result[0].members).toHaveLength(1)
    expect(result[0].members[0].name).toBe('Alice')
  })
})

describe('getEvents', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns events with highlights and photos', async () => {
    executeMock
      .mockResolvedValueOnce({
        rows: [{ id: 'e1', title: 'Conf', date: '2025-05-01', partner: 'GS', partner_description: null, pole: null, description: 'Desc', image_url: null, status: 'upcoming', order_index: 0 }],
      })
      .mockResolvedValueOnce({ rows: [{ id: 'h1', event_id: 'e1', title: 'HL', description: 'Desc', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [] })

    const { getEvents } = await import('@/lib/data')
    const result = await getEvents()

    expect(result).toHaveLength(1)
    expect(result[0].highlights).toHaveLength(1)
    expect(result[0].photos).toHaveLength(0)
  })
})

describe('getPartners', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns partners ordered by order_index', async () => {
    executeMock.mockResolvedValueOnce({
      rows: [{ id: 'p1', name: 'GS', logo_url: '/gs.png', order_index: 0 }],
    })

    const { getPartners } = await import('@/lib/data')
    const result = await getPartners()

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('GS')
    expect(result[0].logo).toBe('/gs.png')
  })
})
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
pnpm test __tests__/lib/data.test.ts
```

Expected: FAIL (les fonctions retournent encore les données JSON)

- [ ] **Step 3 : Réécrire `lib/data.ts`**

```typescript
import type { PoleData, Event, Partner, AdminPole, AdminEvent, AdminPartner, SiteContent } from './types'
import { getDb } from './db'

// --- Fonctions publiques (utilisées par les pages du site) ---

export async function getTeam(): Promise<PoleData[]> {
  const db = getDb()
  const { rows: poles } = await db.execute('SELECT * FROM poles ORDER BY order_index')
  const { rows: members } = await db.execute('SELECT * FROM team_members ORDER BY order_index')

  return poles.map(pole => ({
    pole: pole.name as string,
    badge: pole.badge as string,
    description: pole.description as string,
    members: members
      .filter(m => m.pole_id === pole.id)
      .map(m => ({
        name: m.name as string,
        role: m.role as string,
        photo: (m.photo_url as string | null) ?? null,
        linkedin: (m.linkedin as string | null) ?? null,
      })),
  }))
}

export async function getEvents(): Promise<Event[]> {
  const db = getDb()
  const { rows: eventRows } = await db.execute('SELECT * FROM events ORDER BY order_index')
  const { rows: highlightRows } = await db.execute('SELECT * FROM event_highlights ORDER BY order_index')
  const { rows: photoRows } = await db.execute('SELECT * FROM event_photos ORDER BY order_index')

  return eventRows.map(e => ({
    id: e.id as string,
    title: e.title as string,
    date: e.date as string,
    partner: e.partner as string,
    partnerDescription: (e.partner_description as string | null) ?? undefined,
    pole: (e.pole as string | null) ?? '',
    description: e.description as string,
    image: (e.image_url as string | null) ?? null,
    images: [],
    status: e.status as 'upcoming' | 'past',
    highlights: highlightRows
      .filter(h => h.event_id === e.id)
      .map(h => ({ title: h.title as string, description: h.description as string })),
    photos: photoRows
      .filter(p => p.event_id === e.id)
      .map(p => ({ src: p.url as string, caption: (p.caption as string | null) ?? '' })),
  }))
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
  const db = getDb()
  const { rows } = await db.execute('SELECT * FROM partners ORDER BY order_index')
  return rows.map(p => ({
    name: p.name as string,
    logo: p.logo_url as string,
  }))
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const events = await getEvents()
  return events.find(e => e.id === id)
}

// --- Fonctions admin (avec IDs) ---

export async function getAdminTeam(): Promise<AdminPole[]> {
  const db = getDb()
  const { rows: poles } = await db.execute('SELECT * FROM poles ORDER BY order_index')
  const { rows: members } = await db.execute('SELECT * FROM team_members ORDER BY order_index')

  return poles.map(pole => ({
    id: pole.id as string,
    name: pole.name as string,
    badge: pole.badge as string,
    description: pole.description as string,
    order_index: pole.order_index as number,
    members: members
      .filter(m => m.pole_id === pole.id)
      .map(m => ({
        id: m.id as string,
        name: m.name as string,
        role: m.role as string,
        photo_url: (m.photo_url as string | null) ?? null,
        linkedin: (m.linkedin as string | null) ?? null,
        pole_id: m.pole_id as string,
        order_index: m.order_index as number,
      })),
  }))
}

export async function getAdminEvents(): Promise<AdminEvent[]> {
  const db = getDb()
  const { rows: eventRows } = await db.execute('SELECT * FROM events ORDER BY order_index')
  const { rows: highlightRows } = await db.execute('SELECT * FROM event_highlights ORDER BY order_index')
  const { rows: photoRows } = await db.execute('SELECT * FROM event_photos ORDER BY order_index')

  return eventRows.map(e => ({
    id: e.id as string,
    title: e.title as string,
    date: e.date as string,
    partner: e.partner as string,
    partner_description: (e.partner_description as string | null) ?? null,
    pole: (e.pole as string | null) ?? null,
    description: e.description as string,
    image_url: (e.image_url as string | null) ?? null,
    status: e.status as 'upcoming' | 'past',
    order_index: e.order_index as number,
    highlights: highlightRows
      .filter(h => h.event_id === e.id)
      .map(h => ({
        id: h.id as string,
        event_id: h.event_id as string,
        title: h.title as string,
        description: h.description as string,
        order_index: h.order_index as number,
      })),
    photos: photoRows
      .filter(p => p.event_id === e.id)
      .map(p => ({
        id: p.id as string,
        event_id: p.event_id as string,
        url: p.url as string,
        caption: (p.caption as string | null) ?? null,
        order_index: p.order_index as number,
      })),
  }))
}

export async function getAdminEventById(id: string): Promise<AdminEvent | undefined> {
  const events = await getAdminEvents()
  return events.find(e => e.id === id)
}

export async function getAdminPartners(): Promise<AdminPartner[]> {
  const db = getDb()
  const { rows } = await db.execute('SELECT * FROM partners ORDER BY order_index')
  return rows.map(p => ({
    id: p.id as string,
    name: p.name as string,
    logo_url: p.logo_url as string,
    order_index: p.order_index as number,
  }))
}

export async function getSiteContent(): Promise<SiteContent> {
  const db = getDb()
  const { rows } = await db.execute('SELECT key, value FROM site_content')
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]))
  return {
    hero_title: (map['hero_title'] as string) ?? '',
    hero_subtitle: (map['hero_subtitle'] as string) ?? '',
    stats_poles: (map['stats_poles'] as string) ?? '6',
    stats_membres: (map['stats_membres'] as string) ?? '200+',
    stats_evenements: (map['stats_evenements'] as string) ?? '20+',
    apropos_mission_title: (map['apropos_mission_title'] as string) ?? '',
    apropos_mission_text: (map['apropos_mission_text'] as string) ?? '',
  }
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
pnpm test __tests__/lib/data.test.ts
```

Expected: PASS

- [ ] **Step 5 : Mettre à jour les pages qui appellent `getTeam`, `getEvents`, etc.**

Ces fonctions retournent maintenant des Promises — ajouter `await` partout.

Fichiers à mettre à jour :
- `app/page.tsx` — `await getUpcomingEvents()`, `await getTeam()`, `await getPartners()`
- `app/equipe/page.tsx` — `await getTeam()`
- `app/evenements/page.tsx` — `await getUpcomingEvents()`, `await getPastEvents()`
- `app/evenements/[id]/page.tsx` — `await getEventById(id)`, `await generateStaticParams()` → utiliser `await getEvents()` pour les IDs
- `app/a-propos/page.tsx` — `await getTeam()`

Pour chaque fichier, wraper l'appel avec `await` et rendre la fonction async si ce n'est pas déjà le cas. Exemple dans `app/evenements/[id]/page.tsx` :

```typescript
// Avant
export async function generateStaticParams() {
  return getEvents().map(e => ({ id: e.id }))
}

// Après
export async function generateStaticParams() {
  const events = await getEvents()
  return events.map(e => ({ id: e.id }))
}
```

- [ ] **Step 6 : Vérifier le build**

```bash
pnpm build
```

Expected: BUILD SUCCESS — aucune erreur TypeScript.

- [ ] **Step 7 : Commit**

```bash
git add lib/data.ts lib/types.ts __tests__/lib/data.test.ts app/
git commit -m "feat: migrate data layer from json to turso"
```

---

## Phase 3 — Refactoring des actions auth

### Task 7 : Renommer `app/admin/actions.ts` → `app/admin/actions/auth.ts`

**Files:**
- Create: `app/admin/actions/auth.ts` (contenu identique à `app/admin/actions.ts`)
- Modify: `app/admin/page.tsx` (mettre à jour l'import)
- Delete: `app/admin/actions.ts`

- [ ] **Step 1 : Créer `app/admin/actions/auth.ts`**

Copier le contenu exact de `app/admin/actions.ts` dans `app/admin/actions/auth.ts`. Aucun changement de contenu.

- [ ] **Step 2 : Mettre à jour `app/admin/page.tsx`**

Changer la ligne d'import :
```typescript
// Avant
import { login } from './actions'

// Après
import { login } from './actions/auth'
```

Chercher aussi tout fichier qui importe depuis `@/app/admin/actions` et le mettre à jour :
```bash
grep -r "from.*admin/actions'" --include="*.ts" --include="*.tsx" .
```

- [ ] **Step 3 : Supprimer l'ancien fichier**

```bash
rm app/admin/actions.ts
```

- [ ] **Step 4 : Mettre à jour le test existant**

Dans `__tests__/admin-actions.test.ts`, changer :
```typescript
// Avant
const { login } = await import('@/app/admin/actions')
// ...
const { logout } = await import('@/app/admin/actions')

// Après
const { login } = await import('@/app/admin/actions/auth')
// ...
const { logout } = await import('@/app/admin/actions/auth')
```

- [ ] **Step 5 : Vérifier que les tests passent**

```bash
pnpm test __tests__/admin-actions.test.ts
```

Expected: PASS — tous les tests existants passent.

- [ ] **Step 6 : Commit**

```bash
git add app/admin/actions/ app/admin/page.tsx __tests__/admin-actions.test.ts
git rm app/admin/actions.ts
git commit -m "refactor: move admin auth actions to actions/auth.ts"
```

---

## Phase 4 — Server Actions admin

### Task 8 : Server actions `content.ts`

**Files:**
- Create: `app/admin/actions/content.ts`
- Create: `__tests__/admin/actions/content.test.ts`

- [ ] **Step 1 : Écrire le test**

```typescript
// __tests__/admin/actions/content.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const executeMock = vi.fn()
const redirectMock = vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) })
const cookiesMock = vi.fn()

vi.mock('@/lib/db', () => ({ getDb: () => ({ execute: executeMock }) }))
vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('next/headers', () => ({ cookies: cookiesMock }))

function mockValidSession() {
  const { signCookie } = require('@/lib/session')
  const token = signCookie({ username: 'admin', iat: Math.floor(Date.now() / 1000) })
  cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue({ value: token }) })
}

describe('upsertContent', () => {
  beforeEach(() => {
    vi.resetModules()
    executeMock.mockReset()
    process.env.SESSION_SECRET = 'a'.repeat(32)
    mockValidSession()
  })
  afterEach(() => { vi.unstubAllEnvs() })

  it('inserts a key-value pair', async () => {
    executeMock.mockResolvedValue({ rows: [] })
    const { upsertContent } = await import('@/app/admin/actions/content')
    const fd = new FormData()
    fd.set('hero_title', 'Nouveau titre')
    await upsertContent(fd)
    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({ sql: expect.stringContaining('INSERT OR REPLACE') }),
    )
  })

  it('redirects to /admin when session is invalid', async () => {
    cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue(undefined) })
    const { upsertContent } = await import('@/app/admin/actions/content')
    await expect(upsertContent(new FormData())).rejects.toThrow('NEXT_REDIRECT:/admin')
  })
})
```

- [ ] **Step 2 : Vérifier que le test échoue**

```bash
pnpm test __tests__/admin/actions/content.test.ts
```

Expected: FAIL

- [ ] **Step 3 : Implémenter `app/admin/actions/content.ts`**

```typescript
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyCookie, SESSION_COOKIE_NAME } from '@/lib/session'
import { getDb } from '@/lib/db'

async function requireSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = verifyCookie(token)
  if (!session) redirect('/admin')
}

export async function upsertContent(formData: FormData) {
  await requireSession()
  const db = getDb()
  const keys = ['hero_title', 'hero_subtitle', 'stats_poles', 'stats_membres', 'stats_evenements', 'apropos_mission_title', 'apropos_mission_text']
  for (const key of keys) {
    const value = formData.get(key)
    if (value !== null) {
      await db.execute({
        sql: 'INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)',
        args: [key, String(value)],
      })
    }
  }
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
pnpm test __tests__/admin/actions/content.test.ts
```

Expected: PASS

- [ ] **Step 5 : Commit**

```bash
git add app/admin/actions/content.ts __tests__/admin/actions/content.test.ts
git commit -m "feat: add content server actions"
```

---

### Task 9 : Server actions `events.ts`

**Files:**
- Create: `app/admin/actions/events.ts`
- Create: `__tests__/admin/actions/events.test.ts`

- [ ] **Step 1 : Écrire les tests**

```typescript
// __tests__/admin/actions/events.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const executeMock = vi.fn()
const redirectMock = vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) })
const cookiesMock = vi.fn()

vi.mock('@/lib/db', () => ({ getDb: () => ({ execute: executeMock }) }))
vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('next/headers', () => ({ cookies: cookiesMock }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

function mockValidSession() {
  const { signCookie } = require('@/lib/session')
  const token = signCookie({ username: 'admin', iat: Math.floor(Date.now() / 1000) })
  cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue({ value: token }) })
}

describe('createEvent', () => {
  beforeEach(() => {
    vi.resetModules()
    executeMock.mockReset()
    process.env.SESSION_SECRET = 'a'.repeat(32)
    mockValidSession()
  })
  afterEach(() => { vi.unstubAllEnvs() })

  it('inserts a new event and redirects to its edit page', async () => {
    executeMock.mockResolvedValue({ rows: [{ max_order: 0 }] })
    const { createEvent } = await import('@/app/admin/actions/events')
    const fd = new FormData()
    fd.set('title', 'Nouvel Event')
    fd.set('date', '2025-06-01')
    fd.set('partner', 'Goldman Sachs')
    fd.set('status', 'upcoming')
    fd.set('description', 'Description')
    await expect(createEvent(fd)).rejects.toThrow('NEXT_REDIRECT:/admin/dashboard/evenements/')
    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({ sql: expect.stringContaining('INSERT INTO events') }))
  })
})

describe('deleteEvent', () => {
  beforeEach(() => {
    vi.resetModules()
    executeMock.mockReset()
    process.env.SESSION_SECRET = 'a'.repeat(32)
    mockValidSession()
  })
  afterEach(() => { vi.unstubAllEnvs() })

  it('deletes the event and redirects to events list', async () => {
    executeMock.mockResolvedValue({ rows: [] })
    const { deleteEvent } = await import('@/app/admin/actions/events')
    await expect(deleteEvent('event-id-123')).rejects.toThrow('NEXT_REDIRECT:/admin/dashboard?tab=evenements')
    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({ sql: expect.stringContaining('DELETE FROM events') }))
  })
})

describe('reorderEvents', () => {
  beforeEach(() => {
    vi.resetModules()
    executeMock.mockReset()
    process.env.SESSION_SECRET = 'a'.repeat(32)
    mockValidSession()
  })
  afterEach(() => { vi.unstubAllEnvs() })

  it('updates order_index for each event id', async () => {
    executeMock.mockResolvedValue({ rows: [] })
    const { reorderEvents } = await import('@/app/admin/actions/events')
    await reorderEvents(['id-b', 'id-a'])
    expect(executeMock).toHaveBeenCalledTimes(2)
    expect(executeMock).toHaveBeenNthCalledWith(1, expect.objectContaining({ args: expect.arrayContaining([0, 'id-b']) }))
    expect(executeMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ args: expect.arrayContaining([1, 'id-a']) }))
  })
})
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
pnpm test __tests__/admin/actions/events.test.ts
```

Expected: FAIL

- [ ] **Step 3 : Implémenter `app/admin/actions/events.ts`**

```typescript
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { verifyCookie, SESSION_COOKIE_NAME } from '@/lib/session'
import { getDb } from '@/lib/db'

async function requireSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = verifyCookie(token)
  if (!session) redirect('/admin')
}

export async function createEvent(formData: FormData) {
  await requireSession()
  const db = getDb()
  const { rows } = await db.execute('SELECT MAX(order_index) as max_order FROM events')
  const maxOrder = (rows[0]?.max_order as number | null) ?? -1
  const id = randomUUID()
  await db.execute({
    sql: 'INSERT INTO events (id, title, date, partner, partner_description, pole, description, image_url, status, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      id,
      String(formData.get('title') ?? ''),
      String(formData.get('date') ?? ''),
      String(formData.get('partner') ?? ''),
      formData.get('partner_description') ? String(formData.get('partner_description')) : null,
      formData.get('pole') ? String(formData.get('pole')) : null,
      String(formData.get('description') ?? ''),
      null,
      String(formData.get('status') ?? 'upcoming'),
      maxOrder + 1,
    ],
  })
  revalidatePath('/evenements')
  redirect(`/admin/dashboard/evenements/${id}`)
}

export async function updateEvent(id: string, formData: FormData) {
  await requireSession()
  const db = getDb()
  await db.execute({
    sql: 'UPDATE events SET title=?, date=?, partner=?, partner_description=?, pole=?, description=?, status=? WHERE id=?',
    args: [
      String(formData.get('title') ?? ''),
      String(formData.get('date') ?? ''),
      String(formData.get('partner') ?? ''),
      formData.get('partner_description') ? String(formData.get('partner_description')) : null,
      formData.get('pole') ? String(formData.get('pole')) : null,
      String(formData.get('description') ?? ''),
      String(formData.get('status') ?? 'upcoming'),
      id,
    ],
  })
  revalidatePath('/evenements')
  revalidatePath(`/evenements/${id}`)
}

export async function updateEventImage(id: string, imageUrl: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'UPDATE events SET image_url=? WHERE id=?', args: [imageUrl, id] })
  revalidatePath(`/evenements/${id}`)
}

export async function deleteEvent(id: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM events WHERE id=?', args: [id] })
  revalidatePath('/evenements')
  redirect('/admin/dashboard?tab=evenements')
}

export async function reorderEvents(ids: string[]) {
  await requireSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE events SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
}

// Highlights
export async function createHighlight(eventId: string, formData: FormData) {
  await requireSession()
  const db = getDb()
  const { rows } = await db.execute({ sql: 'SELECT MAX(order_index) as m FROM event_highlights WHERE event_id=?', args: [eventId] })
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO event_highlights (id, event_id, title, description, order_index) VALUES (?, ?, ?, ?, ?)',
    args: [randomUUID(), eventId, String(formData.get('title') ?? ''), String(formData.get('description') ?? ''), maxOrder + 1],
  })
}

export async function updateHighlight(id: string, formData: FormData) {
  await requireSession()
  const db = getDb()
  await db.execute({
    sql: 'UPDATE event_highlights SET title=?, description=? WHERE id=?',
    args: [String(formData.get('title') ?? ''), String(formData.get('description') ?? ''), id],
  })
}

export async function deleteHighlight(id: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM event_highlights WHERE id=?', args: [id] })
}

export async function reorderHighlights(ids: string[]) {
  await requireSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE event_highlights SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
}

// Photos
export async function addPhoto(eventId: string, url: string, caption: string) {
  await requireSession()
  const db = getDb()
  const { rows } = await db.execute({ sql: 'SELECT MAX(order_index) as m FROM event_photos WHERE event_id=?', args: [eventId] })
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO event_photos (id, event_id, url, caption, order_index) VALUES (?, ?, ?, ?, ?)',
    args: [randomUUID(), eventId, url, caption || null, maxOrder + 1],
  })
}

export async function updatePhotoCaption(id: string, caption: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'UPDATE event_photos SET caption=? WHERE id=?', args: [caption, id] })
}

export async function deletePhoto(id: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM event_photos WHERE id=?', args: [id] })
}

export async function reorderPhotos(ids: string[]) {
  await requireSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE event_photos SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
pnpm test __tests__/admin/actions/events.test.ts
```

Expected: PASS

- [ ] **Step 5 : Commit**

```bash
git add app/admin/actions/events.ts __tests__/admin/actions/events.test.ts
git commit -m "feat: add events server actions"
```

---

### Task 10 : Server actions `team.ts`

**Files:**
- Create: `app/admin/actions/team.ts`
- Create: `__tests__/admin/actions/team.test.ts`

- [ ] **Step 1 : Écrire les tests**

```typescript
// __tests__/admin/actions/team.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const executeMock = vi.fn()
const redirectMock = vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) })
const cookiesMock = vi.fn()

vi.mock('@/lib/db', () => ({ getDb: () => ({ execute: executeMock }) }))
vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('next/headers', () => ({ cookies: cookiesMock }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

function mockValidSession() {
  const { signCookie } = require('@/lib/session')
  const token = signCookie({ username: 'admin', iat: Math.floor(Date.now() / 1000) })
  cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue({ value: token }) })
}

describe('createMember', () => {
  beforeEach(() => { vi.resetModules(); executeMock.mockReset(); process.env.SESSION_SECRET = 'a'.repeat(32); mockValidSession() })
  afterEach(() => { vi.unstubAllEnvs() })

  it('inserts a member into the db', async () => {
    executeMock.mockResolvedValue({ rows: [{ max_order: 0 }] })
    const { createMember } = await import('@/app/admin/actions/team')
    const fd = new FormData()
    fd.set('name', 'Alice Martin'); fd.set('role', 'Analyste'); fd.set('pole_id', 'pole-123')
    await createMember(fd)
    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({ sql: expect.stringContaining('INSERT INTO team_members') }))
  })
})

describe('reorderMembers', () => {
  beforeEach(() => { vi.resetModules(); executeMock.mockReset(); process.env.SESSION_SECRET = 'a'.repeat(32); mockValidSession() })
  afterEach(() => { vi.unstubAllEnvs() })

  it('updates order_index for each member id', async () => {
    executeMock.mockResolvedValue({ rows: [] })
    const { reorderMembers } = await import('@/app/admin/actions/team')
    await reorderMembers(['m2', 'm1'])
    expect(executeMock).toHaveBeenNthCalledWith(1, expect.objectContaining({ args: expect.arrayContaining([0, 'm2']) }))
    expect(executeMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ args: expect.arrayContaining([1, 'm1']) }))
  })
})
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
pnpm test __tests__/admin/actions/team.test.ts
```

Expected: FAIL

- [ ] **Step 3 : Implémenter `app/admin/actions/team.ts`**

```typescript
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { verifyCookie, SESSION_COOKIE_NAME } from '@/lib/session'
import { getDb } from '@/lib/db'

async function requireSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = verifyCookie(token)
  if (!session) redirect('/admin')
}

// Pôles
export async function createPole(formData: FormData) {
  await requireSession()
  const db = getDb()
  const { rows } = await db.execute('SELECT MAX(order_index) as m FROM poles')
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO poles (id, name, badge, description, order_index) VALUES (?, ?, ?, ?, ?)',
    args: [randomUUID(), String(formData.get('name') ?? ''), String(formData.get('badge') ?? ''), String(formData.get('description') ?? ''), maxOrder + 1],
  })
  revalidatePath('/equipe')
}

export async function updatePole(id: string, formData: FormData) {
  await requireSession()
  const db = getDb()
  await db.execute({
    sql: 'UPDATE poles SET name=?, badge=?, description=? WHERE id=?',
    args: [String(formData.get('name') ?? ''), String(formData.get('badge') ?? ''), String(formData.get('description') ?? ''), id],
  })
  revalidatePath('/equipe')
}

export async function deletePole(id: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM poles WHERE id=?', args: [id] })
  revalidatePath('/equipe')
}

export async function reorderPoles(ids: string[]) {
  await requireSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE poles SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
}

// Membres
export async function createMember(formData: FormData) {
  await requireSession()
  const db = getDb()
  const poleId = String(formData.get('pole_id') ?? '')
  const { rows } = await db.execute({ sql: 'SELECT MAX(order_index) as m FROM team_members WHERE pole_id=?', args: [poleId] })
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO team_members (id, name, role, photo_url, linkedin, pole_id, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [randomUUID(), String(formData.get('name') ?? ''), String(formData.get('role') ?? ''), null, formData.get('linkedin') ? String(formData.get('linkedin')) : null, poleId, maxOrder + 1],
  })
  revalidatePath('/equipe')
}

export async function updateMember(id: string, formData: FormData) {
  await requireSession()
  const db = getDb()
  await db.execute({
    sql: 'UPDATE team_members SET name=?, role=?, linkedin=?, pole_id=? WHERE id=?',
    args: [String(formData.get('name') ?? ''), String(formData.get('role') ?? ''), formData.get('linkedin') ? String(formData.get('linkedin')) : null, String(formData.get('pole_id') ?? ''), id],
  })
  revalidatePath('/equipe')
}

export async function updateMemberPhoto(id: string, photoUrl: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'UPDATE team_members SET photo_url=? WHERE id=?', args: [photoUrl, id] })
  revalidatePath('/equipe')
}

export async function deleteMember(id: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM team_members WHERE id=?', args: [id] })
  revalidatePath('/equipe')
}

export async function reorderMembers(ids: string[]) {
  await requireSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE team_members SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
pnpm test __tests__/admin/actions/team.test.ts
```

Expected: PASS

- [ ] **Step 5 : Commit**

```bash
git add app/admin/actions/team.ts __tests__/admin/actions/team.test.ts
git commit -m "feat: add team server actions"
```

---

### Task 11 : Server actions `partners.ts`

**Files:**
- Create: `app/admin/actions/partners.ts`
- Create: `__tests__/admin/actions/partners.test.ts`

- [ ] **Step 1 : Écrire les tests**

```typescript
// __tests__/admin/actions/partners.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const executeMock = vi.fn()
const redirectMock = vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) })
const cookiesMock = vi.fn()

vi.mock('@/lib/db', () => ({ getDb: () => ({ execute: executeMock }) }))
vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('next/headers', () => ({ cookies: cookiesMock }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

function mockValidSession() {
  const { signCookie } = require('@/lib/session')
  const token = signCookie({ username: 'admin', iat: Math.floor(Date.now() / 1000) })
  cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue({ value: token }) })
}

describe('createPartner', () => {
  beforeEach(() => { vi.resetModules(); executeMock.mockReset(); process.env.SESSION_SECRET = 'a'.repeat(32); mockValidSession() })
  afterEach(() => { vi.unstubAllEnvs() })

  it('inserts a partner', async () => {
    executeMock.mockResolvedValue({ rows: [{ m: 2 }] })
    const { createPartner } = await import('@/app/admin/actions/partners')
    const fd = new FormData(); fd.set('name', 'HSBC'); fd.set('logo_url', '/hsbc.png')
    await createPartner(fd)
    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({ sql: expect.stringContaining('INSERT INTO partners') }))
  })
})

describe('reorderPartners', () => {
  beforeEach(() => { vi.resetModules(); executeMock.mockReset(); process.env.SESSION_SECRET = 'a'.repeat(32); mockValidSession() })
  afterEach(() => { vi.unstubAllEnvs() })

  it('updates order_index', async () => {
    executeMock.mockResolvedValue({ rows: [] })
    const { reorderPartners } = await import('@/app/admin/actions/partners')
    await reorderPartners(['p2', 'p1'])
    expect(executeMock).toHaveBeenNthCalledWith(1, expect.objectContaining({ args: expect.arrayContaining([0, 'p2']) }))
  })
})
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
pnpm test __tests__/admin/actions/partners.test.ts
```

Expected: FAIL

- [ ] **Step 3 : Implémenter `app/admin/actions/partners.ts`**

```typescript
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { verifyCookie, SESSION_COOKIE_NAME } from '@/lib/session'
import { getDb } from '@/lib/db'

async function requireSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = verifyCookie(token)
  if (!session) redirect('/admin')
}

export async function createPartner(formData: FormData) {
  await requireSession()
  const db = getDb()
  const { rows } = await db.execute('SELECT MAX(order_index) as m FROM partners')
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO partners (id, name, logo_url, order_index) VALUES (?, ?, ?, ?)',
    args: [randomUUID(), String(formData.get('name') ?? ''), String(formData.get('logo_url') ?? ''), maxOrder + 1],
  })
  revalidatePath('/')
}

export async function updatePartner(id: string, formData: FormData) {
  await requireSession()
  const db = getDb()
  await db.execute({
    sql: 'UPDATE partners SET name=?, logo_url=? WHERE id=?',
    args: [String(formData.get('name') ?? ''), String(formData.get('logo_url') ?? ''), id],
  })
  revalidatePath('/')
}

export async function deletePartner(id: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM partners WHERE id=?', args: [id] })
  revalidatePath('/')
}

export async function reorderPartners(ids: string[]) {
  await requireSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE partners SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
}

export async function updatePartnerLogo(id: string, logoUrl: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'UPDATE partners SET logo_url=? WHERE id=?', args: [logoUrl, id] })
  revalidatePath('/')
}

export async function createPartnerWithLogoUrl(name: string, logoUrl: string) {
  await requireSession()
  const db = getDb()
  const { rows } = await db.execute('SELECT MAX(order_index) as m FROM partners')
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO partners (id, name, logo_url, order_index) VALUES (?, ?, ?, ?)',
    args: [randomUUID(), name, logoUrl, maxOrder + 1],
  })
  revalidatePath('/')
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
pnpm test __tests__/admin/actions/partners.test.ts
```

Expected: PASS

- [ ] **Step 5 : Commit**

```bash
git add app/admin/actions/partners.ts __tests__/admin/actions/partners.test.ts
git commit -m "feat: add partners server actions"
```

---

## Phase 5 — Composants admin partagés

### Task 12 : Composant `ImageUpload`

**Files:**
- Create: `components/admin/image-upload.tsx`

L'upload se fait en deux étapes : (1) le client appelle une Server Action qui obtient une URL présignée Vercel Blob, (2) le client uploade directement. On utilise `upload()` du SDK client `@vercel/blob/client`.

- [ ] **Step 1 : Créer la Server Action pour le token**

Ajouter dans `app/admin/actions/content.ts` :

```typescript
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export async function handleBlobUpload(body: HandleUploadBody) {
  await requireSession()
  return handleUpload({
    body,
    request: { headers: new Headers() } as Request,
    onBeforeGenerateToken: async () => ({ allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] }),
    onUploadCompleted: async () => {},
  })
}
```

Ajouter aussi la route API nécessaire par le SDK client. Créer `app/api/blob/route.ts` :

```typescript
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifyCookie, SESSION_COOKIE_NAME } from '@/lib/session'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = verifyCookie(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json()) as HandleUploadBody
  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async () => ({ allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] }),
    onUploadCompleted: async () => {},
  })
  return NextResponse.json(jsonResponse)
}
```

- [ ] **Step 2 : Créer le composant client**

```typescript
// components/admin/image-upload.tsx
'use client'

import { upload } from '@vercel/blob/client'
import { useRef, useState } from 'react'

interface ImageUploadProps {
  currentUrl?: string | null
  onUpload: (url: string) => void
  label?: string
}

export function ImageUpload({ currentUrl, onUpload, label = 'Image' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/blob',
      })
      onUpload(blob.url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-white/60">{label}</label>
      {currentUrl && (
        <img src={currentUrl} alt="" className="h-20 w-auto rounded object-cover" />
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded border border-dashed border-white/20 bg-white/5 px-3 py-2 text-xs text-white/50 hover:border-white/40 disabled:opacity-50"
      >
        {uploading ? 'Upload en cours...' : 'Choisir une image'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  )
}
```

- [ ] **Step 3 : Commit**

```bash
git add components/admin/image-upload.tsx app/api/blob/route.ts app/admin/actions/content.ts
git commit -m "feat: add image upload component with vercel blob"
```

---

### Task 13 : Composant `SortableList` (drag & drop)

**Files:**
- Create: `components/admin/sortable-list.tsx`

- [ ] **Step 1 : Créer le composant**

```typescript
// components/admin/sortable-list.tsx
'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'

interface SortableItemProps {
  id: string
  children: (handleProps: { ref: React.Ref<HTMLElement>; style: React.CSSProperties }) => React.ReactNode
}

export function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return <>{children({ ref: setNodeRef as React.Ref<HTMLElement>, style })}</>
}

export function DragHandle({ ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props} className="cursor-grab text-white/20 hover:text-white/50 active:cursor-grabbing" title="Réordonner">
      ⠿
    </span>
  )
}

interface SortableListProps<T extends { id: string }> {
  items: T[]
  onReorder: (ids: string[]) => void
  renderItem: (item: T, dragHandleProps: object) => React.ReactNode
}

export function SortableList<T extends { id: string }>({ items, onReorder, renderItem }: SortableListProps<T>) {
  const [localItems, setLocalItems] = useState(items)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = localItems.findIndex(i => i.id === active.id)
    const newIndex = localItems.findIndex(i => i.id === over.id)
    const newItems = arrayMove(localItems, oldIndex, newIndex)
    setLocalItems(newItems)
    onReorder(newItems.map(i => i.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={localItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
        {localItems.map(item => (
          <SortableItem key={item.id} id={item.id}>
            {({ ref, style }) => (
              <div ref={ref as React.Ref<HTMLDivElement>} style={style}>
                {renderItem(item, {})}
              </div>
            )}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add components/admin/sortable-list.tsx
git commit -m "feat: add generic sortable list with dnd-kit"
```

---

## Phase 6 — Dashboard admin

### Task 14 : Shell du dashboard avec onglets

**Files:**
- Modify: `app/admin/dashboard/page.tsx`

- [ ] **Step 1 : Réécrire la page dashboard**

```typescript
// app/admin/dashboard/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyCookie, SESSION_COOKIE_NAME } from '@/lib/session'
import { logout } from '@/app/admin/actions/auth'
import { AccueilTab } from '@/components/admin/tabs/accueil-tab'
import { EvenementsTab } from '@/components/admin/tabs/evenements-tab'
import { EquipeTab } from '@/components/admin/tabs/equipe-tab'
import { PartenairesTab } from '@/components/admin/tabs/partenaires-tab'
import { AProposTab } from '@/components/admin/tabs/apropos-tab'
import { getSiteContent, getAdminEvents, getAdminTeam, getAdminPartners } from '@/lib/data'
import Link from 'next/link'

const TABS = ['accueil', 'evenements', 'equipe', 'partenaires', 'apropos'] as const
type Tab = typeof TABS[number]

const TAB_LABELS: Record<Tab, string> = {
  accueil: 'Accueil',
  evenements: 'Événements',
  equipe: 'Équipe',
  partenaires: 'Partenaires',
  apropos: 'À propos',
}

interface Props {
  searchParams: Promise<{ tab?: string }>
}

export default async function AdminDashboardPage({ searchParams }: Props) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = verifyCookie(token)
  if (!session) redirect('/admin')

  const { tab: rawTab } = await searchParams
  const activeTab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : 'accueil'

  const [content, events, team, partners] = await Promise.all([
    getSiteContent(),
    getAdminEvents(),
    getAdminTeam(),
    getAdminPartners(),
  ])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 bg-[#111] px-6 py-3">
        <span className="font-bold">Console Admin</span>
        <form action={logout}>
          <button type="submit" className="rounded border border-white/20 px-3 py-1 text-sm text-white/60 hover:border-white/40 hover:text-white">
            Déconnexion
          </button>
        </form>
      </header>

      {/* Tab navigation */}
      <nav className="flex border-b border-white/10 bg-[#111] px-6">
        {TABS.map(tab => (
          <Link
            key={tab}
            href={`/admin/dashboard?tab=${tab}`}
            className={`px-4 py-2.5 text-sm transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 font-semibold text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {TAB_LABELS[tab]}
          </Link>
        ))}
      </nav>

      {/* Tab content */}
      <main className="p-6">
        {activeTab === 'accueil' && <AccueilTab content={content} />}
        {activeTab === 'evenements' && <EvenementsTab events={events} />}
        {activeTab === 'equipe' && <EquipeTab team={team} />}
        {activeTab === 'partenaires' && <PartenairesTab partners={partners} />}
        {activeTab === 'apropos' && <AProposTab content={content} team={team} />}
      </main>
    </div>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add app/admin/dashboard/page.tsx
git commit -m "feat: add admin dashboard shell with tab navigation"
```

---

### Task 15 : Tab Accueil

**Files:**
- Create: `components/admin/tabs/accueil-tab.tsx`

- [ ] **Step 1 : Créer le composant**

```typescript
// components/admin/tabs/accueil-tab.tsx
'use client'

import { useRef } from 'react'
import { upsertContent } from '@/app/admin/actions/content'
import type { SiteContent } from '@/lib/types'

export function AccueilTab({ content }: { content: SiteContent }) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={upsertContent} className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Page d'accueil</h2>
        <button type="submit" className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">
          Enregistrer
        </button>
      </div>

      {/* Hero */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-4">
        <h3 className="text-xs uppercase tracking-widest text-white/40">Section Hero</h3>
        <Field name="hero_title" label="Titre principal" defaultValue={content.hero_title} />
        <TextareaField name="hero_subtitle" label="Sous-titre" defaultValue={content.hero_subtitle} />
      </section>

      {/* Stats */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-4">
        <h3 className="text-xs uppercase tracking-widest text-white/40">Statistiques</h3>
        <div className="grid grid-cols-3 gap-4">
          <Field name="stats_poles" label="Pôles" defaultValue={content.stats_poles} />
          <Field name="stats_membres" label="Membres" defaultValue={content.stats_membres} />
          <Field name="stats_evenements" label="Événements / an" defaultValue={content.stats_evenements} />
        </div>
      </section>
    </form>
  )
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-white/50">{label}</label>
      <input id={name} name={name} defaultValue={defaultValue} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
    </div>
  )
}

function TextareaField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-white/50">{label}</label>
      <textarea id={name} name={name} defaultValue={defaultValue} rows={3} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
    </div>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add components/admin/tabs/accueil-tab.tsx
git commit -m "feat: add accueil tab"
```

---

### Task 16 : Tab Événements (liste)

**Files:**
- Create: `components/admin/tabs/evenements-tab.tsx`

- [ ] **Step 1 : Créer le composant**

```typescript
// components/admin/tabs/evenements-tab.tsx
'use client'

import Link from 'next/link'
import { deleteEvent, reorderEvents } from '@/app/admin/actions/events'
import { SortableList } from '@/components/admin/sortable-list'
import type { AdminEvent } from '@/lib/types'

export function EvenementsTab({ events }: { events: AdminEvent[] }) {
  const upcoming = events.filter(e => e.status === 'upcoming')
  const past = events.filter(e => e.status === 'past')

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{events.length} événement{events.length > 1 ? 's' : ''}</span>
        <Link href="/admin/dashboard/evenements/new" className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">
          + Nouvel événement
        </Link>
      </div>

      {upcoming.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-widest text-white/40">À venir</p>
          <SortableList
            items={upcoming}
            onReorder={reorderEvents}
            renderItem={(event, dragHandleProps) => (
              <EventRow key={event.id} event={event} dragHandleProps={dragHandleProps} />
            )}
          />
        </div>
      )}

      {past.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-widest text-white/40">Passés</p>
          <SortableList
            items={past}
            onReorder={reorderEvents}
            renderItem={(event, dragHandleProps) => (
              <EventRow key={event.id} event={event} dragHandleProps={dragHandleProps} />
            )}
          />
        </div>
      )}
    </div>
  )
}

function EventRow({ event, dragHandleProps }: { event: AdminEvent; dragHandleProps: object }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
      <span {...dragHandleProps} className="cursor-grab text-white/20 hover:text-white/50">⠿</span>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{event.title}</p>
        <p className="text-xs text-white/40">{event.partner} · {new Date(event.date).toLocaleDateString('fr-FR')}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/40'}`}>
        {event.status === 'upcoming' ? 'À venir' : 'Passé'}
      </span>
      <Link href={`/admin/dashboard/evenements/${event.id}`} className="shrink-0 rounded border border-white/20 px-3 py-1 text-xs hover:border-white/40">
        → Éditer
      </Link>
      <form action={deleteEvent.bind(null, event.id)}>
        <button type="submit" className="shrink-0 text-xs text-red-400 hover:text-red-300" onClick={e => { if (!confirm('Supprimer cet événement ?')) e.preventDefault() }}>
          Supprimer
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add components/admin/tabs/evenements-tab.tsx
git commit -m "feat: add evenements tab with sortable list"
```

---

### Task 17 : Page d'édition d'un événement

**Files:**
- Create: `app/admin/dashboard/evenements/[id]/page.tsx`
- Create: `app/admin/dashboard/evenements/new/page.tsx`

- [ ] **Step 1 : Créer la page "Nouvel événement"**

```typescript
// app/admin/dashboard/evenements/new/page.tsx
import { createEvent } from '@/app/admin/actions/events'
import Link from 'next/link'

export default function NewEventPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 max-w-2xl">
      <Link href="/admin/dashboard?tab=evenements" className="mb-6 inline-block text-sm text-white/40 hover:text-white">
        ← Retour aux événements
      </Link>
      <h1 className="mb-6 text-lg font-semibold">Nouvel événement</h1>
      <form action={createEvent} className="flex flex-col gap-4">
        <Field name="title" label="Titre" required />
        <Field name="date" label="Date" type="date" required />
        <Field name="partner" label="Partenaire" required />
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-xs text-white/50">Statut</label>
          <select id="status" name="status" className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
            <option value="upcoming">À venir</option>
            <option value="past">Passé</option>
          </select>
        </div>
        <TextareaField name="description" label="Description" required />
        <button type="submit" className="self-start rounded bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700">
          Créer l'événement
        </button>
      </form>
    </div>
  )
}

function Field({ name, label, type = 'text', required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-white/50">{label}</label>
      <input id={name} name={name} type={type} required={required} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
    </div>
  )
}

function TextareaField({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-white/50">{label}</label>
      <textarea id={name} name={name} required={required} rows={4} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
    </div>
  )
}
```

- [ ] **Step 2 : Créer la page d'édition complète**

```typescript
// app/admin/dashboard/evenements/[id]/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyCookie, SESSION_COOKIE_NAME } from '@/lib/session'
import { getAdminEventById } from '@/lib/data'
import { updateEvent, updateEventImage, createHighlight, updateHighlight, deleteHighlight, reorderHighlights, addPhoto, deletePhoto, reorderPhotos, updatePhotoCaption } from '@/app/admin/actions/events'
import { ImageUpload } from '@/components/admin/image-upload'
import { SortableList } from '@/components/admin/sortable-list'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { AdminEvent } from '@/lib/types'

interface Props { params: Promise<{ id: string }> }

export default async function EventEditPage({ params }: Props) {
  const cookieStore = await cookies()
  const session = verifyCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value)
  if (!session) redirect('/admin')

  const { id } = await params
  const event = await getAdminEventById(id)
  if (!event) notFound()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="flex items-center justify-between border-b border-white/10 bg-[#111] px-6 py-3">
        <span className="font-bold">Console Admin</span>
      </header>
      <div className="p-6 max-w-2xl flex flex-col gap-6">
        <Link href="/admin/dashboard?tab=evenements" className="text-sm text-white/40 hover:text-white">
          ← Retour aux événements
        </Link>
        <h1 className="text-lg font-semibold">{event.title}</h1>

        {/* Informations générales */}
        <GeneralInfoSection event={event} />

        {/* Partenaire */}
        <PartnerSection event={event} />

        {/* Highlights */}
        <HighlightsSection event={event} />

        {/* Photos */}
        <PhotosSection event={event} />
      </div>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-4">
      <h2 className="text-xs uppercase tracking-widest text-white/40">{title}</h2>
      {children}
    </section>
  )
}

function GeneralInfoSection({ event }: { event: AdminEvent }) {
  const updateEventWithId = updateEvent.bind(null, event.id)
  const updateImageWithId = updateEventImage.bind(null, event.id)
  return (
    <SectionCard title="Informations générales">
      <form action={updateEventWithId} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field name="title" label="Titre" defaultValue={event.title} />
          <Field name="date" label="Date" type="date" defaultValue={event.date} />
          <Field name="partner" label="Partenaire" defaultValue={event.partner} />
          <div className="flex flex-col gap-1">
            <label htmlFor="status" className="text-xs text-white/50">Statut</label>
            <select id="status" name="status" defaultValue={event.status} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
              <option value="upcoming">À venir</option>
              <option value="past">Passé</option>
            </select>
          </div>
        </div>
        <TextareaField name="description" label="Description courte" defaultValue={event.description} />
        <button type="submit" className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">
          Enregistrer
        </button>
      </form>
      <ImageUpload
        currentUrl={event.image_url}
        label="Image principale"
        onUpload={async (url) => {
          'use server'
          await updateImageWithId(url)
        }}
      />
    </SectionCard>
  )
}

function PartnerSection({ event }: { event: AdminEvent }) {
  const updateEventWithId = updateEvent.bind(null, event.id)
  return (
    <SectionCard title="Section partenaire (page détail)">
      <form action={updateEventWithId} className="flex flex-col gap-4">
        <input type="hidden" name="title" value={event.title} />
        <input type="hidden" name="date" value={event.date} />
        <input type="hidden" name="partner" value={event.partner} />
        <input type="hidden" name="status" value={event.status} />
        <input type="hidden" name="description" value={event.description} />
        <TextareaField name="partner_description" label="Description du partenaire" defaultValue={event.partner_description ?? ''} />
        <button type="submit" className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">
          Enregistrer
        </button>
      </form>
    </SectionCard>
  )
}

function HighlightsSection({ event }: { event: AdminEvent }) {
  const createHighlightWithEventId = createHighlight.bind(null, event.id)
  return (
    <SectionCard title="Points clés (Highlights)">
      <SortableList
        items={event.highlights}
        onReorder={reorderHighlights}
        renderItem={(highlight, dragHandleProps) => (
          <div className="flex items-start gap-2 rounded border border-white/10 bg-white/5 p-3">
            <span {...dragHandleProps} className="mt-1 cursor-grab text-white/20 hover:text-white/50">⠿</span>
            <form action={updateHighlight.bind(null, highlight.id)} className="flex flex-1 flex-col gap-2">
              <input name="title" defaultValue={highlight.title} className="rounded border border-white/10 bg-transparent px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none" />
              <textarea name="description" defaultValue={highlight.description} rows={2} className="rounded border border-white/10 bg-transparent px-2 py-1 text-xs text-white/70 resize-none focus:border-blue-500 focus:outline-none" />
              <button type="submit" className="self-start text-xs text-blue-400 hover:text-blue-300">Enregistrer</button>
            </form>
            <form action={deleteHighlight.bind(null, highlight.id)}>
              <button type="submit" className="text-red-400 hover:text-red-300 text-xs">✕</button>
            </form>
          </div>
        )}
      />
      <form action={createHighlightWithEventId} className="flex flex-col gap-2 border-t border-white/10 pt-4">
        <p className="text-xs text-white/40">Ajouter un point clé</p>
        <input name="title" placeholder="Titre" className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
        <textarea name="description" placeholder="Description" rows={2} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white resize-none focus:border-blue-500 focus:outline-none" />
        <button type="submit" className="self-start rounded border border-white/20 px-3 py-1 text-xs hover:border-white/40">+ Ajouter</button>
      </form>
    </SectionCard>
  )
}

function PhotosSection({ event }: { event: AdminEvent }) {
  return (
    <SectionCard title="Galerie photos">
      <SortableList
        items={event.photos}
        onReorder={reorderPhotos}
        renderItem={(photo, dragHandleProps) => (
          <div className="flex items-center gap-3 rounded border border-white/10 bg-white/5 p-2">
            <span {...dragHandleProps} className="cursor-grab text-white/20 hover:text-white/50">⠿</span>
            <img src={photo.url} alt="" className="h-14 w-20 rounded object-cover" />
            <form action={updatePhotoCaption.bind(null, photo.id)} className="flex flex-1 items-center gap-2">
              <input name="caption" defaultValue={photo.caption ?? ''} placeholder="Légende..." className="flex-1 rounded border border-white/10 bg-transparent px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none" />
              <button type="submit" className="text-xs text-blue-400 hover:text-blue-300">OK</button>
            </form>
            <form action={deletePhoto.bind(null, photo.id)}>
              <button type="submit" className="text-red-400 hover:text-red-300 text-xs">✕</button>
            </form>
          </div>
        )}
      />
      <ImageUpload
        label="Ajouter une photo"
        onUpload={async (url) => {
          'use server'
          await addPhoto(event.id, url, '')
        }}
      />
    </SectionCard>
  )
}

function Field({ name, label, type = 'text', defaultValue }: { name: string; label: string; type?: string; defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-white/50">{label}</label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
    </div>
  )
}

function TextareaField({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-white/50">{label}</label>
      <textarea id={name} name={name} defaultValue={defaultValue} rows={4} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white resize-none focus:border-blue-500 focus:outline-none" />
    </div>
  )
}
```

- [ ] **Step 3 : Commit**

```bash
git add app/admin/dashboard/evenements/
git commit -m "feat: add event edit page with highlights and photos"
```

---

### Task 18 : Tab Équipe

**Files:**
- Create: `components/admin/tabs/equipe-tab.tsx`

- [ ] **Step 1 : Créer le composant**

```typescript
// components/admin/tabs/equipe-tab.tsx
'use client'

import { useState } from 'react'
import { createPole, updatePole, deletePole, reorderPoles, createMember, updateMember, deleteMember, reorderMembers, updateMemberPhoto } from '@/app/admin/actions/team'
import { SortableList } from '@/components/admin/sortable-list'
import { ImageUpload } from '@/components/admin/image-upload'
import type { AdminPole, AdminMember } from '@/lib/types'

export function EquipeTab({ team }: { team: AdminPole[] }) {
  const [editingPole, setEditingPole] = useState<string | null>(null)
  const [editingMember, setEditingMember] = useState<AdminMember | null>(null)
  const [addingMemberToPole, setAddingMemberToPole] = useState<string | null>(null)

  return (
    <div className="flex gap-6 max-w-5xl">
      {/* Liste des pôles */}
      <div className="flex-1 flex flex-col gap-4">
        <SortableList
          items={team}
          onReorder={reorderPoles}
          renderItem={(pole, dragHandleProps) => (
            <PoleCard
              pole={pole}
              dragHandleProps={dragHandleProps}
              onEditPole={() => setEditingPole(pole.id)}
              onEditMember={setEditingMember}
              onAddMember={() => setAddingMemberToPole(pole.id)}
            />
          )}
        />
        <form action={createPole} className="rounded-lg border border-dashed border-white/20 p-4 flex flex-col gap-2">
          <p className="text-xs text-white/40">Nouveau pôle</p>
          <input name="name" placeholder="Nom du pôle" required className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          <input name="badge" placeholder="Badge (ex: BUR)" required className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          <textarea name="description" placeholder="Description" rows={2} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white resize-none focus:border-blue-500 focus:outline-none" />
          <button type="submit" className="self-start rounded border border-white/20 px-3 py-1 text-xs hover:border-white/40">+ Créer le pôle</button>
        </form>
      </div>

      {/* Panneau latéral */}
      {(editingMember || addingMemberToPole || editingPole) && (
        <aside className="w-64 rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-4 h-fit">
          {editingMember && (
            <MemberForm
              member={editingMember}
              poles={team}
              onClose={() => setEditingMember(null)}
            />
          )}
          {addingMemberToPole && !editingMember && (
            <NewMemberForm
              poleId={addingMemberToPole}
              poles={team}
              onClose={() => setAddingMemberToPole(null)}
            />
          )}
          {editingPole && !editingMember && !addingMemberToPole && (
            <PoleForm
              pole={team.find(p => p.id === editingPole)!}
              onClose={() => setEditingPole(null)}
            />
          )}
        </aside>
      )}
    </div>
  )
}

function PoleCard({ pole, dragHandleProps, onEditPole, onEditMember, onAddMember }: {
  pole: AdminPole
  dragHandleProps: object
  onEditPole: () => void
  onEditMember: (m: AdminMember) => void
  onAddMember: () => void
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <span {...dragHandleProps} className="cursor-grab text-white/20 hover:text-white/50">⠿</span>
        <span className="flex-1 text-sm font-semibold">{pole.name}</span>
        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">{pole.members.length} membres</span>
        <button onClick={onEditPole} className="text-xs text-white/40 hover:text-white">Éditer pôle</button>
        <button onClick={onAddMember} className="rounded bg-blue-600 px-3 py-1 text-xs hover:bg-blue-700">+ Membre</button>
      </div>
      <div className="p-2 flex flex-col gap-1">
        <SortableList
          items={pole.members}
          onReorder={reorderMembers}
          renderItem={(member, dragHandleProps) => (
            <MemberRow member={member} dragHandleProps={dragHandleProps} onEdit={() => onEditMember(member)} />
          )}
        />
      </div>
    </div>
  )
}

function MemberRow({ member, dragHandleProps, onEdit }: { member: AdminMember; dragHandleProps: object; onEdit: () => void }) {
  const initials = member.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="flex items-center gap-3 rounded px-3 py-2 hover:bg-white/5">
      <span {...dragHandleProps} className="cursor-grab text-white/20 hover:text-white/50 text-xs">⠿</span>
      <div className="h-7 w-7 shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-semibold text-blue-400">
        {member.photo_url ? <img src={member.photo_url} alt="" className="h-7 w-7 rounded-full object-cover" /> : initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm">{member.name}</p>
        <p className="text-xs text-white/40">{member.role}</p>
      </div>
      <button onClick={onEdit} className="text-xs text-white/40 hover:text-white">Éditer</button>
      <form action={deleteMember.bind(null, member.id)}>
        <button type="submit" className="text-red-400 hover:text-red-300 text-xs" onClick={e => { if (!confirm('Supprimer ?')) e.preventDefault() }}>✕</button>
      </form>
    </div>
  )
}

function MemberForm({ member, poles, onClose }: { member: AdminMember; poles: AdminPole[]; onClose: () => void }) {
  const updateMemberWithId = updateMember.bind(null, member.id)
  const initials = member.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Éditer le membre</p>
        <button onClick={onClose} className="text-xs text-white/40 hover:text-white">✕</button>
      </div>
      <ImageUpload
        currentUrl={member.photo_url}
        label="Photo"
        onUpload={(url) => updateMemberPhoto(member.id, url)}
      />
      <form action={updateMemberWithId} className="flex flex-col gap-3">
        <Field name="name" label="Nom complet" defaultValue={member.name} />
        <Field name="role" label="Rôle" defaultValue={member.role} />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50">Pôle</label>
          <select name="pole_id" defaultValue={member.pole_id} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
            {poles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <Field name="linkedin" label="LinkedIn (optionnel)" defaultValue={member.linkedin ?? ''} />
        <button type="submit" className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">Enregistrer</button>
      </form>
    </>
  )
}

function NewMemberForm({ poleId, poles, onClose }: { poleId: string; poles: AdminPole[]; onClose: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Nouveau membre</p>
        <button onClick={onClose} className="text-xs text-white/40 hover:text-white">✕</button>
      </div>
      <form action={createMember} className="flex flex-col gap-3">
        <input type="hidden" name="pole_id" value={poleId} />
        <Field name="name" label="Nom complet" />
        <Field name="role" label="Rôle" />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50">Pôle</label>
          <select name="pole_id" defaultValue={poleId} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
            {poles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <Field name="linkedin" label="LinkedIn (optionnel)" />
        <button type="submit" className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">Créer</button>
      </form>
    </>
  )
}

function PoleForm({ pole, onClose }: { pole: AdminPole; onClose: () => void }) {
  const updatePoleWithId = updatePole.bind(null, pole.id)
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Éditer le pôle</p>
        <button onClick={onClose} className="text-xs text-white/40 hover:text-white">✕</button>
      </div>
      <form action={updatePoleWithId} className="flex flex-col gap-3">
        <Field name="name" label="Nom" defaultValue={pole.name} />
        <Field name="badge" label="Badge" defaultValue={pole.badge} />
        <TextareaField name="description" label="Description" defaultValue={pole.description} />
        <button type="submit" className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">Enregistrer</button>
      </form>
      <form action={deletePole.bind(null, pole.id)}>
        <button type="submit" className="text-xs text-red-400 hover:text-red-300" onClick={e => { if (!confirm('Supprimer ce pôle et tous ses membres ?')) e.preventDefault() }}>
          Supprimer le pôle
        </button>
      </form>
    </>
  )
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-white/50">{label}</label>
      <input name={name} defaultValue={defaultValue} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
    </div>
  )
}

function TextareaField({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-white/50">{label}</label>
      <textarea name={name} defaultValue={defaultValue} rows={3} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white resize-none focus:border-blue-500 focus:outline-none" />
    </div>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add components/admin/tabs/equipe-tab.tsx
git commit -m "feat: add equipe tab with sortable poles and members"
```

---

### Task 19 : Tab Partenaires

**Files:**
- Create: `components/admin/tabs/partenaires-tab.tsx`

- [ ] **Step 1 : Créer le composant**

```typescript
// components/admin/tabs/partenaires-tab.tsx
'use client'

import { useState } from 'react'
import { updatePartner, deletePartner, reorderPartners, updatePartnerLogo, createPartnerWithLogoUrl } from '@/app/admin/actions/partners'
import { SortableList } from '@/components/admin/sortable-list'
import { ImageUpload } from '@/components/admin/image-upload'
import type { AdminPartner } from '@/lib/types'

export function PartenairesTab({ partners }: { partners: AdminPartner[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newLogoUrl, setNewLogoUrl] = useState('')

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{partners.length} partenaire{partners.length > 1 ? 's' : ''}</span>
        <span className="text-xs text-white/40">Ordre = ordre dans le bandeau</span>
      </div>

      <SortableList
        items={partners}
        onReorder={reorderPartners}
        renderItem={(partner, dragHandleProps) => (
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <span {...dragHandleProps} className="cursor-grab text-white/20 hover:text-white/50">⠿</span>
            <img src={partner.logo_url} alt={partner.name} className="h-8 w-16 object-contain" />
            <span className="flex-1 text-sm">{partner.name}</span>
            <button onClick={() => setEditingId(editingId === partner.id ? null : partner.id)} className="text-xs text-white/40 hover:text-white">
              {editingId === partner.id ? 'Fermer' : 'Éditer'}
            </button>
            <form action={deletePartner.bind(null, partner.id)}>
              <button type="submit" className="text-xs text-red-400 hover:text-red-300" onClick={e => { if (!confirm('Supprimer ?')) e.preventDefault() }}>✕</button>
            </form>
          </div>
        )}
      />

      {/* Inline edit form */}
      {editingId && (() => {
        const partner = partners.find(p => p.id === editingId)!
        const updateWithId = updatePartner.bind(null, editingId)
        return (
          <div className="rounded-lg border border-blue-500/30 bg-white/5 p-4 flex flex-col gap-3">
            <p className="text-xs text-white/40">Éditer — {partner.name}</p>
            <form action={updateWithId} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">Nom</label>
                <input name="name" defaultValue={partner.name} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <input type="hidden" name="logo_url" value={partner.logo_url} />
              <button type="submit" className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">Enregistrer</button>
            </form>
            <ImageUpload currentUrl={partner.logo_url} label="Logo" onUpload={(url) => updatePartnerLogo(editingId, url)} />
          </div>
        )
      })()}

      {/* New partner */}
      <div className="rounded-lg border border-dashed border-white/20 p-4 flex flex-col gap-3">
        <p className="text-xs text-white/40">Nouveau partenaire</p>
        <form action={async (fd: FormData) => {
          await createPartnerWithLogoUrl(String(fd.get('name') ?? ''), newLogoUrl)
        }} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50">Nom</label>
            <input name="name" placeholder="Nom du partenaire" required className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          </div>
          <ImageUpload label="Logo" onUpload={(url) => setNewLogoUrl(url)} />
          <button type="submit" disabled={!newLogoUrl} className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            Ajouter le partenaire
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add components/admin/tabs/partenaires-tab.tsx
git commit -m "feat: add partenaires tab with image upload"
```

---

### Task 20 : Tab À propos

**Files:**
- Create: `components/admin/tabs/apropos-tab.tsx`

- [ ] **Step 1 : Créer le composant**

```typescript
// components/admin/tabs/apropos-tab.tsx
'use client'

import Link from 'next/link'
import { upsertContent } from '@/app/admin/actions/content'
import type { SiteContent, AdminPole } from '@/lib/types'

export function AProposTab({ content, team }: { content: SiteContent; team: AdminPole[] }) {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Mission */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-4">
        <h2 className="text-xs uppercase tracking-widest text-white/40">Mission</h2>
        <form action={upsertContent} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="apropos_mission_title" className="text-xs text-white/50">Titre de section</label>
            <input id="apropos_mission_title" name="apropos_mission_title" defaultValue={content.apropos_mission_title} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="apropos_mission_text" className="text-xs text-white/50">Texte</label>
            <textarea id="apropos_mission_text" name="apropos_mission_text" defaultValue={content.apropos_mission_text} rows={5} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white resize-none focus:border-blue-500 focus:outline-none" />
          </div>
          <button type="submit" className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">
            Enregistrer
          </button>
        </form>
      </section>

      {/* Descriptions des pôles */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
        <h2 className="text-xs uppercase tracking-widest text-white/40">Descriptions des pôles</h2>
        <p className="text-xs text-white/40">Se modifient depuis l'onglet Équipe → Éditer pôle</p>
        <div className="flex flex-col gap-2">
          {team.map(pole => (
            <div key={pole.id} className="flex items-center justify-between rounded border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-sm">{pole.name}</span>
              <Link href="/admin/dashboard?tab=equipe" className="text-xs text-blue-400 hover:text-blue-300">→ Équipe</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add components/admin/tabs/apropos-tab.tsx
git commit -m "feat: add apropos tab"
```

---

## Phase 7 — Vérification finale

### Task 21 : Vérification end-to-end

- [ ] **Step 1 : Lancer tous les tests**

```bash
pnpm test
```

Expected: tous les tests PASS, aucune régression.

- [ ] **Step 2 : Vérifier le build**

```bash
pnpm build
```

Expected: BUILD SUCCESS.

- [ ] **Step 3 : Démarrer le serveur de dev**

```bash
pnpm dev
```

- [ ] **Step 4 : Tester le flow admin complet**

1. Aller sur `http://localhost:3000/admin` → vérifier le formulaire de login
2. Se connecter avec les credentials `.env.local` → vérifier redirection vers `/admin/dashboard`
3. **Tab Accueil** : modifier le titre hero → "Enregistrer" → vérifier mise à jour sur `http://localhost:3000`
4. **Tab Événements** : créer un nouvel événement → vérifier apparition dans la liste et sur `/evenements`
5. **Tab Événements** : ouvrir l'édition d'un événement → ajouter un highlight → ajouter une photo
6. **Tab Équipe** : créer un nouveau membre → vérifier sur `/equipe`
7. **Tab Partenaires** : drag & drop pour réordonner → vérifier ordre dans le bandeau sur `/`
8. **Accès sans session** : aller sur `http://localhost:3000/admin/dashboard` sans cookie → vérifier redirection vers `/admin`

- [ ] **Step 5 : Commit final**

```bash
git add .
git commit -m "feat: complete admin console with turso, blob, and dnd"
```

---

## Notes de déploiement

Avant de déployer sur Vercel :

1. Créer une base Turso sur https://turso.tech → récupérer `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN`
2. Créer un Blob store sur Vercel Dashboard → récupérer `BLOB_READ_WRITE_TOKEN`
3. Ajouter ces variables dans les Environment Variables Vercel
4. Exécuter le seed en local avec les vraies variables Turso :
   ```bash
   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... pnpm seed
   ```
5. Déployer
