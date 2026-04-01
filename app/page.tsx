import { Hero } from '@/components/landing/hero'
import { Stats } from '@/components/landing/stats'
import { TeamPreview } from '@/components/landing/team-preview'

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Stats />
      <TeamPreview />
    </div>
  )
}
