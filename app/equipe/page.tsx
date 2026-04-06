import { getTeam } from '@/lib/data'
import { TeamPolesSection } from '@/components/ui/team-pole-section'

export const metadata = {
  title: 'Équipe — CentraleSupélec Finance',
  description: "Les membres de CentraleSupélec Finance, organisés par pôle.",
}

export default async function TeamPage() {
  const team = await getTeam()

  return (
    <div className="pt-16">
      <TeamPolesSection poles={team} />
    </div>
  )
}
