import { BlurFade } from '@/components/ui/blur-fade'
import { PoleSection } from '@/components/shared/pole-section'
import { AvatarCircles } from '@/components/ui/avatar-circles'
import { getTeam } from '@/lib/data'

export const metadata = {
  title: 'Équipe — CentraleSupélec Finance',
  description: "Les membres de CentraleSupélec Finance, organisés par pôle.",
}

export default function TeamPage() {
  const team = getTeam()
  const allMembers = team.flatMap(p => p.members)
  const allAvatars = allMembers
    .filter(m => m.photo !== null)
    .map(m => ({
      imageUrl: m.photo as string,
      profileUrl: m.linkedin ?? '#',
    }))

  return (
    <div className="pt-24 pb-24 px-6 max-w-6xl mx-auto">
      <BlurFade delay={0.1} inView>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
          Organisation
        </p>
        <h1 className="text-5xl font-extrabold tracking-tighter mb-4">Notre équipe</h1>
        <div className="flex items-center gap-4 mb-12">
          <AvatarCircles
            numPeople={allMembers.length - allAvatars.slice(0, 6).length}
            avatarUrls={allAvatars.slice(0, 6)}
          />
          <p className="text-sm text-muted-foreground">
            {allMembers.length} membres · 6 pôles
          </p>
        </div>
      </BlurFade>

      <div>
        {team.map((pole, i) => (
          <PoleSection key={pole.pole} pole={pole} index={i} />
        ))}
      </div>
    </div>
  )
}
