import { getEvents, getEventById } from "@/lib/data"
import { notFound } from "next/navigation"
import { ScrollExpansionHero } from "@/components/ui/scroll-expansion-hero"
import { EventPartnerSection } from "@/components/events/event-partner-section"
import { EventHighlightsSection } from "@/components/events/event-highlights-section"
import { EventPhotosSection } from "@/components/events/event-photos-section"
import { PartnershipCTA } from "@/components/shared/partnership-cta"

export async function generateStaticParams() {
  return getEvents().map((e) => ({ id: e.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = getEventById(id)
  if (!event) return {}
  return {
    title: `${event.title} — CentraleSupélec Finance`,
    description: event.description,
  }
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = getEventById(id)
  if (!event) notFound()

  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(event.date))

  const mediaSrc = event.image ?? event.images[0]

  return (
    <ScrollExpansionHero
      key={event.id}
      mediaSrc={mediaSrc}
      bgImageSrc={mediaSrc}
      title={event.title}
      date={formattedDate}
    >
      <EventPartnerSection event={event} />
      <EventHighlightsSection event={event} />
      <EventPhotosSection event={event} />
      <PartnershipCTA />
    </ScrollExpansionHero>
  )
}
