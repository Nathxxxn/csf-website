# Mobile Responsiveness — CS Finance Website

**Date:** 2026-04-15  
**Objectif:** Rendre le site propre et efficace sur mobile (approche B — refactors par composant).  
**Scope:** Corriger les layouts cassés identifiés. Aucune modification desktop.

---

## Contexte

Le site CS Finance est un Next.js 16 + Tailwind v4 + React 19. Le thème est sombre (fond `#060606`). La navbar, le hero, les stats, les CTA et le footer sont déjà bien adaptés. Six zones nécessitent un refactor mobile.

---

## Composants à modifier

### 1. EventsGallery — `/evenements`

**Fichier :** `components/events/events-gallery.tsx`

**Problème :** La galerie parallaxe 3 colonnes (`ContainerScroll`) rend chaque colonne à ~33vw ≈ 120px sur mobile. Les images sont illisibles et l'interaction scroll-to-browse est cassée. Aucun fallback mobile n'existe.

**Solution :**
- Ajouter une fonction locale `MobileEventsGrid` dans le même fichier, rendue uniquement sous `md` (`md:hidden`)
- `MobileEventsGrid` : grille `grid grid-cols-2 gap-4 px-4 py-8`, réutilisant les `GalleryItemCard` existants (avec `isRevealed={true}` pour activer les liens)
- Passer le `ContainerScroll` existant à `hidden md:block`
- Aucun changement à la logique desktop

**Breakpoint :** `md` (768px)

---

### 2. TeamShowcase — accueil (landing preview)

**Fichier :** `components/ui/team-showcase.tsx`

**Problème :** La grille photo 3 colonnes décalées utilise des largeurs fixes en pixels (110–172px) et cause un scroll horizontal non désiré sur mobile. La liste des membres alterne entre `flex-col` et `sm:grid-cols-2` de façon maladroite.

**Solution :**
- Ajouter une grille photo mobile (`md:hidden`) : `grid grid-cols-2 gap-2`, photos en `aspect-square object-cover rounded-lg`
- Overlay sur chaque photo : gradient `from-transparent to-black/70` avec nom + rôle en bas
- Passer la grille décalée existante à `hidden md:flex`
- Liste membres : supprimer le breakpoint intermédiaire `sm:grid-cols-2`, passer à `flex-col` sur mobile directement (garder `md:flex-col` pour le desktop)

**Breakpoint :** `md` (768px)

---

### 3. EventRow — liste des événements (landing + page événements)

**Fichier :** `components/shared/event-row.tsx`

**Problème :** La grille `grid-cols-[80px_1fr_auto]` conserve la colonne `auto` même quand le badge est masqué (`hidden sm:flex`), créant un déséquilibre visuel.

**Solution :**
- Mobile : `grid-cols-[64px_1fr]` (supprimer la colonne auto)
- `sm`+ : `sm:grid-cols-[80px_1fr_auto]` (layout actuel)
- Gap : `gap-4` mobile, `sm:gap-6` sur sm+
- Le badge garde son `hidden sm:flex` existant — aucun autre changement

---

### 4. TeamPreview landing — lien "Voir toute l'équipe"

**Fichier :** `components/landing/team-preview.tsx`

**Problème :** Le lien "Voir toute l'équipe →" est `hidden sm:block` — il disparaît sur mobile, laissant l'utilisateur sans chemin de navigation vers la page équipe.

**Solution :**
- Garder le lien existant (`hidden sm:block`) en haut à droite
- Ajouter un lien équivalent centré sous le `TeamShowcase`, visible uniquement sur mobile (`block sm:hidden`) :
  ```
  <Link href="/equipe" className="block sm:hidden text-center text-sm text-muted-foreground mt-4 px-6">
    Voir toute l'équipe →
  </Link>
  ```

---

### 5. Page À propos — titre H1

**Fichier :** `app/a-propos/page.tsx`

**Problème :** `text-5xl` (48px) sans breakpoint inférieur — trop grand sur les téléphones < 375px.

**Solution :** `text-4xl sm:text-5xl`

---

### 6. ScrollingPartnersIntro — débordement sur < 360px

**Fichier :** `components/ui/scrolling-partners-intro.tsx`

**Problème :** Les cercles ont des dimensions fixes en pixels (`width: 320, height: 320` sur mobile). Sur les téléphones très étroits (< 360px), le conteneur déborde.

**Solution :** Dans le state `isMobile`, calculer la largeur disponible dynamiquement :
```ts
const [mobileWidth, setMobileWidth] = useState(320)

// dans handleResize :
setMobileWidth(Math.min(320, window.innerWidth - 32))
```
Puis utiliser `mobileWidth` à la place de `320` et scaler les cercles intérieurs proportionnellement (`mobileWidth * 0.78`, `mobileWidth * 0.59`).

---

## Ce qui ne change pas

- **Navbar** : hamburger menu déjà fonctionnel
- **Hero** : breakpoints typographiques déjà corrects, CTA déjà en `flex-col sm:flex-row`
- **Stats** : grille `grid-cols-2 md:grid-cols-4` déjà correcte
- **PartnersCta** : CTA déjà en `flex-col sm:flex-row`
- **Footer** : déjà adapté
- **ContactForm** : déjà en `grid-cols-1 sm:grid-cols-2`
- **TeamPolesSection** (/equipe) : les effets 3D hover dégradent gracieusement sur touch (onMouseMove ne se déclenche pas)
- **Toute la logique desktop** : aucun changement

---

## Ordre d'implémentation suggéré

1. `EventRow` — fix simple, 1 ligne de CSS
2. `À propos h1` — fix trivial
3. `ScrollingPartnersIntro` — fix dimensions
4. `TeamPreview` — ajout lien mobile
5. `EventsGallery` — ajout `MobileEventsGrid`
6. `TeamShowcase` — grille photo mobile + overlay

---

## Non-objectifs

- Expérience mobile "premium" (animations tactiles, swipe gestures) — hors scope pour cette itération
- Refonte du design visuel
- Modifications de la logique métier ou des server actions
