import type { Event } from "@/lib/types"

interface EventHighlightsSectionProps {
  event: Event
}

export function EventHighlightsSection({ event }: EventHighlightsSectionProps) {
  const highlights = event.highlights ?? []
  if (highlights.length === 0) return null
  const title = event.status === 'upcoming' ? 'Au programme' : "Ce qu'on a fait"

  return (
    <section className="px-6 max-w-5xl mx-auto pt-16 pb-0">
      <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
        Programme
      </p>
      <h2 className="text-2xl font-bold tracking-tighter mb-8">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {highlights.map((highlight) => (
          <div
            key={highlight.title}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold mb-2 text-sm">{highlight.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {highlight.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
