# CentraleSupélec Finance — Site Vitrine · Design Spec

**Date :** 2026-04-01  
**Statut :** Approuvé  
**Stack :** Next.js · Tailwind CSS · Framer Motion · shadcn/ui · MagicUI

---

## 1. Contexte et objectifs

CentraleSupélec Finance (CSF) est l'association finance de référence à CentraleSupélec. Le site vitrine doit :

- **Inspirer confiance aux entreprises partenaires** (banques, cabinets de conseil) pour nouer des partenariats événementiels
- **Attirer les étudiants CS** qui souhaitent rejoindre l'asso et découvrir ses pôles
- **Présenter les activités** : événements, équipe, pôles

Public cible double : étudiants CS + entreprises (banques, conseil, finance).

---

## 2. Direction artistique

Extraite du logo officiel CSF (cubes isométriques, line art blanc sur fond noir).

| Attribut | Valeur |
|---|---|
| Fond principal | `#060606` (noir profond) |
| Fond secondaire | `#0d0d0d` |
| Surfaces élevées | `#111111` |
| Bordures | `#1a1a1a` |
| Texte principal | `#ffffff` |
| Texte secondaire | `#555555` |
| Texte tertiaire | `#333333` |
| Accent | Aucun — monochrome pur |
| Typographie | Inter (variable) — system-ui en fallback |
| Style général | Géométrique, minimal, premium — Apple Dark / Linear |

Pas de couleur d'accent. Toute la hiérarchie visuelle repose sur les niveaux de gris, l'espacement et la typographie.

---

## 3. Architecture et pages

### 3.1 Structure des pages

| Route | Titre | Description |
|---|---|---|
| `/` | Landing | Page principale one-scroll |
| `/evenements` | Événements | Liste complète avec filtres |
| `/equipe` | Équipe | Membres par pôle |
| `/a-propos` | À propos | Histoire, mission, valeurs |
| `/contact` | Contact | Formulaire partenaires |

### 3.2 Architecture technique

- **Framework :** Next.js App Router (RSC par défaut, `"use client"` uniquement pour composants interactifs)
- **Styling :** Tailwind CSS v4 + shadcn/ui (preset `base-nova`)
- **Animations :** Framer Motion pour scroll reveals + transitions de page
- **Composants premium :** MagicUI (@magicui registry)
- **Données :** Fichiers JSON statiques dans `/data/` (pas de CMS) — `events.json`, `team.json`, `partners.json`
- **Images :** Dossier `/public/images/` — photos membres et événements

### 3.3 Structure des fichiers de données

```
/data/
  events.json      # { id, title, date, partner, pole, description, image, status: "upcoming"|"past" }
  team.json        # { pole, members: [{ name, role, photo, linkedin }] }
  partners.json    # { name, logo }
```

---

## 4. Landing Page (/)

Scroll continu — sections dans l'ordre :

### 4.1 Navbar
- Position : `sticky top-0`, z-index élevé
- Fond : transparent → `backdrop-blur` au scroll (via Framer Motion `useScroll`)
- Contenu : logo CSF (logo.svg, `filter: invert(1)`) + nom · liens de navigation · bouton "Nous contacter"
- Composants : `NavigationMenu` (shadcn) + `blur-fade` (MagicUI, apparition initiale)

### 4.2 Hero
- Hauteur : `min-h-screen`, contenu centré
- Fond : `dot-pattern` (MagicUI) avec `radial-gradient` pour le fondu vers le bas
- Badge animé : "Association · CentraleSupélec · 2024–2025" — `animated-shiny-text` (MagicUI)
- Titre : `font-size: clamp(52px, 7vw, 86px)`, `font-weight: 800`, apparition mot par mot via `text-animate` (MagicUI)
- Sous-titre : slide-up + blur-in (Framer Motion)
- CTA primaire : `shimmer-button` (MagicUI) → `/evenements`
- CTA secondaire : button ghost → `/contact`

### 4.3 Stats
- 4 colonnes séparées par des bordures `#1a1a1a`
- Chiffres : 6 pôles · 200+ membres · 30+ partenaires · 20+ événements/an
- Animation : `number-ticker` (MagicUI) déclenché à l'entrée dans le viewport
- Apparition : `blur-fade` en cascade (stagger 0.1s)

### 4.4 Équipe / Pôles
- Titre de section + sous-titre
- Pour chaque pôle : header (badge pôle · nom · `avatar-circles` · description) + grille de membres
- Card membre : photo circulaire (`Avatar` + `AvatarFallback` shadcn) · nom · rôle (`Badge` shadcn)
- Hover : `magic-card` (MagicUI spotlight) + `HoverCard` (shadcn) avec LinkedIn
- Pôles Bureau, Finance de Marché, Finance d'Entreprise : affichage complet (membres en grille)
- Pôles Formation, Alumni, Partenariat : grille condensée 3 colonnes côte à côte
- Reveal : `blur-fade` par pôle au scroll

**6 pôles :** Bureau · Finance de Marché · Finance d'Entreprise · Formation · Alumni · Partenariat

### 4.5 Événements (preview)
- Titre + lien "Voir tous →" vers `/evenements`
- Tabs shadcn : "À venir" / "Passés"
- **À venir** : `animated-list` (MagicUI) — événements en liste timeline, premier événement avec `border-beam`
- **Passés** : grille 3 colonnes de cards avec photo + date + partenaire + titre + description courte
- Hover cards : `magic-card` (MagicUI spotlight)
- Tags pôle : `Badge` (shadcn)

