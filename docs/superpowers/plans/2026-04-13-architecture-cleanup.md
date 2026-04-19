# Architecture Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger les 7 problèmes architecturaux identifiés — de la duplication de données hardcodées à la source de vérité brisée des événements — pour rendre le codebase maintenable et cohérent.

**Architecture:** Le site utilise Next.js App Router avec une DB Turso (SQLite edge) pour les données éditables et des fichiers JSON pour les événements publics. Le plan unifie progressivement les deux en faisant pointer les pages publiques vers la DB, puis consolide les constantes et utilitaires éparpillés.

**Tech Stack:** Next.js 16, TypeScript strict, Turso/LibSQL, Vitest, Zod (à ajouter), Tailwind 4

---

## Fichiers concernés (vue d'ensemble)

| Tâche | Fichiers modifiés | Fichiers créés |
|-------|------------------|----------------|
| 1 — constants.ts | `components/landing/stats.tsx`, `app/a-propos/page.tsx`, `components/contact/contact-form.tsx` | `lib/constants.ts` |
| 2 — formatDate() | `components/shared/event-card.tsx`, `components/shared/event-row.tsx` | — |
| 3 — requireSession() | `app/admin/actions/events.ts`, `team.ts`, `partners.ts`, `content.ts` | — (ajout dans `lib/session.ts`) |
| 4 — Migration events JSON→DB | `lib/data.ts`, `lib/types.ts` | `scripts/seed-events.ts` |
| 5 — Supprimer team.json | `data/team.json` | — |
| 6 — Validation Zod admin | `app/admin/actions/events.ts`, `team.ts`, `partners.ts` | `lib/validation.ts` |

---

## Task 1: Créer `lib/constants.ts` — centraliser STATS et SUBJECTS

**Problème:** `STATS` est défini deux fois (stats.tsx:4-9 et a-propos/page.tsx:11-16). `SUBJECTS` vit dans contact-form.tsx. Aucune source unique de vérité.

**Files:**
- Create: `lib/constants.ts`
- Modify: `components/landing/stats.tsx:4-9`
- Modify: `app/a-propos/page.tsx:11-16`
- Modify: `components/contact/contact-form.tsx:19-25`

- [ ] **Step 1.1: Créer `lib/constants.ts` avec STATS et SUBJECTS**

```typescript
// lib/constants.ts

export const STATS = [
  { value: 6,    suffix: '',  label: 'Pôles' },
  { value: 200,  suffix: '+', label: 'Membres' },
  { value: 4000, suffix: '+', label: 'Étudiants' },
  { value: 20,   suffix: '+', label: 'Événements / an' },
] as const

export const CONTACT_SUBJECTS = [
  { value: 'partnership', label: 'Partenariat événementiel' },
  { value: 'sponsoring',  label: 'Sponsoring' },
  { value: 'conference',  label: 'Conférence / Workshop' },
  { value: 'recruiting',  label: 'Recrutement' },
  { value: 'other',       label: 'Autre' },
] as const
```

- [ ] **Step 1.2: Mettre à jour `components/landing/stats.tsx`**

Remplacer les lignes 1-9 :

```typescript
import { NumberTicker } from '@/components/ui/number-ticker'
import { BlurFade } from '@/components/ui/blur-fade'
import { STATS } from '@/lib/constants'
```

Supprimer l'array `const STATS = [...]` local (lignes 4-9), garder le reste du composant tel quel.

- [ ] **Step 1.3: Mettre à jour `app/a-propos/page.tsx`**

Remplacer les lignes 11-16 :

```typescript
import { STATS } from '@/lib/constants'
```

Supprimer l'array `const STATS = [...]` local (lignes 11-16), garder le reste tel quel.

- [ ] **Step 1.4: Mettre à jour `components/contact/contact-form.tsx`**

Remplacer les lignes 19-25 :

```typescript
import { CONTACT_SUBJECTS } from '@/lib/constants'
```

Supprimer l'array `const SUBJECTS = [...]` local. Renommer toutes les occurrences de `SUBJECTS` en `CONTACT_SUBJECTS` dans ce fichier.

- [ ] **Step 1.5: Vérifier la compilation**

```bash
cd /Users/nathandifraja/CSF_website && npx tsc --noEmit
```

Résultat attendu : aucune erreur de type.

- [ ] **Step 1.6: Commit**

