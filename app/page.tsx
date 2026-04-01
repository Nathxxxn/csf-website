import { Hero } from '@/components/landing/hero'
import { Stats } from '@/components/landing/stats'
import { TeamPreview } from '@/components/landing/team-preview'
import { EventsPreview } from '@/components/landing/events-preview'
import { getUpcomingEvents, getPastEvents } from '@/lib/data'

export default function HomePage() {
  const upcoming = getUpcomingEvents()
  const past = getPastEvents()

  return (
    <div>
      <Hero />
      <Stats />
      <TeamPreview />
      <EventsPreview upcoming={upcoming} past={past} />
    </div>
  )
}
