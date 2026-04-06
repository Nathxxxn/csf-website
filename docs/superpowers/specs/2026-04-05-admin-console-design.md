# Admin Console — Spec de Design

**Date :** 2026-04-05
**Statut :** Approuvé

---

## Contexte

Le site CSF est maintenu manuellement via des fichiers JSON versionnés. Les futurs mandats de l'association doivent pouvoir mettre à jour le contenu (membres, événements, partenaires, textes) sans toucher au code. Cette console admin est l'interface graphique qui leur permettra de le faire.

---

## Décisions clés

| Sujet | Décision |
|-------|----------|
| Hébergement | Vercel |
| Persistence des données | Turso (SQLite edge) via `@libsql/client` |
| Stockage des images | Vercel Blob |
| Layout dashboard | Onglets en haut |
| Éditeur texte | Champs simples (input / textarea) |
| Publication | Immédiate (pas de brouillon) |
| Réordonnement | Drag & drop via `@dnd-kit/core` |

---

## Architecture

### Couche données

Les fichiers `data/team.json`, `data/events.json` et `data/partners.json` sont migrés vers Turso. En développement local, `@libsql/client` pointe sur un fichier SQLite local (`file:local.db`). En production, il pointe sur la base Turso distante via `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN`.

### Schéma de base de données

**`poles`**
- `id` TEXT PRIMARY KEY
- `name` TEXT NOT NULL
- `badge` TEXT NOT NULL
- `description` TEXT NOT NULL
- `order_index` INTEGER NOT NULL

**`team_members`**
- `id` TEXT PRIMARY KEY
- `name` TEXT NOT NULL
- `role` TEXT NOT NULL
- `photo_url` TEXT
- `linkedin` TEXT
- `pole_id` TEXT NOT NULL → FK `poles.id`
- `order_index` INTEGER NOT NULL

**`events`**
- `id` TEXT PRIMARY KEY
- `title` TEXT NOT NULL
- `date` TEXT NOT NULL
- `partner` TEXT NOT NULL
- `partner_description` TEXT
- `pole` TEXT
- `description` TEXT NOT NULL
- `image_url` TEXT
- `status` TEXT NOT NULL (`upcoming` | `past`)
- `order_index` INTEGER NOT NULL

**`event_highlights`**
- `id` TEXT PRIMARY KEY
- `event_id` TEXT NOT NULL → FK `events.id`
- `title` TEXT NOT NULL
- `description` TEXT NOT NULL
- `order_index` INTEGER NOT NULL

**`event_photos`**
- `id` TEXT PRIMARY KEY
- `event_id` TEXT NOT NULL → FK `events.id`
- `url` TEXT NOT NULL
- `caption` TEXT
- `order_index` INTEGER NOT NULL

**`partners`**
- `id` TEXT PRIMARY KEY
- `name` TEXT NOT NULL
- `logo_url` TEXT NOT NULL
- `order_index` INTEGER NOT NULL

**`site_content`**
- `key` TEXT PRIMARY KEY
- `value` TEXT NOT NULL

Clés `site_content` : `hero_title`, `hero_subtitle`, `stats_poles`, `stats_membres`, `stats_evenements`, `apropos_mission_title`, `apropos_mission_text`.

### Lecture des données

Les Server Components lisent directement depuis Turso via des fonctions dans `lib/data.ts` (qui remplacent les imports JSON actuels). Les pages `/evenements/[id]/page.tsx` et `generateStaticParams` sont mises à jour en conséquence.

### Écriture des données

Toutes les modifications passent par des Server Actions dans `app/admin/actions/` (un fichier par domaine : `events.ts`, `team.ts`, `partners.ts`, `content.ts`). Chaque action vérifie la session avant d'écrire.

Le fichier existant `app/admin/actions.ts` (login/logout) est renommé `app/admin/actions/auth.ts` pour libérer le nom du dossier.

### Stockage des images

Upload via Vercel Blob (`@vercel/blob`). Les Server Actions reçoivent un `FormData` avec le fichier, l'uploadent sur Vercel Blob, et stockent l'URL retournée dans Turso.

---

## Interface — Dashboard

### Layout général