```bash
git add lib/constants.ts components/landing/stats.tsx app/a-propos/page.tsx components/contact/contact-form.tsx
git commit -m "refactor: centralize STATS and CONTACT_SUBJECTS in lib/constants.ts"
```

---

## Task 2: Centraliser `formatDate()` dans `lib/utils.ts`

**Problème:** `event-card.tsx` et `event-row.tsx` ont chacun leur propre implémentation de formatage de date avec des formats différents (`month + year` vs `day` vs `month`). Duplication et risque d'incohérence.

**Files:**
- Modify: `lib/utils.ts`
- Modify: `components/shared/event-card.tsx:12-17`
- Modify: `components/shared/event-row.tsx:10-16`

- [ ] **Step 2.1: Ajouter les fonctions de formatage dans `lib/utils.ts`**

Ajouter à la fin de `lib/utils.ts` (après la fonction `cn`) :

```typescript
/**
 * Formatte une date ISO (YYYY-MM-DD) en mois + année en français.
 * Ex: "2025-04-10" → "avril 2025"
 */
export function formatEventDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Retourne le jour du mois formaté sur 2 chiffres.
 * Ex: "2025-04-10" → "10"
 */
export function formatEventDay(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit' })
}

/**
 * Retourne le mois abrégé en majuscules.
 * Ex: "2025-04-10" → "AVR."
 */
export function formatEventMonth(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00')
    .toLocaleDateString('fr-FR', { month: 'short' })
    .toUpperCase()
}
```

- [ ] **Step 2.2: Mettre à jour `components/shared/event-card.tsx`**

Supprimer les lignes 12-17 (`function formatDate(...)`).

Ajouter l'import en haut :
```typescript
import { formatEventDate } from '@/lib/utils'
```

Remplacer l'appel `formatDate(event.date)` (ligne ~43) par `formatEventDate(event.date)`.

- [ ] **Step 2.3: Mettre à jour `components/shared/event-row.tsx`**

Supprimer les lignes 10-16 (`function formatDay(...)` et `function formatMonth(...)`).

Ajouter l'import en haut :
```typescript
import { formatEventDay, formatEventMonth } from '@/lib/utils'
```

Remplacer `formatDay(event.date)` par `formatEventDay(event.date)` et `formatMonth(event.date)` par `formatEventMonth(event.date)`.

- [ ] **Step 2.4: Vérifier la compilation**

```bash
cd /Users/nathandifraja/CSF_website && npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 2.5: Commit**

```bash
git add lib/utils.ts components/shared/event-card.tsx components/shared/event-row.tsx
git commit -m "refactor: extract date formatting utilities to lib/utils.ts"
```

---

## Task 3: Extraire `requireSession()` comme export partagé dans `lib/session.ts`

**Problème:** La fonction `requireSession()` est copy-pastée dans 4 fichiers d'actions admin (events.ts, team.ts, partners.ts, content.ts). Si la logique doit changer, il faut la mettre à jour 4 fois.

**Files:**
- Modify: `lib/session.ts` (ajouter l'export)
- Modify: `app/admin/actions/events.ts:1-15`
- Modify: `app/admin/actions/team.ts:1-15`
- Modify: `app/admin/actions/partners.ts:1-15`
- Modify: `app/admin/actions/content.ts:1-15`

- [ ] **Step 3.1: Ajouter `requireAdminSession()` dans `lib/session.ts`**

Ajouter à la fin de `lib/session.ts` :

```typescript
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * À appeler en début de chaque Server Action admin.
 * Redirige vers /admin si la session est absente ou invalide.
 */
export async function requireAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = verifyCookie(token)
  if (!session) redirect('/admin')
}
```

> Note: `lib/session.ts` est un fichier serveur — `cookies()` et `redirect()` de Next.js sont disponibles côté serveur uniquement. Pas besoin de `'use server'` directive ici.

- [ ] **Step 3.2: Mettre à jour `app/admin/actions/events.ts`**

Supprimer les lignes 10-15 (la fonction `requireSession()` locale).

Modifier les imports en haut du fichier :

```typescript
'use server'

