import { NumberTicker } from '@/components/ui/number-ticker'
import { BlurFade } from '@/components/ui/blur-fade'

const STATS = [
  { value: 6, suffix: '', label: 'Pôles' },
  { value: 200, suffix: '+', label: 'Membres' },
  { value: 30, suffix: '+', label: 'Partenaires' },
  { value: 20, suffix: '+', label: 'Événements / an' },
]

export function Stats() {
  return (
    <section className="border-y border-border">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
        {STATS.map((stat, i) => (
          <BlurFade key={stat.label} delay={i * 0.1} inView>
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tighter leading-none">
                <NumberTicker value={stat.value} />
                <span>{stat.suffix}</span>
              </div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mt-3">
                {stat.label}
              </p>
            </div>
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
