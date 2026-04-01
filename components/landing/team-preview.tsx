import Link from 'next/link'
import { BlurFade } from '@/components/ui/blur-fade'
import { PoleSection } from '@/components/shared/pole-section'
import { getTeam } from '@/lib/data'

const MAIN_POLES = ['Bureau', 'Finance de Marché', "Finance d'Entreprise"]
const COMPACT_POLES = ['Formation', 'Alumni', 'Partenariat']

export function TeamPreview() {
  const team = getTeam()
  const mainPoles = team.filter(p => MAIN_POLES.includes(p.pole))
  const compactPoles = team.filter(p => COMPACT_POLES.includes(p.pole))

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <BlurFade delay={0} inView>
        <div className="flex items-end justify-between mb-16">
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

      {mainPoles.map((pole, i) => (
        <PoleSection key={pole.pole} pole={pole} index={i} />
      ))}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        {compactPoles.map((pole, i) => (
          <BlurFade key={pole.pole} delay={(mainPoles.length + i) * 0.1} inView>
            <div className="rounded-xl border border-border bg-card p-6">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">
                {pole.badge}
              </span>
              <h3 className="text-lg font-semibold mt-2 mb-3">{pole.pole}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {pole.description}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {pole.members.slice(0, 3).map(member => (
                  <div key={member.name} className="flex flex-col items-center gap-1">
                    <div className="size-9 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground">
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      {member.name.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