import { cookies } from 'next/headers'  // supprimer cette ligne
import { redirect } from 'next/navigation'  // supprimer cette ligne
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { verifyCookie, SESSION_COOKIE_NAME, requireAdminSession } from '@/lib/session'  // ajouter requireAdminSession
import { getDb } from '@/lib/db'
```

Remplacer toutes les occurrences de `await requireSession()` par `await requireAdminSession()` dans ce fichier.

- [ ] **Step 3.3: Même opération dans `app/admin/actions/team.ts`**

Supprimer les lignes 10-15.

Modifier l'import :
```typescript
import { verifyCookie, SESSION_COOKIE_NAME, requireAdminSession } from '@/lib/session'
```

Remplacer `await requireSession()` par `await requireAdminSession()`.

- [ ] **Step 3.4: Même opération dans `app/admin/actions/partners.ts`**

Même transformation que team.ts.

- [ ] **Step 3.5: Même opération dans `app/admin/actions/content.ts`**

Même transformation que team.ts.

- [ ] **Step 3.6: Vérifier la compilation**

```bash
cd /Users/nathandifraja/CSF_website && npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 3.7: Commit**

```bash
git add lib/session.ts app/admin/actions/events.ts app/admin/actions/team.ts app/admin/actions/partners.ts app/admin/actions/content.ts
git commit -m "refactor: extract requireAdminSession() to lib/session.ts, remove duplication in actions"
```

---

## Task 4: Migrer les événements de JSON vers Turso DB

**Problème:** `getEvents()` lit `data/events.json` (hardcodé, non éditable via admin). `getAdminEvents()` lit la table Turso `events` (éditable, mais invisible sur le site). Le panneau admin ne contrôle pas ce que les visiteurs voient.

**Plan:** 
1. Créer un script de migration qui insère les données de `events.json` dans la DB Turso.
2. Modifier `getEvents()` (et dérivées) pour lire depuis la DB.
3. Aligner le type public `Event` avec ce que la DB peut fournir.
4. Supprimer les imports JSON devenus inutiles.

**Mapping de types:**

| JSON / type public actuel | DB `events` | Décision |
|---------------------------|-------------|----------|
| `image: string \| null` | `image_url: string \| null` | `image` ← `image_url` |
| `images: string[]` | absent | Calculé depuis `event_photos[].url` |
| `partnerDescription?: string` | `partner_description: string \| null` | Normaliser en `partnerDescription` |
| `highlights?: EventHighlight[]` | table `event_highlights` | Join |
| `photos?: EventPhoto[]` | table `event_photos` | Join, `src` ← `url` |

**Files:**
- Create: `scripts/seed-events.ts`
- Modify: `lib/types.ts`
- Modify: `lib/data.ts`

- [ ] **Step 4.1: Créer le script de migration `scripts/seed-events.ts`**

Ce script lit `data/events.json` et l'insère dans Turso. À exécuter **une seule fois** en local.

```typescript
// scripts/seed-events.ts
// Usage: npx tsx scripts/seed-events.ts
// Nécessite TURSO_DATABASE_URL et TURSO_AUTH_TOKEN dans .env.local

import { createClient } from '@libsql/client'
import { randomUUID } from 'crypto'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import eventsJson from '../data/events.json'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

async function main() {
  console.log(`Seeding ${eventsJson.length} events...`)

  for (const [i, e] of eventsJson.entries()) {
    const eventId = e.id ?? randomUUID()

    // Vérifier si l'événement existe déjà
    const { rows } = await db.execute({ sql: 'SELECT id FROM events WHERE id=?', args: [eventId] })
    if (rows.length > 0) {
      console.log(`  ⏭  Skipping existing event: ${e.title}`)
      continue
    }

    await db.execute({
      sql: 'INSERT INTO events (id, title, date, partner, partner_description, pole, description, image_url, status, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [
        eventId,
        e.title,
        e.date,
        e.partner,
        e.partnerDescription ?? null,
        e.pole ?? null,
        e.description,
        e.image ?? null,
        e.status,
        i,
      ],
    })

    // Insérer les highlights
    for (const [hi, h] of (e.highlights ?? []).entries()) {
      await db.execute({
        sql: 'INSERT INTO event_highlights (id, event_id, title, description, order_index) VALUES (?, ?, ?, ?, ?)',
        args: [randomUUID(), eventId, h.title, h.description, hi],
      })
    }

    // Insérer les photos
    for (const [pi, p] of (e.photos ?? []).entries()) {
      await db.execute({
        sql: 'INSERT INTO event_photos (id, event_id, url, caption, order_index) VALUES (?, ?, ?, ?, ?)',
        args: [randomUUID(), eventId, p.src, p.caption ?? null, pi],
      })
    }

    console.log(`  ✓  Inserted: ${e.title}`)
  }

  console.log('Done.')
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 4.2: Ajouter `tsx` aux devDependencies si absent**

```bash
cd /Users/nathandifraja/CSF_website && npm list tsx 2>/dev/null | grep tsx || npm install -D tsx
```

- [ ] **Step 4.3: Exécuter le script de migration**

```bash
cd /Users/nathandifraja/CSF_website && npx tsx scripts/seed-events.ts
```

Résultat attendu :
```
Seeding 12 events...
  ✓  Inserted: Visite Barclays Investment Bank
  ✓  Inserted: Conférence M&A et Private Equity
  ...
