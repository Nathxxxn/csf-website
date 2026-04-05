import { BlurFade } from '@/components/ui/blur-fade'
import { NumberTicker } from '@/components/ui/number-ticker'
import { Separator } from '@/components/ui/separator'
import { getTeam } from '@/lib/data'

export const metadata = {
  title: 'À propos — CentraleSupélec Finance',
  description: "Histoire, mission et valeurs de CentraleSupélec Finance.",
}

const STATS = [
  { value: 6, suffix: '', label: 'Pôles' },
  { value: 200, suffix: '+', label: 'Membres' },
  { value: 30, suffix: '+', label: 'Partenaires' },
  { value: 20, suffix: '+', label: 'Événements / an' },
]

export default async function AboutPage() {
  const team = await getTeam()

  return (
    <div className="pt-24 pb-24 max-w-6xl mx-auto px-6">
      <BlurFade delay={0.1} inView>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
          À propos
        </p>
        <h1 className="text-5xl font-extrabold tracking-tighter mb-8 max-w-2xl">
          L&apos;association finance de référence à CentraleSupélec.
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl text-base mb-12">
          CentraleSupélec Finance rassemble les étudiants passionnés par la finance. Nous organisons des événements de haut niveau avec les meilleures institutions financières, proposons des formations intensives, et construisons un réseau solide entre membres et alumni.
        </p>
      </BlurFade>

      <Separator className="mb-12" />

      <BlurFade delay={0.2} inView>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-extrabold tracking-tighter leading-none mb-2">
                <NumberTicker value={stat.value} />
                <span>{stat.suffix}</span>
              </div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </BlurFade>

      <Separator className="mb-12" />

      <BlurFade delay={0.3} inView>
        <h2 className="text-2xl font-bold tracking-tight mb-8">Nos pôles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((pole, i) => (
            <BlurFade key={pole.pole} delay={0.3 + i * 0.07} inView>
              <div className="rounded-xl border border-border bg-card p-6">
                <span className="text-xs tracking-widest uppercase text-muted-foreground">
                  {pole.badge}
                </span>
                <h3 className="text-lg font-semibold mt-2 mb-3">{pole.pole}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pole.description}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>
      </BlurFade>
    </div>
  )
}
