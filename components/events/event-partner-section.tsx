import type { Event } from "@/lib/types"

interface EventPartnerSectionProps {
  event: Event
}

export function EventPartnerSection({ event }: EventPartnerSectionProps) {
  return (
    <section className="px-6 max-w-3xl mx-auto pt-20 pb-0">
      <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
        Partenaire
      </p>
      <h2 className="text-2xl font-bold tracking-tighter mb-4">{event.partner}</h2>
      <p className="text-muted-foreground leading-relaxed">{event.partnerDescription}</p>
    </section>
  )
}