Done.
```

Si un événement est déjà en DB (message `⏭ Skipping`), c'est normal — le script est idempotent.

- [ ] **Step 4.4: Vérifier en DB que les données sont présentes**

```bash
cd /Users/nathandifraja/CSF_website && npx tsx -e "
import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN! })
const { rows } = await db.execute('SELECT id, title, status FROM events ORDER BY order_index')
console.table(rows)
process.exit(0)
"
```

Résultat attendu : tableau listant tous les événements migrés.

- [ ] **Step 4.5: Mettre à jour `lib/types.ts` — simplifier le type `Event`**

Remplacer l'interface `Event` (lignes 28-41) par :

```typescript
export interface Event {
  id: string
  title: string
  date: string
  partner: string
  partnerDescription: string | null
  pole: string | null
  description: string
  image: string | null
  images: string[]           // calculé depuis photos[].url (rétrocompat)
  highlights: EventHighlight[]
  photos: EventPhoto[]
  status: 'upcoming' | 'past'
}
```

> Changements : `partnerDescription` passe de `string | undefined` → `string | null`, `highlights` et `photos` passent de `?` optionnel à toujours présents (tableaux vides par défaut), `pole` devient `string | null` (cohérent avec la DB).

- [ ] **Step 4.6: Mettre à jour `lib/data.ts` — faire lire `getEvents()` depuis la DB**

Remplacer les lignes 1-2 (les imports JSON) et les fonctions `getEvents()`, `getUpcomingEvents()`, `getPastEvents()`, `getEventById()` (lignes 33-61) :

```typescript
// Supprimer ces imports en haut :
// import eventsJson from '@/data/events.json'
// import partnersJson from '@/data/partners.json'

// Remplacer getEvents() et les fonctions dérivées :

