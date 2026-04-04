import { getEvents } from "@/lib/data"
import { EventsPageHeader } from "@/components/events/events-page-header"
import { EventsGallery } from "@/components/events/events-gallery"
import { PartnershipCTA } from "@/components/shared/partnership-cta"

export const metadata = {
  title: "Événements — CentraleSupélec Finance",
  description: "Tous les événements organisés par CentraleSupélec Finance.",
}

export default function EventsPage() {
  const allEvents = getEvents()

  return (
    <div>
      <EventsPageHeader />

      <EventsGallery events={allEvents} />

      <PartnershipCTA />
    </div>
  )
}
