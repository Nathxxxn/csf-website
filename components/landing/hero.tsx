import { DotPattern } from '@/components/ui/dot-pattern'
import { TextAnimate } from '@/components/ui/text-animate'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { BlurFade } from '@/components/ui/blur-fade'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden pt-16">
      <DotPattern
        className={cn(
          'absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]',
        )}
        cr={1}
        cx={1}
        cy={1}
      />

      <div className="relative z-10 flex flex-col items-center px-6 max-w-4xl mx-auto">
        <BlurFade delay={0.2} inView>
          <div className="mb-8 rounded-full border border-border px-4 py-1.5">
            <AnimatedShinyText className="text-xs tracking-widest uppercase text-muted-foreground">
              Association · CentraleSupélec · 2024–2025
            </AnimatedShinyText>
          </div>
        </BlurFade>

        <TextAnimate
          animation="blurInUp"
          by="word"
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-none mb-6"
        >
          Shaping the future of Finance.
        </TextAnimate>

        <BlurFade delay={0.6} inView>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-10">
            L&apos;association finance de référence à CentraleSupélec. Événements exclusifs, formations intensives, réseau industrie.
          </p>
        </BlurFade>

        <BlurFade delay={0.75} inView>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Link href="/evenements">
              <ShimmerButton className="px-8 py-3 text-sm font-semibold">
                Découvrir nos événements →
              </ShimmerButton>
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Devenir partenaire
            </Link>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