export async function getEvents(): Promise<Event[]> {
  const db = getDb()
  const { rows: eventRows } = await db.execute('SELECT * FROM events ORDER BY order_index')
  const { rows: highlightRows } = await db.execute('SELECT * FROM event_highlights ORDER BY order_index')
  const { rows: photoRows } = await db.execute('SELECT * FROM event_photos ORDER BY order_index')

  return eventRows.map(e => {
    const status = requireString(e.status, 'event.status')
    if (status !== 'upcoming' && status !== 'past') throw new Error(`Invalid event status: "${status}"`)

    const photos = photoRows
      .filter(p => p.event_id === e.id)
      .map(p => ({
        src: requireString(p.url, 'photo.url'),
        caption: (p.caption as string | null) ?? '',
      }))

    return {
      id: requireString(e.id, 'event.id'),
      title: requireString(e.title, 'event.title'),
      date: requireString(e.date, 'event.date'),
      partner: requireString(e.partner, 'event.partner'),
      partnerDescription: (e.partner_description as string | null) ?? null,
      pole: (e.pole as string | null) ?? null,
      description: requireString(e.description, 'event.description'),
      image: (e.image_url as string | null) ?? null,
      images: photos.map(p => p.src),  // rétrocompat
      highlights: highlightRows
        .filter(h => h.event_id === e.id)
        .map(h => ({
          title: requireString(h.title, 'highlight.title'),
          description: requireString(h.description, 'highlight.description'),
        })),
      photos,
      status,
    }
  })
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

export async function getEventById(id: string): Promise<Event | undefined> {
  const events = await getEvents()
  return events.find(e => e.id === id)
}
```

- [ ] **Step 4.7: Mettre à jour `getPartners()` pour utiliser la DB**

Remplacer `getPartners()` (lignes 54-56 dans `lib/data.ts`) :

```typescript
export async function getPartners(): Promise<Partner[]> {
  const db = getDb()
  const { rows } = await db.execute('SELECT * FROM partners ORDER BY order_index')
  return rows.map(p => ({
    name: requireString(p.name, 'partner.name'),
    logo: requireString(p.logo_url, 'partner.logo_url'),
  }))
}
```

> Note: Le type public `Partner` a `logo` (pas `logo_url`). On mappe depuis la DB.

- [ ] **Step 4.8: Supprimer les imports JSON devenus inutiles dans `lib/data.ts`**

Supprimer les lignes :
```typescript
import eventsJson from '@/data/events.json'
import partnersJson from '@/data/partners.json'
```

- [ ] **Step 4.9: Vérifier la compilation TypeScript**

```bash
cd /Users/nathandifraja/CSF_website && npx tsc --noEmit
```

Résultat attendu : aucune erreur. Si des composants utilisent `event.partnerDescription` sans `| null`, corriger les accès avec `??` ou optional chaining `?.`.

- [ ] **Step 4.10: Lancer le serveur de dev et vérifier les pages**

```bash
cd /Users/nathandifraja/CSF_website && npm run dev
```

Vérifier manuellement :
- `/evenements` — liste des événements s'affiche
- `/evenements/visite-barclays-2025-04` — page détail avec highlights et photos
- `/` — section events-preview sur la home
- Panel admin `/admin/dashboard?tab=evenements` — toujours fonctionnel

- [ ] **Step 4.11: Commit**

```bash
git add scripts/seed-events.ts lib/types.ts lib/data.ts
git commit -m "feat: migrate events source of truth from JSON to Turso DB

Public pages now read from the same DB as the admin panel.
getPartners() also migrated from partners.json to DB.
Added seed script for one-time migration of existing JSON data."
```

---

## Task 5: Supprimer le fichier mort `data/team.json`

**Problème:** `data/team.json` existe mais n'est jamais importé ni utilisé. Les données d'équipe sont exclusivement gérées par la DB Turso via `getTeam()`.

**Files:**
- Delete: `data/team.json`

- [ ] **Step 5.1: Confirmer que team.json n'est nulle part importé**

```bash
cd /Users/nathandifraja/CSF_website && grep -r "team.json" --include="*.ts" --include="*.tsx" .
```

Résultat attendu : aucune sortie (aucun fichier ne l'importe).

- [ ] **Step 5.2: Supprimer le fichier**

```bash
rm /Users/nathandifraja/CSF_website/data/team.json
```

- [ ] **Step 5.3: Commit**

```bash
git add -u data/team.json
git commit -m "chore: remove unused data/team.json (team data is in Turso DB)"
```

---

## Task 6: Ajouter la validation Zod aux actions admin

**Problème:** Les actions admin (`createEvent`, `updateEvent`, `createPole`, `createMember`, etc.) insèrent directement en DB sans valider les données. Un titre vide `''` peut être inséré, une date invalide ne sera pas rejetée.

**Files:**
- Create: `lib/validation.ts`
- Modify: `app/admin/actions/events.ts`
- Modify: `app/admin/actions/team.ts`
- Modify: `app/admin/actions/partners.ts`

- [ ] **Step 6.1: Installer Zod**

```bash
cd /Users/nathandifraja/CSF_website && npm install zod
```

- [ ] **Step 6.2: Créer `lib/validation.ts` avec les schémas**

```typescript
// lib/validation.ts
import { z } from 'zod'

export const eventSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  partner: z.string().min(1, 'Le partenaire est requis').max(200),
  partner_description: z.string().max(2000).optional().nullable(),
  pole: z.string().max(100).optional().nullable(),
  description: z.string().min(1, 'La description est requise').max(5000),
  status: z.enum(['upcoming', 'past']),
})

export const highlightSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().min(1, 'La description est requise').max(2000),
})

export const poleSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  badge: z.string().min(1, 'Le badge est requis').max(50),
  description: z.string().min(1, 'La description est requise').max(1000),
})

export const memberSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  role: z.string().min(1, 'Le rôle est requis').max(100),
  pole_id: z.string().uuid('pole_id invalide'),
  linkedin: z.string().url('URL LinkedIn invalide').optional().nullable(),
})

export const partnerSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  logo_url: z.string().url('URL du logo invalide'),
})

