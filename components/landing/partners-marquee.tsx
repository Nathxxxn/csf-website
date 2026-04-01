import { Marquee } from '@/components/ui/marquee'
import { getPartners } from '@/lib/data'
import { BlurFade } from '@/components/ui/blur-fade'

export function PartnersMarquee() {
  const partners = getPartners()
  const half = Math.ceil(partners.length / 2)
  const row1 = partners.slice(0, half)
  const row2 = partners.slice(half)

  return (
    <section id="partenaires" className="py-20 border-t border-border overflow-hidden">
      <BlurFade delay={0} inView>
        <p className="text-center text-xs tracking-widest uppercase text-muted-foreground mb-10">
          Ils nous font confiance
        </p>
      </BlurFade>

      <div className="flex flex-col gap-4">
        <Marquee pauseOnHover className="[--duration:30s]">
          {row1.map(partner => (
            <div
              key={partner.name}
              className="flex items-center justify-center px-8 text-sm font-semibold text-muted-foreground/40 hover:text-muted-foreground transition-colors whitespace-nowrap"
            >
              {partner.name}
            </div>
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:25s]">
          {row2.map(partner => (
            <div
              key={partner.name}
              className="flex items-center justify-center px-8 text-sm font-semibold text-muted-foreground/40 hover:text-muted-foreground transition-colors whitespace-nowrap"
            >
              {partner.name}
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
