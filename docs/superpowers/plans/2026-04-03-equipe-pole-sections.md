# Équipe — Sections par pôle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter sous le RadialOrbitalTimeline existant une section détaillée par pôle, avec des cartes membres animées (3D tilt, hover effects) adaptées au contexte de l'association CSF.

**Architecture:** Le composant `TeamPolesSection` est un Client Component qui reçoit les données `PoleData[]` depuis la page serveur. Il itère sur les 6 pôles et rend pour chacun une section avec header (badge + titre + description) et une grille responsive de `MemberCard` animés. Le composant s'insère sous le `RadialOrbitalTimeline` dans `app/equipe/page.tsx`, sans remplacer la visualisation existante.

**Tech Stack:** Next.js 16 App Router, TypeScript 5, Tailwind CSS v4, framer-motion v12 (déjà installé), lucide-react (déjà installé), shadcn/ui Badge + Button + Card (déjà présents dans `/components/ui/`)

---

## File Structure

| Fichier | Action | Responsabilité |
|---------|--------|---------------|
| `lib/types.ts` | Modify | Étendre `Member` avec champs optionnels `bio?`, `skills?`, `email?` |
| `components/ui/team-pole-section.tsx` | **Create** | Composant principal `TeamPolesSection` + `PoleSection` + `MemberCard` |
| `app/equipe/page.tsx` | Modify | Importer et rendre `TeamPolesSection` sous `RadialOrbitalTimeline` |

---

## Task 1: Extend Member type with optional fields

**Files:**
- Modify: `lib/types.ts:1-6`

- [ ] **Step 1: Update the Member interface**

Remplacer le contenu actuel de `lib/types.ts` (l'interface `Member`) :

```typescript
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

export interface Event {
  id: string
  title: string
  date: string
  partner: string
  pole: string
  description: string
  image: string | null
  status: 'upcoming' | 'past'
}

export interface Partner {
  name: string
  logo: string
}
```

- [ ] **Step 2: Verify TypeScript still compiles**

```bash
cd /Users/nathandifraja/CSF_website && npx tsc --noEmit
```

Expected: aucune erreur (les nouveaux champs sont optionnels, les données existantes restent valides).

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: extend Member type with optional bio, skills, email fields"
```

---

## Task 2: Create TeamPolesSection component

**Files:**
- Create: `components/ui/team-pole-section.tsx`

Le composant est un Client Component (`"use client"`) car il utilise framer-motion et des hooks React (`useState`).

### Sous-composant `MemberCard`

Carte animée avec :
- Avatar (photo ou initiales)
- Nom + badge rôle
- Bio (si présente)
- Skills en badges outline (si présents)
- Boutons LinkedIn + Email (si présents)
- 3D tilt sur hover (`useMotionValue` + `useSpring` + `useTransform`)

### Sous-composant `PoleSection`

Section par pôle avec :
- Header : badge du pôle + nom + description
- Grille responsive de `MemberCard`

### Composant principal `TeamPolesSection`

- Animation d'entrée staggered via `containerVariants`
- Séparateur visuel entre pôles

- [ ] **Step 1: Créer le fichier**

Créer `/Users/nathandifraja/CSF_website/components/ui/team-pole-section.tsx` avec le contenu suivant :

```tsx
"use client"

import { useState } from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion"
import { Linkedin, Mail, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { PoleData, Member } from "@/lib/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
}

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.6, 0.05, 0.01, 0.9] },
  },
}

// ─── MemberCard ───────────────────────────────────────────────────────────────