/**
 * Parse un FormData avec un schéma Zod.
 * Retourne { data } en succès ou { error: string } en échec.
 */
export function parseFormData<T>(
  schema: z.ZodSchema<T>,
  formData: FormData,
): { data: T; error?: never } | { data?: never; error: string } {
  const raw = Object.fromEntries(formData.entries())
  const result = schema.safeParse(raw)
  if (!result.success) {
    const messages = result.error.errors.map(e => e.message).join(', ')
    return { error: messages }
  }
  return { data: result.data }
}
```

- [ ] **Step 6.3: Mettre à jour `app/admin/actions/events.ts` — valider `createEvent` et `updateEvent`**

Ajouter l'import :
```typescript
import { eventSchema, highlightSchema, parseFormData } from '@/lib/validation'
```

Modifier `createEvent` :

```typescript
export async function createEvent(formData: FormData) {
  await requireAdminSession()

  const parsed = parseFormData(eventSchema, formData)
  if (parsed.error) throw new Error(parsed.error)

  const db = getDb()
  const { rows } = await db.execute('SELECT MAX(order_index) as max_order FROM events')
  const maxOrder = (rows[0]?.max_order as number | null) ?? -1
  const id = randomUUID()
  await db.execute({
    sql: 'INSERT INTO events (id, title, date, partner, partner_description, pole, description, image_url, status, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      id,
      parsed.data.title,
      parsed.data.date,
      parsed.data.partner,
      parsed.data.partner_description ?? null,
      parsed.data.pole ?? null,
      parsed.data.description,
      null,
      parsed.data.status,
      maxOrder + 1,
    ],
  })
  revalidatePath('/evenements')
  redirect(`/admin/dashboard/evenements/${id}`)
}
```

Modifier `updateEvent` de la même façon :

```typescript
export async function updateEvent(id: string, formData: FormData) {
  await requireAdminSession()

  const parsed = parseFormData(eventSchema, formData)
  if (parsed.error) throw new Error(parsed.error)

  const db = getDb()
  await db.execute({
    sql: 'UPDATE events SET title=?, date=?, partner=?, partner_description=?, pole=?, description=?, status=? WHERE id=?',
    args: [
      parsed.data.title,
      parsed.data.date,
      parsed.data.partner,
      parsed.data.partner_description ?? null,
      parsed.data.pole ?? null,
      parsed.data.description,
      parsed.data.status,
      id,
    ],
  })
  revalidatePath('/evenements')
  revalidatePath(`/evenements/${id}`)
}
```

Modifier `createHighlight` et `updateHighlight` :

```typescript
export async function createHighlight(eventId: string, formData: FormData) {
  await requireAdminSession()

  const parsed = parseFormData(highlightSchema, formData)
  if (parsed.error) throw new Error(parsed.error)

  const db = getDb()
  const { rows } = await db.execute({ sql: 'SELECT MAX(order_index) as m FROM event_highlights WHERE event_id=?', args: [eventId] })
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO event_highlights (id, event_id, title, description, order_index) VALUES (?, ?, ?, ?, ?)',
    args: [randomUUID(), eventId, parsed.data.title, parsed.data.description, maxOrder + 1],
  })
}

