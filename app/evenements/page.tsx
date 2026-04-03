import { getEvents } from "@/lib/data"
import { EventsPageHeader } from "@/components/events/events-page-header"
import { EventsGallery } from "@/components/events/events-gallery"
import { BlurFade } from "@/components/ui/blur-fade"
import Link from "next/link"

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

      <div className="mt-24 px-6 max-w-3xl mx-auto pb-32 text-center">
        <BlurFade delay={0.1} inView>
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
            Partenariats
          </p>
          <h2 className="text-3xl font-bold tracking-tighter mb-4">
            Vous souhaitez collaborer avec nous&nbsp;?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Nous sommes toujours à la recherche de nouvelles entreprises partenaires
            pour organiser des événements à forte valeur ajoutée pour nos membres.
            Conférences, workshops, visites de desk&nbsp;— parlons-en.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-white text-black text-sm font-semibold px-6 py-3 transition-opacity hover:opacity-80"
          >
            Nous contacter
          </Link>
        </BlurFade>
      </div>
    </div>
  )
}