function MemberCard({ member }: { member: Member }) {
  const [isHovered, setIsHovered] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const shouldReduceMotion = useReducedMotion()

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 30,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left - rect.width / 2) / (rect.width / 2))
    mouseY.set((e.clientY - rect.top - rect.height / 2) / (rect.height / 2))
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  const initials = getInitials(member.name)
  const hasLinkedin = Boolean(member.linkedin)
  const hasEmail = Boolean(member.email)
  const hasSkills = Array.isArray(member.skills) && member.skills.length > 0

  return (
    <motion.div variants={itemVariants} className="perspective-1000">
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="group relative"
      >
        <Card className="relative overflow-hidden rounded-2xl border border-border/60 bg-card backdrop-blur-xl transition-shadow duration-500 hover:shadow-xl hover:shadow-black/30">
          {/* Gradient overlay on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/8 via-white/4 to-transparent"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Sparkle */}
          <motion.div
            className="absolute right-3 top-3 z-10"
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
            transition={{ duration: 0.25 }}
          >
            <Sparkles className="h-4 w-4 text-primary/70" aria-hidden />
          </motion.div>

          <div className="relative z-10 p-5">
            {/* Avatar */}
            <div className="mb-4 flex justify-center">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="h-20 w-20 overflow-hidden rounded-full border border-border/60 bg-secondary flex items-center justify-center">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-foreground/70 select-none">
                      {initials}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Name + role */}
            <div className="text-center">
              <motion.h4
                className="mb-1.5 text-base font-semibold tracking-tight text-foreground"
                animate={{ scale: isHovered ? 1.03 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {member.name}
              </motion.h4>

              <Badge
                variant="secondary"
                className="mb-3 bg-white/8 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur"
              >
                {member.role}
              </Badge>

              {/* Bio */}
              {member.bio && (
                <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                  {member.bio}
                </p>
              )}

              {/* Skills */}
              {hasSkills && (
                <motion.div
                  className="mb-3 flex flex-wrap justify-center gap-1"
                  animate={{ opacity: isHovered ? 1 : 0.65 }}
                  transition={{ duration: 0.3 }}
                >
                  {member.skills!.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="border-border/50 bg-white/4 text-[10px] text-muted-foreground"
                    >
                      {skill}
                    </Badge>
                  ))}
                </motion.div>
              )}

              {/* Social links */}
              {(hasLinkedin || hasEmail) && (
                <motion.div
                  className="flex justify-center gap-2"
                  animate={{ opacity: isHovered ? 1 : 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  {hasLinkedin && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full border border-border/40 bg-white/5 text-muted-foreground hover:text-foreground"
                      asChild
                    >
                      <a
                        href={member.linkedin!}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`LinkedIn de ${member.name}`}
                      >
                        <Linkedin className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    </Button>
                  )}
                  {hasEmail && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full border border-border/40 bg-white/5 text-muted-foreground hover:text-foreground"
                      asChild
                    >
                      <a href={`mailto:${member.email}`} aria-label={`Email de ${member.name}`}>
                        <Mail className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    </Button>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// ─── PoleSection ──────────────────────────────────────────────────────────────

function getGridCols(count: number): string {
  if (count >= 4) return "sm:grid-cols-2 lg:grid-cols-4"
  if (count === 3) return "sm:grid-cols-2 lg:grid-cols-3"
  if (count === 2) return "sm:grid-cols-2"
  return "grid-cols-1"
}

function PoleSection({ pole }: { pole: PoleData }) {
  const gridCols = getGridCols(pole.members.length)

  return (
    <section aria-labelledby={`pole-${pole.badge}-heading`} className="mb-20">
      {/* Pole header */}
      <div className="mb-8 text-center">
        <Badge variant="secondary" className="mb-3 bg-white/8 text-xs uppercase tracking-widest text-muted-foreground">
          {pole.badge}
        </Badge>
        <h3
          id={`pole-${pole.badge}-heading`}
          className="mb-2 text-2xl font-semibold tracking-tight text-foreground"
        >
          {pole.pole}
        </h3>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">
          {pole.description}
        </p>
      </div>

      {/* Members grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className={`grid gap-5 ${gridCols}`}
      >
        {pole.members.map((member, idx) => (
          <MemberCard key={`${pole.pole}-${idx}`} member={member} />
        ))}
      </motion.div>
    </section>
  )
}

// ─── TeamPolesSection (export) ────────────────────────────────────────────────

interface TeamPolesSectionProps {
  poles: PoleData[]
}

export function TeamPolesSection({ poles }: TeamPolesSectionProps) {
  return (
    <section
      aria-labelledby="team-poles-heading"
      className="relative w-full overflow-hidden px-4 py-16 sm:px-6 lg:px-10"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-emerald-400/8 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <Badge variant="secondary" className="mb-4 gap-2 bg-white/8 text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3" aria-hidden />
            Notre Équipe
          </Badge>
          <h2
            id="team-poles-heading"
            className="mb-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl"
          >
            Les membres de CSF
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Une équipe passionnée organisée en pôles thématiques pour vous offrir le meilleur de la finance.
          </p>
        </motion.div>

        {/* Poles */}
        {poles.map((pole) => (
          <PoleSection key={pole.pole} pole={pole} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/nathandifraja/CSF_website && npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add components/ui/team-pole-section.tsx
git commit -m "feat: add TeamPolesSection component with animated per-pole member cards"
```

---

## Task 3: Wire TeamPolesSection into the equipe page

**Files:**
- Modify: `app/equipe/page.tsx`

- [ ] **Step 1: Mettre à jour la page**

Remplacer le contenu de `app/equipe/page.tsx` :

```tsx
import { getTeam } from '@/lib/data'
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline'
import { TeamPolesSection } from '@/components/ui/team-pole-section'

export const metadata = {
  title: 'Équipe — CentraleSupélec Finance',
  description: "Les membres de CentraleSupélec Finance, organisés par pôle.",
}

export default function TeamPage() {
  const team = getTeam()

  return (
    <div className="pt-16">
      <RadialOrbitalTimeline poleData={team} />
      <TeamPolesSection poles={team} />
    </div>
  )
}
```

- [ ] **Step 2: Lancer le serveur de dev et vérifier visuellement**

```bash
cd /Users/nathandifraja/CSF_website && npm run dev
```

Ouvrir `http://localhost:3000/equipe` et vérifier :
- RadialOrbitalTimeline toujours visible en haut
- 6 sections de pôles visibles en dessous (Bureau, Finance de Marché, Finance d'Entreprise, Formation, Alumni, Partenariat)
- Chaque section affiche son badge + titre + description
- Les cartes membres s'animent à l'entrée dans le viewport
- Hover sur une carte → tilt 3D + gradient + sparkle

- [ ] **Step 3: Vérifier le responsive**

Réduire la fenêtre à < 640px : les cartes doivent passer en colonne unique. Entre 640px et 1024px : 2 colonnes.

- [ ] **Step 4: Build de production**

```bash
cd /Users/nathandifraja/CSF_website && npm run build
```

Expected: ✓ Compiled successfully, aucune erreur TypeScript.

- [ ] **Step 5: Commit**

```bash
git add app/equipe/page.tsx
git commit -m "feat: integrate TeamPolesSection into equipe page below orbital timeline"
```

---

## Self-Review

### Spec coverage

| Requirement | Task |
|---|---|
| Section par pôle | Task 2 — `PoleSection` | ✓ |
| Cartes membres animées (3D tilt, hover) | Task 2 — `MemberCard` | ✓ |
| Adapter composant au contexte CSF (LinkedIn/Email) | Task 2 — social links | ✓ |
| Conserver RadialOrbitalTimeline existant | Task 3 | ✓ |
| Graceful fallback si bio/skills absents | Task 2 — conditions `hasSkills`, `member.bio &&` | ✓ |
| Responsive (mobile → desktop) | Task 2 — `getGridCols()` | ✓ |
| Types étendus sans casser l'existant | Task 1 — champs optionnels | ✓ |

### Placeholder scan

Aucun TODO/TBD détecté. Tout le code est complet et directement utilisable.

### Type consistency

- `Member` étendu en Task 1, utilisé en Task 2 sous les mêmes noms de propriétés (`member.bio`, `member.skills`, `member.email`, `member.linkedin`, `member.photo`)
- `PoleData` inchangé, passé comme `poles: PoleData[]` en Task 3
- Export nommé `TeamPolesSection` en Task 2, importé de même en Task 3
