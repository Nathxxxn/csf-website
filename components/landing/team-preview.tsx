import Link from 'next/link'
import { BlurFade } from '@/components/ui/blur-fade'
import { getTeam } from '@/lib/data'
import { TeamScrollPreview, type TeamMember } from '@/components/ui/team-section'

// Placeholder Unsplash portrait photos (used when a member has no photo set)
const PLACEHOLDER_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=60',
]

export function TeamPreview() {
  const poles = getTeam()

  // Flatten all poles into a single list and assign placeholder images
  const members: TeamMember[] = poles
    .flatMap(pole => pole.members)
    .map((member, index) => ({
      avatar: member.photo ?? PLACEHOLDER_AVATARS[index % PLACEHOLDER_AVATARS.length],
      name: member.name,
      role: member.role,
    }))

  return (
    <section className="pt-12 border-t border-border">
      <BlurFade delay={0} inView>
        <div className="flex items-end justify-between mb-2 px-6 max-w-6xl mx-auto">
          <div>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
              Organisation
            </p>
            <h2 className="text-4xl font-bold tracking-tight">Notre équipe</h2>
          </div>
          <Link
            href="/equipe"
            className="text-sm text-muted-foreground border-b border-muted-foreground/30 pb-0.5 hover:text-foreground transition-colors hidden sm:block"
          >
            Voir tous les membres →
          </Link>
        </div>
      </BlurFade>

      <TeamScrollPreview members={members} />
    </section>
  )
}
