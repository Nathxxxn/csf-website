import { getEvents, getSiteContent } from "@/lib/data"
import { EventsPageHeader } from "@/components/events/events-page-header"
import { EventsGallery } from "@/components/events/events-gallery"
import { PartnershipCTA } from "@/components/shared/partnership-cta"

export const metadata = {
  title: "Événements — CentraleSupélec Finance",
  description: "Tous les événements organisés par CentraleSupélec Finance.",
}

export default async function EventsPage() {
  const [allEvents, content] = await Promise.all([getEvents(), getSiteContent()])

  return (
    <div>
      <EventsPageHeader content={content} />

      <EventsGallery events={allEvents} />

      <PartnershipCTA />
    </div>
  )
}
