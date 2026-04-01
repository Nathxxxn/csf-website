import { Hero } from '@/components/landing/hero'
import { Stats } from '@/components/landing/stats'
import { TeamPreview } from '@/components/landing/team-preview'
import { EventsPreview } from '@/components/landing/events-preview'
import { PartnersMarquee } from '@/components/landing/partners-marquee'
import { PartnersCta } from '@/components/landing/partners-cta'
import { getUpcomingEvents, getPastEvents } from '@/lib/data'

export default function HomePage() {
  const upcoming = getUpcomingEvents().slice(0, 3)
  const past = getPastEvents().slice(0, 3)

  return (
    <>
      <Hero />
      <Stats />
      <TeamPreview />
      <EventsPreview upcoming={upcoming} past={past} />
      <PartnersMarquee />
      <PartnersCta />
    </>
  )
}
