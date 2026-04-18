import { getTeam } from '@/lib/data'
import { type TeamMember } from '@/components/ui/team-showcase'
import { TeamScrollCard } from '@/components/landing/team-scroll-card'


function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}

export async function TeamPreview() {
  const poles = await getTeam()

  const allMembers: TeamMember[] = poles
    .flatMap((pole) => pole.members)
    .filter((member) => member.photo !== null)
    .map((member, index) => ({
      id: String(index),
      name: member.name,
      role: member.role,
      image: member.photo!,
      social: member.linkedin ? { linkedin: member.linkedin } : undefined,
    }))

  const displayed = pickRandom(allMembers, 6)

  return <TeamScrollCard members={displayed} />
}
