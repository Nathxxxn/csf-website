'use client'

import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import type { Formation } from '@/lib/types'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS = [
  'bg-[#4ade80]',
  'bg-[#fbbf24]',
  'bg-[#a78bfa]',
  'bg-[#60a5fa]',
  'bg-[#f87171]',
  'bg-[#2dd4bf]',
]

function normalizeCategory(category: string) {
  return category
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function getSchoolYear(date: string) {
  const parsed = new Date(`${date}T00:00:00`)
  const year = parsed.getFullYear()
  const month = parsed.getMonth()
  const start = month >= 8 ? year : year - 1
  const end = start + 1
  return {
    key: `${start}-${end}`,
    label: `${start} — ${String(end).slice(2)}`,
    meta: month >= 8 && year === new Date().getFullYear() ? 'Promo en cours' : 'Archives',
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function formatReference(index: number) {
  return `F-${String(index + 1).padStart(3, '0')}`
}

export function FormationsArchive({ formations }: { formations: Formation[] }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = useMemo(() => {
    const map = new Map<string, { label: string; key: string; count: number; color: string }>()
    formations.forEach((formation) => {
      const key = normalizeCategory(formation.category)
      const existing = map.get(key)
      if (existing) {
        existing.count += 1
      } else {
        map.set(key, {
          key,
          label: formation.category,
          count: 1,
          color: CATEGORY_COLORS[map.size % CATEGORY_COLORS.length],
        })
      }
    })
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'fr'))
  }, [formations])

  const categoryColorByKey = useMemo(() => {
    return new Map(categories.map((category) => [category.key, category.color]))
  }, [categories])

  const visibleFormations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return formations.filter((formation) => {
      const categoryKey = normalizeCategory(formation.category)
      const matchesCategory = activeCategory === 'all' || categoryKey === activeCategory
      const haystack = [
        formation.title,
        formation.category,
        formation.description,
        formation.speakerName,
        formation.speakerRole,
        formation.supportFilename ?? '',
      ].join(' ').toLowerCase()
      return matchesCategory && (!query || haystack.includes(query))
    })
  }, [activeCategory, formations, searchQuery])

  const yearGroups = useMemo(() => {
    const groups = new Map<string, { label: string; meta: string; formations: Formation[] }>()
    visibleFormations.forEach((formation) => {
      const year = getSchoolYear(formation.date)
      const group = groups.get(year.key) ?? { label: year.label, meta: year.meta, formations: [] }
      group.formations.push(formation)
      groups.set(year.key, group)
    })
    return Array.from(groups.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([, group]) => group)
  }, [visibleFormations])

  const distributionTotal = formations.length || 1

  return (
    <div className="bg-[#060606] text-white">
      <section className="mx-auto max-w-7xl px-6 pb-14 pt-32 sm:px-10 lg:px-12">
        <div className="mb-14 flex flex-col gap-4 border-b border-white/10 pb-5 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-6 items-center justify-center rounded-full border border-white/15 text-[0.62rem] text-white">
              01
            </span>
            Bibliothèque · Formations
          </div>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[#4ade80]" />
            Archive publique
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.75fr)] lg:items-end">
          <div>
            <p className="font-serif text-[clamp(8rem,18vw,14rem)] leading-[0.82] tracking-tight">
              {String(formations.length).padStart(3, '0')}
            </p>
            <p className="mt-5 text-xs font-medium uppercase tracking-[0.22em] text-white/55">
              <span className="text-white">Supports</span> · archive CSF
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <h1 className="max-w-xl font-serif text-[clamp(2rem,4vw,3.2rem)] leading-tight">
              Toutes les formations CSF, <em className="text-white/55">sourcées et téléchargeables</em>.
            </h1>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-[0.68rem] font-medium uppercase tracking-[0.22em] text-white/55">
                <span>Répartition par catégorie</span>
                <span className="font-serif text-lg normal-case tracking-normal text-white">{formations.length} au total</span>
              </div>
              <div className="flex h-1.5 overflow-hidden rounded-full bg-white/10">
                {categories.map((category) => (
                  <span
                    key={category.key}
                    className={category.color}
                    style={{ width: `${(category.count / distributionTotal) * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/55">
                {categories.map((category) => (
                  <span key={category.key} className="inline-flex items-center gap-2">
                    <span className={cn('size-1.5 rounded-full', category.color)} />
                    {category.label} <span className="font-medium text-white">{category.count}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-7 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <label className="relative min-w-0 flex-1 lg:max-w-sm">
            <span className="sr-only">Rechercher</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Rechercher une formation, un intervenant..."
              aria-label="Rechercher"
              className="w-full rounded-full border border-white/15 bg-transparent py-2.5 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={cn(
                'rounded-full border px-4 py-2 text-xs font-medium transition-colors',
                activeCategory === 'all' ? 'border-white bg-white text-black' : 'border-white/15 text-white/55 hover:text-white',
              )}
            >
              Tous <span>{formations.length}</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() => setActiveCategory(category.key)}
                className={cn(
                  'rounded-full border px-4 py-2 text-xs font-medium transition-colors',
                  activeCategory === category.key ? 'border-white bg-white text-black' : 'border-white/15 text-white/55 hover:text-white',
                )}
              >
                {category.label} <span>{category.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12">
        {yearGroups.map((group) => (
          <section key={group.label} className="mb-20 last:mb-0">
            <div className="mb-7 flex items-baseline justify-between gap-6 border-b border-white/10 pb-5">
              <h2 className="font-serif text-[clamp(3rem,7vw,5.5rem)] leading-none tracking-tight">{group.label}</h2>
              <p className="text-right text-[0.68rem] font-medium uppercase tracking-[0.22em] text-white/55">
                {group.meta} <span className="ml-2 font-serif text-2xl normal-case tracking-normal text-white">{group.formations.length}</span>
              </p>
            </div>
            <div className="flex flex-col">
              {group.formations.map((formation) => {
                const originalIndex = formations.findIndex((item) => item.id === formation.id)
                const categoryKey = normalizeCategory(formation.category)
                const color = categoryColorByKey.get(categoryKey) ?? CATEGORY_COLORS[0]

                return (
                  <article
                    key={formation.id}
                    className="grid gap-3 border-b border-white/10 px-2 py-5 transition-colors hover:bg-white/[0.025] md:grid-cols-[5rem_9rem_minmax(0,1fr)_12rem_11rem_3.5rem] md:items-center md:gap-8"
                  >
                    <div className="hidden font-mono text-xs tracking-wide text-white/35 md:block">{formatReference(originalIndex)}</div>
                    <div className="font-mono text-xs text-white/55">{formatDate(formation.date)}</div>
                    <div className="min-w-0">
                      <h3 className="font-serif text-2xl leading-tight tracking-tight">{formation.title}</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{formation.description}</p>
                    </div>
                    <div className="hidden items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-white/55 md:flex">
                      <span className={cn('size-1.5 rounded-full', color)} />
                      {formation.category}
                    </div>
                    <div className="hidden flex-col gap-1 md:flex">
                      <span className="truncate text-sm text-white">{formation.speakerName}</span>
                      <span className="truncate font-mono text-xs text-white/45">{formation.speakerRole}</span>
                    </div>
                    {formation.supportUrl ? (
                      <a
                        href={formation.supportUrl}
                        download={formation.supportFilename ?? undefined}
                        aria-label={`Télécharger ${formation.title}`}
                        className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-white/55 transition-colors hover:border-white hover:bg-white hover:text-black"
                      >
                        <Download className="size-4" />
                      </a>
                    ) : (
                      <span
                        aria-label={`Support indisponible pour ${formation.title}`}
                        className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 text-white/20"
                      >
                        <Download className="size-4" />
                      </span>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        ))}

        {visibleFormations.length === 0 && (
          <div className="py-20 text-center">
            <div className="mb-4 font-serif text-6xl text-white/25">∅</div>
            <h2 className="font-serif text-3xl">Aucun résultat.</h2>
            <p className="mt-2 text-sm text-white/55">Essayez un autre mot-clé ou retirez les filtres.</p>
          </div>
        )}
      </main>
    </div>
  )
}
