# Hero First Paint Design

**Problem**

Le contenu principal du hero de la page d'accueil n'apparaît qu'après un délai perceptible. Les animations d'entrée sont volontairement séquencées entre 1.0s et 1.5s après le montage, ce qui donne l'impression que la page tarde à afficher son contenu principal.

**Decision**

Conserver l'identité visuelle du hero, mais ramener tous les délais d'entrée au voisinage du premier paint. Le badge, le titre, le sous-titre et les CTA doivent commencer à apparaître immédiatement ou quasi immédiatement, avec uniquement un micro-décalage entre blocs.

**Scope**

- Modifier uniquement [`components/landing/hero.tsx`](/Users/nathandifraja/CSF_website/components/landing/hero.tsx)
- Ajouter un garde-fou de test dans [`__tests__/hero.test.tsx`](/Users/nathandifraja/CSF_website/__tests__/hero.test.tsx)
- Ne pas toucher au layout global, à la navbar ni au loader global déjà retiré

**Behavior**

- Le hero doit être lisible dès l'arrivée sur la page
- Les animations restent courtes et discrètes
- Aucun délai supérieur à un seuil raisonnable ne doit être réintroduit pour les blocs principaux

**Testing**

- Ajouter un test unitaire qui verrouille les délais d'entrée du hero sous des seuils courts
- Exécuter le test ciblé du hero après la modification
