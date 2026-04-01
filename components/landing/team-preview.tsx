import Link from 'next/link'
import { BlurFade } from '@/components/ui/blur-fade'
import { getTeam } from '@/lib/data'
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline'

export function TeamPreview() {
  const team = getTeam()

  return (
    <section className="py-24 border-t border-border">
      <BlurFade delay={0} inView>
        <div className="flex items-end justify-between mb-4 px-6 max-w-6xl mx-auto">
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

      <div className="h-[700px]">
        <RadialOrbitalTimeline poleData={team} />
      </div>
    </section>
  )
}
