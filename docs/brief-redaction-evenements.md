# Brief — Rédiger une fiche événement pour le site CentraleSupélec Finance

## Contexte

Tu dois rédiger des fiches d'événements pour le site de l'association **CentraleSupélec Finance (CSF)**. Chaque fiche est un objet JSON à ajouter dans le fichier `data/events.json`. Le site affiche automatiquement chaque champ dans la bonne section de la page.

---

## Structure JSON exacte

```json
{
  "id": "slug-kebab-case-unique",
  "title": "Nom court de l'événement",
  "date": "YYYY-MM-DD",
  "partner": "Nom complet du partenaire ou organisateur",
  "partnerDescription": "2-3 phrases sur qui est le partenaire, ce qu'il fait, pourquoi il est pertinent pour des étudiants en finance.",
  "pole": "Finance de Marché | Finance d'Entreprise | Alumni | Formation",
  "description": "1-2 phrases résumant l'événement. Ton sobre, direct, sans marketing.",
  "image": "URL de l'image principale",
  "images": [
    "URL image 1",
    "URL image 2",
    "URL image 3",
    "URL image 4"
  ],
  "highlights": [
    {
      "title": "Nom court du temps fort (3-5 mots)",
      "description": "2-3 phrases décrivant ce temps fort. Concret, pas générique."
    },
    {
      "title": "...",
      "description": "..."
    },
    {
      "title": "...",
      "description": "..."
    }
  ],
  "photos": [
    {
      "src": "URL image 1 (même que images[0])",
      "caption": "1-2 phrases décrivant ce qui se passe sur la photo. Ton neutre, factuel."
    },
    {
      "src": "URL image 2",
      "caption": "..."
    },
    {
      "src": "URL image 3",
      "caption": "..."
    },
    {
      "src": "URL image 4",
      "caption": "..."
    }
  ],
  "status": "past | upcoming"
}
```

---

## Ce que chaque champ génère visuellement sur la page

| Champ | Section affichée |
|---|---|
| `image` | Hero plein écran en haut de page |
| `title` + `date` | Titre et date superposés sur le hero |
| `partner` | Sous-titre « Partenaire » avec le nom en gras |
| `partnerDescription` | Texte descriptif sous le nom du partenaire |
| `highlights` (tableau de 3) | Grille 3 colonnes « Au programme » (si upcoming) ou « Ce qu'on a fait » (si past) |
| `photos` (tableau de 4) | Galerie alternée image + légende (image gauche / texte droite, puis inverse) |

---

## Règles de ton

- **Sobre et direct** — pas de superlatifs, pas de formules marketing
- **Concret** — décrire ce qu'on fait vraiment, pas ce qu'on pourrait imaginer
- `partnerDescription` parle de l'entreprise dans le contexte finance/recrutement, pas comme une brochure corporate
- `description` (la courte) tient en 1-2 phrases maximum
- Les **highlights** couvrent des temps distincts de l'événement (ex : atelier, échange expert, moment networking)
- Les **captions** de photos décrivent une scène précise, pas l'événement en général

---

## Contraintes à respecter absolument

- Exactement **3 highlights**
- Exactement **4 photos** avec 4 URLs distinctes
- `id` en kebab-case, unique, de la forme `nom-evenement-partenaire-YYYY-MM`
- `date` au format `YYYY-MM-DD`
- `status` : `"past"` si terminé, `"upcoming"` si à venir
- `pole` doit être l'un des 4 suivants exactement : `"Finance de Marché"`, `"Finance d'Entreprise"`, `"Alumni"`, `"Formation"`

---

## Exemple de référence

```json
{
  "id": "mock-trading-bnp-2025-04",
  "title": "Mock Trading Session",
  "date": "2025-04-15",
  "partner": "BNP Paribas CIB",
  "partnerDescription": "BNP Paribas CIB est l'activité de banque de financement et d'investissement du groupe BNP Paribas. Les équipes accompagnent entreprises et investisseurs sur les sujets de financement, de marchés de capitaux et de gestion des risques.",
  "pole": "Finance de Marché",
  "description": "Une session pour se mettre dans la peau d'un desk de marché, avec mise en situation et échange avec les équipes.",
  "image": "https://images.unsplash.com/photo-1529218402470-5dec8fea0761?w=800&auto=format&fit=crop&q=80",
  "images": [
    "https://images.unsplash.com/photo-1529218402470-5dec8fea0761?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1608875004752-2fdb6a39ba4c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1528361237150-8a9a7df33035?w=800&auto=format&fit=crop&q=80"
  ],
  "highlights": [
    {
      "title": "Session de trading live",
      "description": "Les participants travaillent sur une simulation inspirée d'une vraie séance de marché, avec outils de pricing, prise de décision et débrief en direct."
    },
    {
      "title": "Masterclass traders senior",
      "description": "Les équipes reviennent sur leur quotidien, les réflexes attendus et les compétences qui comptent vraiment en début de carrière."
    },
    {
      "title": "Buffet & networking",
      "description": "La session se termine par un moment plus libre pour poser les questions qu'on n'ose pas toujours poser pendant la présentation."
    }
  ],
  "photos": [
    {
      "src": "https://images.unsplash.com/photo-1529218402470-5dec8fea0761?w=800&auto=format&fit=crop&q=80",
      "caption": "Une mise en situation sur écran, avec les équipes pour expliquer les choix et commenter les mouvements de marché."
    },
    {
      "src": "https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?w=800&auto=format&fit=crop&q=80",
      "caption": "Un temps d'échange plus posé pour revenir sur les logiques de marché et la manière dont un desk raisonne au quotidien."
    },
    {
      "src": "https://images.unsplash.com/photo-1608875004752-2fdb6a39ba4c?w=800&auto=format&fit=crop&q=80",
      "caption": "Travail en binôme sur une séquence de trading, puis débrief sur les décisions prises pendant l'exercice."
    },
    {
      "src": "https://images.unsplash.com/photo-1528361237150-8a9a7df33035?w=800&auto=format&fit=crop&q=80",
      "caption": "La fin de session laisse de la place aux questions plus directes et aux échanges informels avec les équipes."
    }
  ],
  "status": "past"
}
```

---

## Ce que tu dois produire

Pour chaque événement qu'on te décrit, génère un **bloc JSON complet**, prêt à coller directement dans `data/events.json`, en respectant toutes les contraintes ci-dessus.

Si des images ne sont pas fournies, utilise des URLs Unsplash plausibles (photos de bureau, salle de conférence, trading floor, networking) et indique qu'elles sont à remplacer.
