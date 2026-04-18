import { Hero } from '@/components/landing/hero'
import { Stats } from '@/components/landing/stats'
import { TeamPreview } from '@/components/landing/team-preview'
import { EventsPreview } from '@/components/landing/events-preview'
import { PartnersMarquee } from '@/components/landing/partners-marquee'
import { PartnersCta } from '@/components/landing/partners-cta'
import { getUpcomingEvents, getPastEvents } from '@/lib/data'
import { MarketWaveBackground } from '@/components/ui/market-wave-background'

export default async function HomePage() {
  const upcoming = (await getUpcomingEvents()).slice(0, 3)
  const past = (await getPastEvents()).slice(0, 3)

  return (
    <>
      <MarketWaveBackground />
      <Hero />
      <Stats />
      <TeamPreview />
      <EventsPreview upcoming={upcoming} past={past} />
      <PartnersMarquee />
      <PartnersCta />
    </>
  )
}
