# Navbar Redesign + Admin Login — Design Spec

**Date:** 2026-04-04  
**Status:** Approved

---

## Context

Le site CSF (CentraleSupélec Finance) utilise actuellement une navbar pleine largeur avec un bouton "Nous contacter". L'objectif est de remplacer cette navbar par un composant floating pill centré (style mini-navbar), et d'ajouter une page de connexion administrateur accessible uniquement via URL directe (`/admin`). La fonctionnalité de console admin complète (gestion des événements, membres, etc.) est hors scope pour cette itération.

---

## Périmètre

### In scope
- Remplacement de la navbar par le style floating pill
- Page de login admin (`/admin`)
- Page dashboard admin placeholder (`/admin/dashboard`)
- Auth par cookies signés HMAC-SHA256 (credentials en env vars)
- Middleware de protection de `/admin/dashboard`

### Out of scope (itérations futures)
- Comptes utilisateurs pour réservation d'événements
- Console admin complète (CRUD événements, membres, textes)
- Gestion multi-admins

---

## Section 1 — Navbar

### Comportement

- **Style** : floating pill centré, `position: fixed; top: 1.5rem; left: 50%; transform: translateX(-50%)`
- **Background** : `rgba(31,31,31,0.57)` + `backdrop-blur-sm` + `border border-[#333]`
- **Border-radius** : `rounded-full` (fermé) → `rounded-xl` (ouvert sur mobile, transition 300ms)

### Desktop
- Logo seul à gauche (image depuis `/public` — filename à confirmer une fois le logo ajouté par l'utilisateur, pas de texte)
- Liens nav : Événements, Équipe, À propos — animation hover slide vertical (`AnimatedNavLink`)
- Bouton CTA unique : "Nous contacter" (desktop) / "Contacter" (mobile dropdown) → `/contact`, style gradient blanc sur noir, `rounded-full`

### Mobile
- Pill compact auto-sized : logo + hamburger uniquement
- Clic hamburger → dropdown centré sous la pill avec les 3 liens + bouton "Contacter"
- Transition `max-height` + `opacity` 300ms

### Pas de bouton login dans la navbar
La page `/admin` est accessible uniquement en tapant l'URL directement.

### Fichier
- Remplace `components/layout/navbar.tsx` en place (pas de nouveau fichier)
- Le composant `AnimatedNavLink` est défini dans le même fichier

---

## Section 2 — Auth Admin

### Flux
1. L'admin navigue vers `/admin`
2. Formulaire : champ "Identifiant" + "Mot de passe" + bouton "Se connecter"
3. Server Action valide les credentials contre les env vars
4. Si valide → pose un cookie `httpOnly` signé + redirect vers `/admin/dashboard`
5. Si invalide → affiche message d'erreur inline "Identifiants incorrects."
6. `/admin/dashboard` → middleware vérifie le cookie → si invalide, redirect `/admin`
7. Bouton "Se déconnecter" → Server Action qui supprime le cookie + redirect `/admin`

### Credentials
```env
# .env.local
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
SESSION_SECRET=...  # 32+ caractères aléatoires
```

### Session cookie (HMAC-SHA256, sans dépendance externe)
- Payload : `{ username, iat }` encodé en base64
- Signature : HMAC-SHA256 avec `SESSION_SECRET`
- Format cookie : `<payload>.<signature>`, `httpOnly`, `sameSite: lax`, `path: /`
- Expiration : 8h

### Fichiers

| Fichier | Rôle |
|---|---|
| `lib/session.ts` | `signCookie(payload)`, `verifyCookie(value)` |
| `app/admin/page.tsx` | Page login (Server Component + form) |
| `app/admin/actions.ts` | Server Actions : `login()`, `logout()` |
| `app/admin/dashboard/page.tsx` | Dashboard placeholder (Server Component protégé) |
| `middleware.ts` | Protège `/admin/dashboard`, redirige si pas de session valide |

---

## Section 3 — Design UI

### Login page (`/admin`)
- Fond `#0a0a0a` (cohérent avec le reste du site)
- Carte centrée, max-w-sm
- Logo CSF + titre "Espace administrateur"
- Inputs stylés avec `border border-[#333] bg-white/4 rounded-lg`
- Bouton "Se connecter" — même style gradient que le CTA navbar
- Message d'erreur inline (rouge, fond rouge/8% opacité)

### Dashboard (`/admin/dashboard`)
- Header : titre "Console administrateur" + bouton "Se déconnecter"
- Corps : zone placeholder "Console en cours de développement"
- Pas de navbar publique sur ces pages

---

## Vérification

- [ ] Navbar visible sur toutes les pages publiques (layout.tsx)
- [ ] Mobile : pill compact, dropdown fonctionnel
- [ ] `/admin` accessible sans être connecté
- [ ] `/admin` redirige vers `/admin/dashboard` si déjà connecté
- [ ] `/admin/dashboard` redirige vers `/admin` si non connecté (middleware)
- [ ] Login incorrect → message d'erreur affiché
- [ ] Login correct → redirect `/admin/dashboard`
- [ ] "Se déconnecter" → supprime le cookie + redirect `/admin`
- [ ] Cookie non falsifiable (vérification HMAC)
