'use client'

import Link from 'next/link'
import type { Event } from '@/lib/types'

const MONTHS_FR = ['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC'] as const

function parseDateParts(dateStr: string) {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return { day: '--', month: '---', year: '----' }
  const [, year, month, day] = match
  return { day, month: MONTHS_FR[parseInt(month, 10) - 1], year }
}

interface EventsMagazineProps {
  events: Event[]
}

export function EventsMagazine({ events }: EventsMagazineProps) {
  const today = new Date()

  const sorted = [...events].sort((a, b) => {
    const aDate = new Date(a.date)
    const bDate = new Date(b.date)
    const aUp = aDate >= today
    const bUp = bDate >= today
    if (aUp && !bUp) return -1
    if (!aUp && bUp) return 1
    return aUp
      ? aDate.getTime() - bDate.getTime()
      : bDate.getTime() - aDate.getTime()
  })

  const featured = sorted[0]
  const secondary = sorted.slice(1, 3)

  if (!featured) return null

  const featuredParts = parseDateParts(featured.date)
  const featuredUpcoming = new Date(featured.date) >= today

  return (
    <div className="h-full flex gap-3 px-6 pb-6 md:px-8 md:pb-8 min-h-0">

      {/* ── Featured event ──────────────────────────────────────────── */}
      <Link
        href={`/evenements/${featured.id}`}
        className="relative flex-[3] rounded-xl overflow-hidden group min-h-0 block"
      >
        <div className="absolute inset-0">
          {featured.image ? (
            <img
              src={featured.image}
              alt={featured.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-700">
                Photo événement
              </span>
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/15" />

        {/* Top row */}
        <div className="absolute top-5 left-5 right-5 flex items-start justify-between">
          <div className="flex flex-col items-center bg-black/55 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2.5 min-w-[52px]">
            <span className="text-2xl font-bold leading-none text-white tabular-nums">
              {featuredParts.day}
            </span>
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-400 mt-1">
              {featuredParts.month}
            </span>
            <span className="text-[9px] text-zinc-600">{featuredParts.year}</span>
          </div>
          {featuredUpcoming && (
            <span className="bg-white text-black text-[9px] font-bold uppercase tracking-[0.16em] px-3 py-1.5 rounded-full">
              À venir
            </span>
          )}
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {featured.pole && (
            <span className="inline-block mb-2 text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-400 border border-white/15 rounded-full px-2.5 py-1">
              {featured.pole}
            </span>
          )}
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight mb-2 group-hover:underline underline-offset-4 decoration-white/30">
            {featured.title}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-2">
            {featured.description}
          </p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">
            {featured.partner}
          </p>
        </div>
      </Link>

      {/* ── Secondary events ────────────────────────────────────────── */}
      <div className="flex-[2] flex flex-col gap-3 min-h-0">
        {secondary.map((event) => {
          const parts = parseDateParts(event.date)
          const isUpcoming = new Date(event.date) >= today
          return (
            <Link
              key={event.id}
              href={`/evenements/${event.id}`}
              className="relative flex-1 rounded-xl overflow-hidden group min-h-0 block"
            >
              <div className="absolute inset-0">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    style={{ opacity: isUpcoming ? 1 : 0.55 }}
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900" />
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* Date pill */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/55 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1.5">
                <span className="text-sm font-bold leading-none text-white tabular-nums">
                  {parts.day}
                </span>
                <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                  {parts.month} {parts.year}
                </span>
              </div>

              {!isUpcoming && (
                <div className="absolute top-4 right-4">
                  <span className="text-[8px] font-medium uppercase tracking-[0.14em] text-zinc-600 border border-white/8 rounded-full px-2 py-1">
                    Passé
                  </span>
                </div>
              )}

              {/* Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {event.pole && (
                  <span className="block mb-1 text-[8px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                    {event.pole}
                  </span>
                )}
                <h4 className="text-sm font-semibold tracking-tight text-white leading-tight line-clamp-2 group-hover:underline underline-offset-4 decoration-white/30">
                  {event.title}
                </h4>
                <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-zinc-600">
                  {event.partner}
                </p>
              </div>
            </Link>
          )
        })}

        {secondary.length < 2 && (
          <div className="flex-1 rounded-xl border border-white/5 bg-zinc-950/60 flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest text-zinc-800">Bientôt</span>
          </div>
        )}
      </div>
    </div>
  )
}
