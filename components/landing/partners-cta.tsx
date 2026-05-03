'use client'

import { useRouter } from 'next/navigation'
import { TextAnimate } from '@/components/ui/text-animate'
import { FlowButton } from '@/components/ui/flow-button'
import { LiquidButton } from '@/components/ui/liquid-glass-button'
import { BlurFade } from '@/components/ui/blur-fade'
import type { SiteContent } from '@/lib/types'

const DEFAULT_CONTENT = {
  eyebrow: 'Partenariat',
  title: 'Monter un événement avec CS Finance.',
  body: 'Vous voulez organiser une conférence, un workshop ou une rencontre avec nos membres ? On prépare des formats simples, sérieux et utiles pour tout le monde.',
  primaryLabel: 'En discuter',
  secondaryLabel: 'Voir les partenaires',
}

export function PartnersCta({ content }: { content?: SiteContent }) {
  const router = useRouter()
  const eyebrow = content?.partners_cta_eyebrow || DEFAULT_CONTENT.eyebrow
  const title = content?.partners_cta_title || DEFAULT_CONTENT.title
  const body = content?.partners_cta_body || DEFAULT_CONTENT.body
  const primaryLabel = content?.partners_cta_primary_label || DEFAULT_CONTENT.primaryLabel
  const secondaryLabel = content?.partners_cta_secondary_label || DEFAULT_CONTENT.secondaryLabel

  return (
    <section data-testid="partners-cta" className="relative z-20 pt-32 pb-20 px-6 border-t border-border bg-[#050505]">
      <div className="max-w-2xl mx-auto text-center">
        <BlurFade delay={0} inView>
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-6">
            {eyebrow}
          </p>
        </BlurFade>

        <TextAnimate
          animation="blurInUp"
          by="word"
          className="text-4xl sm:text-5xl font-extrabold tracking-tighter leading-tight mb-6"
        >
          {title}
        </TextAnimate>

        <BlurFade delay={0.4} inView>
          <p className="text-muted-foreground leading-relaxed mb-10 text-base">
            {body}
          </p>
        </BlurFade>

        <BlurFade delay={0.5} inView>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <FlowButton
              text={primaryLabel}
              onClick={() => router.push('/contact')}
              className="h-[46px] w-[13.5rem] justify-center"
            />
            <LiquidButton
              className="h-[46px] w-[13.5rem] rounded-full px-8 py-3 text-sm font-semibold text-white"
              onClick={() => router.push('/#partenaires')}
            >
              {secondaryLabel}
            </LiquidButton>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
