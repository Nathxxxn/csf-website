# Contact Partners Intro — Spec de Design

**Date :** 2026-04-06
**Statut :** En revue

---

## Contexte

La page [contact](/Users/nathandifraja/CSF_website/app/contact/page.tsx) sert aujourd'hui surtout de point d'entree vers le formulaire de prise de contact. Elle manque d'une mise en contexte forte pour les entreprises qui arrivent depuis la landing ou depuis un partage direct du lien.

L'objectif est d'ajouter en tete de page une section sticky tres visuelle qui montre les partenaires de l'association avant le formulaire. Le point de depart est le composant "scrolling-animation" fourni par le user, mais il doit etre adapte au langage visuel du site actuel.

---

## Decision de design

La direction retenue est la **version B** du brainstorming visuel :

- section sticky dominante en haut de la page
- grand systeme concentrique autour d'un noyau central
- cartes partenaires en orbite, alimentees par les logos reels
- progression au scroll avec expansion du rayon
- texte editorial central qui apparait apres un seuil de scroll

Cette direction reste proche du prompt d'origine dans son ambition visuelle, mais elle est re-themee pour le site :

- palette sombre et nette
- bordures sobres
- pas de gradient flashy au centre
- logos traites comme surfaces premium, pas comme avatars

---

## Architecture

### Composant

Un nouveau composant sera cree dans :

- [scrolling-partners-intro.tsx](/Users/nathandifraja/CSF_website/components/ui/scrolling-partners-intro.tsx)

Il sera client (`"use client"`) car il depend du scroll et de l'etat local.

### Data flow

La page contact deviendra un Server Component afin de charger les partenaires via `getPartners()` :

- [contact/page.tsx](/Users/nathandifraja/CSF_website/app/contact/page.tsx)
- [data.ts](/Users/nathandifraja/CSF_website/lib/data.ts)

Le composant recevra :

- `partners: Partner[]`

Il ne fera aucun fetch lui-meme. Toute la logique de presentation sera derivee des props.

### Source des logos

Les logos viendront des partenaires existants :

- [partners.json](/Users/nathandifraja/CSF_website/data/partners.json)

Chaque carte orbitale utilisera `partner.logo` comme image principale et `partner.name` comme `alt` et fallback texte.

---

## Structure de page

La page contact sera recomposee dans cet ordre :

1. section sticky partenaires
2. intro editoriale "Parlons-en."
3. formulaire de contact existant

Le formulaire reste fonctionnellement identique. Le changement porte sur la hierarchie visuelle de la page, pas sur son comportement metier.

---

## Design du composant

### Layout general

Le composant occupe une grande hauteur de scroll afin de laisser vivre l'animation :

- desktop : section entre `160vh` et `200vh`
- mobile : section reduite mais toujours sticky

Le contenu visible est centre dans un viewport sticky :

- anneau externe
- anneau intermediaire
- coeur central
- 7 a 8 cartes partenaires autour

### Noyau central

Le centre affiche un contenu editorial court, dans le ton actuel du site :

- label discret, type `Partenaires`
- titre en 2 lignes maximum
- texte court qui explique que CS Finance travaille deja avec des entreprises et qu'il est possible d'en discuter

Le texte central n'apparait pas immediatement. Il devient lisible apres un seuil de scroll, une fois que les logos se sont suffisamment deployes.

### Cartes partenaires

Chaque partenaire est rendu dans une petite carte arrondie :

- format carre ou legerement rectangulaire
- fond sombre
- bordure subtile
- logo centre avec marge interne
- ombre legere

Les cartes ne doivent pas ressembler a des photos de profil. Ce sont des blocs de marque.

### Mouvement

Le scroll pilote :

- l'expansion du rayon orbital
- l'apparition progressive des anneaux
- l'opacite du contenu central

Le mouvement ne depend pas de Framer Motion. Une implementation simple a base de `scrollY` et de styles inline suffit, dans l'esprit du prompt fourni.

---

## Responsive

### Desktop

Desktop garde l'effet hero dominant.

- rayon large
- 7 ou 8 cartes visibles
- anneaux concentriques lisibles
- texte central complet

### Mobile

Mobile garde le meme principe, mais en version simplifiee :

- hauteur sticky reduite
- rayon plus court
- cartes plus petites
- moins d'ecart entre les cartes
- texte central plus court

L'objectif n'est pas de dupliquer exactement le desktop, mais de conserver le meme geste visuel sans rendre la page lourde.

---

## Comportement et robustesse

- Si un logo ne charge pas, la carte affiche le nom du partenaire en fallback.
- Si le nombre de partenaires evolue, les angles orbitaux sont calcules automatiquement.
- Si la liste est plus longue que l'orbite cible, on limite a un sous-ensemble coherent pour garder une composition propre.
- Le composant reste purement presentational. Aucun effet secondaire metier.

---

## Integration design avec le site

Le composant doit s'inserer dans le site actuel, pas l'ecraser.

Cela implique :

- meme fond global sombre que le reste du site
- meme logique de bordures et surfaces que les autres composants premium
- typo deja en place dans le projet
- intensite visuelle forte, mais sans changer le language general du site

La version brute du prompt ne sera pas reprise telle quelle :

- pas de fond blanc
- pas de gradient multicolore
- pas de style "Gen AI"
- texte adapte au contexte partenariat CS Finance

---

## Verification prevue

- build Next.js reussi apres passage de la page contact en serveur + composant sticky client
- verification visuelle desktop
- verification visuelle mobile
- verification du fallback logo
- verification que le formulaire reste atteignable sans friction apres la section sticky

---

## Hors scope

- refonte complete de la page contact
- changement du formulaire ou des server actions
- ajout de nouveaux logos ou reimport d'assets
- animation complexe par librairie externe supplementaire