export async function updateHighlight(id: string, formData: FormData) {
  await requireAdminSession()

  const parsed = parseFormData(highlightSchema, formData)
  if (parsed.error) throw new Error(parsed.error)

  const db = getDb()
  await db.execute({
    sql: 'UPDATE event_highlights SET title=?, description=? WHERE id=?',
    args: [parsed.data.title, parsed.data.description, id],
  })
}
```

- [ ] **Step 6.4: Mettre à jour `app/admin/actions/team.ts` — valider les mutations**

Ajouter l'import :
```typescript
import { poleSchema, memberSchema, parseFormData } from '@/lib/validation'
```

Modifier `createPole` :

```typescript
export async function createPole(formData: FormData) {
  await requireAdminSession()

  const parsed = parseFormData(poleSchema, formData)
  if (parsed.error) throw new Error(parsed.error)

  const db = getDb()
  const { rows } = await db.execute('SELECT MAX(order_index) as m FROM poles')
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO poles (id, name, badge, description, order_index) VALUES (?, ?, ?, ?, ?)',
    args: [randomUUID(), parsed.data.name, parsed.data.badge, parsed.data.description, maxOrder + 1],
  })
  revalidatePath('/equipe')
}
```

Modifier `updatePole` :

```typescript
export async function updatePole(id: string, formData: FormData) {
  await requireAdminSession()

  const parsed = parseFormData(poleSchema, formData)
  if (parsed.error) throw new Error(parsed.error)

  const db = getDb()
  await db.execute({
    sql: 'UPDATE poles SET name=?, badge=?, description=? WHERE id=?',
    args: [parsed.data.name, parsed.data.badge, parsed.data.description, id],
  })
  revalidatePath('/equipe')
}
```

Modifier `createMember` :

```typescript
export async function createMember(formData: FormData) {
  await requireAdminSession()

  const parsed = parseFormData(memberSchema, formData)
  if (parsed.error) throw new Error(parsed.error)

  const db = getDb()
  const { rows } = await db.execute({ sql: 'SELECT MAX(order_index) as m FROM team_members WHERE pole_id=?', args: [parsed.data.pole_id] })
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO team_members (id, name, role, photo_url, linkedin, pole_id, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [randomUUID(), parsed.data.name, parsed.data.role, null, parsed.data.linkedin ?? null, parsed.data.pole_id, maxOrder + 1],
  })
  revalidatePath('/equipe')
}
```

Modifier `updateMember` :

```typescript
export async function updateMember(id: string, formData: FormData) {
  await requireAdminSession()

  const parsed = parseFormData(memberSchema, formData)
  if (parsed.error) throw new Error(parsed.error)

  const db = getDb()
  await db.execute({
    sql: 'UPDATE team_members SET name=?, role=?, linkedin=?, pole_id=? WHERE id=?',
    args: [parsed.data.name, parsed.data.role, parsed.data.linkedin ?? null, parsed.data.pole_id, id],
  })
  revalidatePath('/equipe')
}
```

- [ ] **Step 6.5: Mettre à jour `app/admin/actions/partners.ts`**

Ajouter l'import :
```typescript
import { partnerSchema, parseFormData } from '@/lib/validation'
```

Modifier `createPartner` :

```typescript
export async function createPartner(formData: FormData) {
  await requireAdminSession()

  const parsed = parseFormData(partnerSchema, formData)
  if (parsed.error) throw new Error(parsed.error)

  const db = getDb()
  const { rows } = await db.execute('SELECT MAX(order_index) as m FROM partners')
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO partners (id, name, logo_url, order_index) VALUES (?, ?, ?, ?)',
    args: [randomUUID(), parsed.data.name, parsed.data.logo_url, maxOrder + 1],
  })
  revalidatePath('/')
}
```

Modifier `updatePartner` :

```typescript
export async function updatePartner(id: string, formData: FormData) {
  await requireAdminSession()

  const parsed = parseFormData(partnerSchema, formData)
  if (parsed.error) throw new Error(parsed.error)

  const db = getDb()
  await db.execute({
    sql: 'UPDATE partners SET name=?, logo_url=? WHERE id=?',
    args: [parsed.data.name, parsed.data.logo_url, id],
  })
  revalidatePath('/')
}
```

- [ ] **Step 6.6: Vérifier la compilation**

```bash
cd /Users/nathandifraja/CSF_website && npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 6.7: Commit**

```bash
git add lib/validation.ts app/admin/actions/events.ts app/admin/actions/team.ts app/admin/actions/partners.ts
git commit -m "feat: add Zod validation to all admin server actions

Prevents empty strings and malformed dates/URLs from reaching the DB.
Extracted schemas to lib/validation.ts for reuse."
```

---

## Récapitulatif des tâches

| # | Tâche | Impact | Risque |
|---|-------|--------|--------|
| 1 | `lib/constants.ts` — centraliser STATS + SUBJECTS | Faible | Minimal |
| 2 | `formatDate()` dans `lib/utils.ts` | Faible | Minimal |
| 3 | `requireAdminSession()` partagé | Faible | Minimal |
| 4 | Migration events JSON → DB | **Critique** | Moyen — vérifier le mapping de types |
| 5 | Supprimer `data/team.json` | Cosmétique | Nul |
| 6 | Validation Zod admin | Élevé | Faible |

**Ordre recommandé:** 1 → 2 → 3 → 5 → 6 → 4 (laisser la migration pour la fin, après que le reste soit stabilisé)
