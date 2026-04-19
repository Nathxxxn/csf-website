import { PartnersMarquee } from '@/components/landing/partners-marquee'
import { PartnersCta } from '@/components/landing/partners-cta'
import { getUpcomingEvents, getPastEvents, getTeam } from '@/lib/data'
import { MarketWaveBackground } from '@/components/ui/market-wave-background'
import { CinematicHeroSection } from '@/components/landing/cinematic-hero-section'
import { type TeamMember } from '@/components/ui/team-showcase'

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}

export default async function HomePage() {
  const [upcoming, past, poles] = await Promise.all([
    getUpcomingEvents(),
    getPastEvents(),
    getTeam(),
  ])

  const allMembers: TeamMember[] = poles
    .flatMap((p) => p.members)
    .filter((m) => m.photo !== null)
    .map((m, i) => ({
      id: String(i),
      name: m.name,
      role: m.role,
      image: m.photo!,
      social: m.linkedin ? { linkedin: m.linkedin } : undefined,
    }))

  const teamMembers = pickRandom(allMembers, 6)

  const allEvents = [...upcoming, ...past]

  return (
    <>
      <MarketWaveBackground />
      <CinematicHeroSection members={teamMembers} events={allEvents} />
      <PartnersMarquee />
      <PartnersCta />
    </>
  )
}
