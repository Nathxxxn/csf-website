import { getEvents, getUpcomingEvents } from "@/lib/data"
import { EventsPageHeader } from "@/components/events/events-page-header"
import { EventsGallery } from "@/components/events/events-gallery"
import { AnimatedList } from "@/components/ui/animated-list"
import { BorderBeam } from "@/components/ui/border-beam"
import { EventRow } from "@/components/shared/event-row"
import { BlurFade } from "@/components/ui/blur-fade"

export const metadata = {
  title: "Événements — CentraleSupélec Finance",
  description: "Tous les événements organisés par CentraleSupélec Finance.",
}

export default function EventsPage() {
  const allEvents = getEvents()
  const upcoming = getUpcomingEvents()

  return (
    <div>
      <EventsPageHeader />

      <EventsGallery events={allEvents.slice(0, 6)} />

      {upcoming.length > 0 && (
        <div className="px-6 max-w-6xl mx-auto pb-24">
          <BlurFade delay={0.1} inView>
            <h2 className="text-2xl font-bold tracking-tighter mb-6">
              À venir
            </h2>
          </BlurFade>
          <div className="relative rounded-xl border border-border bg-card overflow-hidden">
            <BorderBeam size={300} duration={12} />
            <AnimatedList delay={150}>
              {upcoming.map((event, i) => (
                <EventRow key={event.id} event={event} featured={i === 0} />
              ))}
            </AnimatedList>
          </div>
        </div>
      )}
    </div>
  )
}
