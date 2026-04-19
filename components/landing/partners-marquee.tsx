import { Marquee } from '@/components/ui/marquee'
import { getPartners } from '@/lib/data'
import { BlurFade } from '@/components/ui/blur-fade'

export async function PartnersMarquee() {
  const partners = await getPartners()
  const half = Math.ceil(partners.length / 2)
  const row1 = partners.slice(0, half)
  const row2 = partners.slice(half)

  return (
    <section id="partenaires" className="relative pt-4 pb-20 border-t border-border overflow-hidden">
      <div className="absolute inset-0 bg-[#050505]/55" />
      <div className="relative z-10">
        <BlurFade delay={0} inView>
          <p className="text-center text-xs tracking-widest uppercase text-muted-foreground mb-4">
            Des entreprises avec qui nous avons déjà travaillé
          </p>
        </BlurFade>

        <div className="flex flex-col gap-4">
          <Marquee pauseOnHover className="[--duration:30s]">
            {row1.map(partner => (
              <div
                key={partner.name}
                className="flex items-center justify-center px-8 text-sm font-semibold text-muted-foreground/65 hover:text-muted-foreground transition-colors whitespace-nowrap"
              >
                {partner.name}
              </div>
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:25s]">
            {row2.map(partner => (
              <div
                key={partner.name}
                className="flex items-center justify-center px-8 text-sm font-semibold text-muted-foreground/65 hover:text-muted-foreground transition-colors whitespace-nowrap"
              >
                {partner.name}
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  )
}
