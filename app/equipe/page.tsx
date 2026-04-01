import { getTeam } from '@/lib/data'
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline'

export const metadata = {
  title: 'Équipe — CentraleSupélec Finance',
  description: "Les membres de CentraleSupélec Finance, organisés par pôle.",
}

export default function TeamPage() {
  const team = getTeam()

  return (
    <div className="pt-16">
      <RadialOrbitalTimeline poleData={team} />
    </div>
  )
}
