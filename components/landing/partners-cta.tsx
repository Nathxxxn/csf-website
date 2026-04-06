'use client'

import { useRouter } from 'next/navigation'
import { DotPattern } from '@/components/ui/dot-pattern'
import { TextAnimate } from '@/components/ui/text-animate'
import { FlowButton } from '@/components/ui/flow-button'
import { LiquidButton } from '@/components/ui/liquid-glass-button'
import { BlurFade } from '@/components/ui/blur-fade'
import { cn } from '@/lib/utils'

export function PartnersCta() {
  const router = useRouter()

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
          Monter un événement avec CS Finance.
        </TextAnimate>

        <BlurFade delay={0.4} inView>
          <p className="text-muted-foreground leading-relaxed mb-10 text-base">
            Vous voulez organiser une conférence, un workshop ou une rencontre avec nos membres ? On prépare des formats simples, sérieux et utiles pour tout le monde.
          </p>
        </BlurFade>

        <BlurFade delay={0.5} inView>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <FlowButton
              text="En discuter"
              onClick={() => router.push('/contact')}
              className="h-[46px] w-[13.5rem] justify-center"
            />
            <LiquidButton
              className="h-[46px] w-[13.5rem] rounded-full px-8 py-3 text-sm font-semibold text-white"
              onClick={() => router.push('/#partenaires')}
            >
              Voir les partenaires
            </LiquidButton>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