```
┌─────────────────────────────────────────────────┐
│  Console Admin                      [Déconnexion]│
├──────────┬───────────┬────────┬──────────┬───────┤
│  Accueil │Événements │ Équipe │Partenaires│À propos│
├─────────────────────────────────────────────────┤
│                                                 │
│              Zone d'édition                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

Header : "Console Admin" + bouton Déconnexion.
Navigation : 5 onglets, pas d'emojis.

---

### Onglet Accueil

Deux sections éditables :

**Section Hero**
- Titre principal (`hero_title`)
- Sous-titre (`hero_subtitle`)

**Statistiques**
- Nombre de pôles (`stats_poles`)
- Nombre de membres (`stats_membres`)
- Événements par an (`stats_evenements`)

Bouton "Enregistrer" unique en haut à droite.

---

### Onglet Événements

**Vue liste**
- Compteur d'événements total
- Bouton "+ Nouveau événement"
- Deux sections : "À venir" / "Passés"
- Chaque ligne : poignée drag & drop (⠿), titre, partenaire + date, badge statut, bouton "→ Éditer"
- Drag & drop pour réordonner (ordre indépendant du statut)

**Page d'édition d'un événement** (`/admin/dashboard/evenements/[id]`)

Accessible via "→ Éditer" ou "+ Nouveau". Contient 4 sections :

1. **Informations générales**
   - Titre, Date, Partenaire, Statut (select: À venir / Passé), Description courte, Image principale (upload)

2. **Section partenaire** (pour la page détail `/evenements/[id]`)
   - Description longue du partenaire

3. **Points clés (Highlights)**
   - Liste ordonnée par drag & drop
   - Chaque highlight : titre + description
   - Boutons Ajouter / Supprimer

4. **Galerie photos**
   - Upload multiple
   - Chaque photo : aperçu miniature + légende éditable
   - Réordonnables par drag & drop
   - Suppression individuelle

Bouton "Enregistrer tout" en bas. Lien "← Retour aux événements" en haut.

---

### Onglet Équipe

**Vue principale**
- Pôles empilés, chacun drag & droppable (ordre global des pôles)
- Chaque pôle affiche : poignée, nom, badge (compteur membres), bouton "Éditer pôle", bouton "+ Membre"
- Les membres sont listés dans chaque pôle, drag & droppables au sein du même pôle uniquement (pour changer de pôle : utiliser le champ "Pôle" dans le formulaire)
- Chaque membre : poignée, avatar initiales, nom, rôle, bouton Éditer, bouton Supprimer (✕ rouge)
- Bouton "+ Nouveau pôle" en bas de la liste

**Formulaire membre** (panneau latéral droit)
- Photo (upload, avec aperçu avatar)
- Nom complet
- Rôle
- Pôle (select)
- LinkedIn (optionnel)

**Formulaire pôle** (panneau latéral droit, via "Éditer pôle")
- Nom
- Badge (label court)
- Description

---

### Onglet Partenaires

- Liste ordonnée par drag & drop
- Chaque ligne : poignée, aperçu logo, nom, fichier actuel, bouton Éditer, bouton Supprimer
- Formulaire d'ajout en bas de liste : nom + upload logo + bouton "Ajouter"
- Ordre = ordre d'affichage dans le bandeau du site

---

### Onglet À propos

**Section Mission**
- Titre de section
- Texte de mission

Bouton "Enregistrer".

**Descriptions des pôles**
- Affichage en lecture seule avec lien "→ Équipe" par pôle
- Les descriptions se modifient depuis l'onglet Équipe → "Éditer pôle"

---

## Routes admin

```
/admin                          → Login
/admin/dashboard                → Onglet Accueil (défaut)
/admin/dashboard?tab=evenements → Onglet Événements
/admin/dashboard?tab=equipe     → Onglet Équipe
/admin/dashboard?tab=partenaires→ Onglet Partenaires
/admin/dashboard?tab=apropos    → Onglet À propos
/admin/dashboard/evenements/[id]→ Page d'édition d'un événement
/admin/dashboard/evenements/new → Nouvel événement
```

Le middleware existant (`middleware.ts`) protège déjà `/admin/dashboard/*`.

---

## Variables d'environnement à ajouter

```env
# Turso
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=...
```

En développement local, `TURSO_DATABASE_URL=file:local.db` (pas de token nécessaire).

---

## Migration

Un script `scripts/seed.ts` lit les JSON existants et insère les données dans Turso. À exécuter une fois lors du déploiement initial.

---

## Vérification

1. `pnpm dev` → se connecter sur `/admin` → vérifier accès dashboard
2. Modifier le titre hero → vérifier mise à jour sur `/`
3. Ajouter un événement → vérifier apparition sur `/evenements`
4. Uploader une photo membre → vérifier affichage sur `/equipe`
5. Réordonner les partenaires → vérifier ordre dans le bandeau
6. Accéder à `/admin/dashboard` sans session → vérifier redirection vers `/admin`
