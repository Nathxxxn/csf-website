# Gradient → Hero Synergy Design

## Context

Le loader affiche un gradient WebGL animé qui disparaît en fondu après 1800ms. Actuellement, les fils blancs (FloatingPaths) et le texte du hero démarrent immédiatement au mount — mais personne ne les voit car le loader les cache. Quand le loader s'efface, ils sont déjà animés depuis 1.8s, créant une rupture visuelle.

**Objectif :** faire en sorte que les fils blancs semblent "émerger du gradient" au moment où celui-ci se retire, puis que le texte apparaisse dans la foulée. Une seule chorégraphie continue, aucune rupture.

## Chorégraphie cible

```
t=0ms      Loader monte (gradient animé plein écran)
           FloatingPaths : opacity 0.05 (quasi-invisibles sous le gradient)

t=1600ms   FloatingPaths commencent à bloomer (opacity 0.05 → 0.9, durée 1400ms)

t=1800ms   Loader commence son fondu (opacity 1 → 0, durée 1100ms)
           Les fils montent pendant que le gradient part — ils semblent en émerger

t=1900ms   Badge "Association Finance" apparaît (fondu 600ms)
t=2100ms   Titre "Shaping the future..." apparaît (fondu + remontée Y)
t=2350ms   Sous-titre apparaît
t=2550ms   Boutons CTA apparaissent

t=2900ms   Loader complètement disparu, hero pleinement visible
```

## Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `components/landing/hero.tsx` | FloatingPaths : opacity initiale 0.05, bloom déclenché à t=1600ms via `useEffect`. Délais texte ajustés. |
| `components/ui/page-loader.tsx` | Aucun changement |

## Constantes de timing (à définir en haut de hero.tsx)

```ts
const LOADER_DISPLAY_MS = 1800   // durée d'affichage du loader
const PATHS_BLOOM_START = 1600   // 200ms avant que le gradient commence à partir
const PATHS_BLOOM_DURATION = 1.4 // secondes (framer-motion)
const TEXT_BADGE_DELAY = 1.9     // secondes depuis mount
const TEXT_TITLE_DELAY = 2.1
const TEXT_SUB_DELAY = 2.35
const TEXT_BTNS_DELAY = 2.55
```

## Modifications de FloatingPaths

FloatingPaths reçoit un nouveau prop `bloomDelay?: number` (ms). En interne :

```tsx
// État : paths ont-ils commencé leur bloom ?
const [bloomed, setBloomed] = useState(false)

useEffect(() => {
  const timer = setTimeout(() => setBloomed(true), bloomDelay ?? 0)
  return () => clearTimeout(timer)
}, [bloomDelay])

// opacity initiale très faible, transite vers normale quand bloomed=true
animate={bloomed
  ? { opacity: [0.3, 0.6, 0.3], pathLength: 1, pathOffset: [0, 1, 0] }
  : { opacity: 0.05 }
}
```

Les paths gardent leur animation de flow normale une fois bloomés.

## Modifications du texte hero

Les `BlurFade` et `motion.div` du texte voient leurs `delay` augmenter :

| Élément | Avant | Après |
|---------|-------|-------|
| Badge (BlurFade) | `delay={0.2}` | `delay={TEXT_BADGE_DELAY}` |
| Titre (motion.div) | démarre immédiatement | `initial={{ opacity: 0 }}` + `animate={{ opacity: 1 }}` avec `transition={{ delay: TEXT_TITLE_DELAY }}` |
| Paragraphe (BlurFade) | `delay={0.6}` | `delay={TEXT_SUB_DELAY}` |
| Boutons (BlurFade) | `delay={0.75}` | `delay={TEXT_BTNS_DELAY}` |

Le titre garde son animation lettre par lettre — elle démarre simplement plus tard.

## Ce qui ne change pas

- `page-loader.tsx` — inchangé
- Le reste du site (autres pages) — aucune modification
- Les animations internes des FloatingPaths (pathLength, pathOffset) — identiques une fois bloomés
- Les couleurs, styles, et layout du hero

## Vérification

1. `npm run dev` → ouvrir `http://localhost:3000`
2. Observer : le gradient anime ~1.8s
3. Pendant le fondu : les fils commencent à apparaître depuis l'intérieur du gradient
4. Texte émerge progressivement en cascade
5. Hard refresh → reproduit identiquement
6. `npm run build` → build propre sans erreurs TypeScript
