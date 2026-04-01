import Link from 'next/link'
import { DotPattern } from '@/components/ui/dot-pattern'
import { TextAnimate } from '@/components/ui/text-animate'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { BlurFade } from '@/components/ui/blur-fade'
import { cn } from '@/lib/utils'

export function PartnersCta() {
  return (
    <section className="relative py-32 px-6 overflow-hidden border-t border-border">
      <DotPattern
        className={cn(
          'absolute inset-0 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]',
        )}
        cr={1}
        cx={1}
        cy={1}
      />
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <BlurFade delay={0} inView>
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-6">
            Partenariat
          </p>
        </BlurFade>

        <TextAnimate
          animation="blurInUp"
          by="word"
          className="text-4xl sm:text-5xl font-extrabold tracking-tighter leading-tight mb-6"
        >
          Collaborez avec CentraleSupélec Finance.
        </TextAnimate>

        <BlurFade delay={0.4} inView>
          <p className="text-muted-foreground leading-relaxed mb-10 text-base">
            Accédez à un vivier d&apos;étudiants d&apos;excellence en finance. Workshops, sponsoring, conférences — construisons quelque chose ensemble.
          </p>
        </BlurFade>

        <BlurFade delay={0.5} inView>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/contact">
              <ShimmerButton className="px-8 py-3 text-sm font-semibold">
                Nous contacter →
              </ShimmerButton>
            </Link>
            <a
              href="#partenaires"
              className="px-8 py-3 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Voir nos partenaires
            </a>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
