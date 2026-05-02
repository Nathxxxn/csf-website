import { getTeam } from '@/lib/data'
import { TeamSpotlight } from '@/components/ui/team-spotlight'

export const metadata = {
  title: 'Équipe — CentraleSupélec Finance',
  description: "Les membres de CentraleSupélec Finance, organisés par pôle.",
}

export default async function TeamPage() {
  const team = await getTeam()

  return (
    <div className="pt-16">
      <TeamSpotlight poles={team} />
    </div>
  )
}