### 4.6 Partenaires (marquee)
- Titre minimal : "Ils nous font confiance"
- `marquee` (MagicUI) : 2 rangées en sens opposés, logos partenaires en `filter: grayscale(1) brightness(0.4)` → brightness(1) au hover

### 4.7 CTA Partenariat
- Fond : `dot-pattern` masqué par radial-gradient centré
- Titre animé : `text-animate` mot par mot
- Sous-titre : description de la valeur pour les entreprises partenaires
- CTA : `shimmer-button` → `/contact`
- Bouton secondaire ghost : "Voir nos partenaires" → ancre `#partenaires` (scrolle vers le marquee)

### 4.8 Footer
- Minimal : logo + nom · liens réseaux sociaux (LinkedIn, Instagram) · email contact

---

## 5. Page Événements (/evenements)

- Hero minimal : titre + sous-titre
- Filtres : `Tabs` shadcn par pôle (Tous · Marchés · Corporate · Formation · Alumni · Partenariat)
- Section "À venir" : liste timeline avec `animated-list` + `border-beam` sur le prochain
- Section "Passés" : grille masonry de cards avec photo, date, partenaire, description
- Cards : `magic-card` (spotlight hover) + `blur-fade` au scroll
- Tags : `Badge` shadcn

---

## 6. Page Équipe (/equipe)

- Hero : titre + nombre de membres + `avatar-circles` de tous les membres
- Navigation rapide : `Tabs` shadcn par pôle (ancre vers chaque section)
- Pour chaque pôle : header avec description + grille membres
- Cards membres identiques à la landing (Avatar, magic-card, HoverCard LinkedIn)
- `blur-fade` au scroll sur chaque grille de pôle

---

## 7. Page À propos (/a-propos)

- Histoire de l'association
- Mission et valeurs
- Description des 6 pôles (cards avec descriptions détaillées)
- Stats (réutilisation du composant number-ticker)
- Pas de composants complexes — texte + layout simple

---

## 8. Page Contact (/contact)

- Hero : "Collaborer avec CSF"
- Formulaire : `Card` avec `shine-border` (MagicUI) autour
  - Champs : Nom · Société · Email · Sujet (`Select` shadcn) · Message (`Textarea`)
  - Submit : `shimmer-button`
  - Confirmation : `sonner` toast
- Coordonnées directes : email + LinkedIn
- Action formulaire : `Server Action` Next.js (envoi email via **Resend**)

---

## 9. Composants MagicUI utilisés

| Composant | Section(s) |
|---|---|
| `dot-pattern` | Hero, CTA Partenariat |
| `text-animate` | Hero titre, CTA titre |
| `animated-shiny-text` | Hero badge |
| `shimmer-button` | Hero CTA, CTA Partenariat, Contact |
| `number-ticker` | Stats |
| `blur-fade` | Navbar, Stats, Équipe, Événements |
| `magic-card` | Cards membres, cards événements |
| `avatar-circles` | Headers de pôles, page Équipe |
| `animated-list` | Événements à venir |
| `border-beam` | Prochain événement featured |
| `marquee` | Section partenaires |
| `shine-border` | Formulaire contact |

---

## 10. Composants shadcn/ui utilisés

| Composant | Usage |
|---|---|
| `NavigationMenu` | Navbar |
| `Tabs` | Filtres événements, navigation équipe, tabs À venir/Passés |
| `Avatar` + `AvatarFallback` | Photos membres |
| `Badge` | Tags pôles, rôles membres |
| `HoverCard` | Détail membre au survol |
| `Card` + `CardContent` | Formulaire contact |
| `Select` | Champ sujet du formulaire |
| `Input` + `Textarea` | Formulaire contact |
| `sonner` | Toast confirmation envoi |

---

## 11. Données statiques

Toutes les données sont dans `/data/` sous forme de fichiers JSON. Pas de CMS. Mise à jour directe des fichiers par les membres du bureau.

```typescript
// data/team.json
[
  {
    "pole": "Bureau",
    "badge": "Bureau",
    "description": "...",
    "members": [
      { "name": "...", "role": "Président", "photo": "/images/team/xxx.jpg", "linkedin": "..." }
    ]
  }
]

// data/events.json
[
  {
    "id": "...",
    "title": "...",
    "date": "2025-04-15",
    "partner": "BNP Paribas CIB",
    "pole": "Finance de Marché",
    "description": "...",
    "image": "/images/events/xxx.jpg",
    "status": "upcoming"
  }
]
```

---

## 12. Animations — règles globales

- **Durée standard :** 0.4s ease-out
- **Stagger entre items :** 0.08s
- **Déclencheur :** IntersectionObserver (Framer Motion `whileInView`) — `once: true`
- **Transitions de page :** fade simple (0.3s) via Framer Motion `AnimatePresence`
- **Règle mobile :** `prefers-reduced-motion` respecté — animations désactivées si l'utilisateur l'a configuré

---

## 13. Hors scope

- Authentification / espace membres
- CMS ou back-office
- Blog / articles
- Système de réservation pour les événements
- Recrutement (l'asso ne recrute pas via le site)
