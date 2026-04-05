'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import type { Partner } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ScrollingPartnersIntroProps {
  partners: Partner[]
}

interface PartnerCardProps {
  partner: Partner
  x: number
  y: number
  mobile: boolean
  delay: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function PartnerCard({ partner, x, y, mobile, delay }: PartnerCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const cardSize = mobile ? 72 : 96

  return (
    <div
      className={cn(
        'absolute left-1/2 top-1/2 overflow-hidden rounded-[22px] border border-white/12 bg-zinc-950/88 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm',
        mobile ? 'rounded-[18px]' : 'rounded-[22px]',
      )}
      style={{
        width: cardSize,
        height: cardSize,
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
        transition: `transform 420ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {imageFailed ? (
        <div className="flex h-full w-full items-center justify-center p-3 text-center text-[11px] font-semibold leading-tight text-white/88">
          {partner.name}
        </div>
      ) : (
        <div className="relative h-full w-full p-3">
          <Image
            src={partner.logo}
            alt={`Logo ${partner.name}`}
            fill
            className="object-contain p-3"
            sizes={mobile ? '72px' : '96px'}
            onError={() => setImageFailed(true)}
          />
        </div>
      )}
    </div>
  )
}

export function ScrollingPartnersIntro({ partners }: ScrollingPartnersIntroProps) {
  const [scrollY, setScrollY] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 768)
    const handleScroll = () => setScrollY(window.scrollY)

    updateViewport()
    handleScroll()

    window.addEventListener('resize', updateViewport)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('resize', updateViewport)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const visiblePartners = partners.slice(0, isMobile ? 6 : 8)
  const progress = clamp(scrollY / (isMobile ? 380 : 560), 0, 1)
  const maxRadius = isMobile ? 118 : 224
  const radius = maxRadius * progress
  const copyOpacity = clamp((progress - 0.32) / 0.4, 0, 1)
  const ringOpacity = 0.18 + progress * 0.45

  return (
    <section className="relative h-[165svh] min-h-[980px] overflow-clip border-b border-border bg-background md:h-[190vh]">
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden px-4 md:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_52%)]"
        />

        <div className="relative flex h-[620px] w-full max-w-5xl items-center justify-center md:h-[760px]">
          <div
            aria-hidden="true"
            className="absolute rounded-full border border-white/10"
            style={{
              width: isMobile ? 280 : 520,
              height: isMobile ? 280 : 520,
              opacity: ringOpacity * 0.65,
            }}
          />
          <div
            aria-hidden="true"
            className="absolute rounded-full border"
            style={{
              width: isMobile ? 210 : 400,
              height: isMobile ? 210 : 400,
              borderColor: `rgba(255,255,255,${ringOpacity})`,
            }}
          />
          <div
            aria-hidden="true"
            className="absolute rounded-full border border-white/8"
            style={{
              width: isMobile ? 150 : 270,
              height: isMobile ? 150 : 270,
              opacity: 0.35 + progress * 0.25,
            }}
          />

          {visiblePartners.map((partner, index) => {
            const angle = (Math.PI * 2 * index) / visiblePartners.length - Math.PI / 2
            const x = radius * Math.cos(angle)
            const y = radius * Math.sin(angle)

            return (
              <PartnerCard
                key={partner.name}
                partner={partner}
                x={x}
                y={y}
                mobile={isMobile}
                delay={index * 18}
              />
            )
          })}

          <div className="relative z-20 flex h-[160px] w-[160px] flex-col items-center justify-center rounded-full border border-white/12 bg-zinc-950/88 px-6 text-center shadow-[0_0_80px_rgba(255,255,255,0.03)] backdrop-blur md:h-[220px] md:w-[220px] md:px-10">
            <p className="text-[10px] font-semibold tracking-[0.32em] uppercase text-white/52 md:text-xs">
              Partenaires
            </p>
            <div
              className="mt-3 space-y-2 transition-opacity duration-500"
              style={{ opacity: copyOpacity }}
            >
              <h2 className="text-xl font-extrabold leading-tight tracking-tight text-white md:text-4xl">
                Ils nous connaissent deja.
              </h2>
              <p className="mx-auto max-w-[180px] text-xs leading-relaxed text-white/62 md:max-w-[220px] md:text-sm">
                Quelques equipes avec qui nous avons deja travaille, avant meme que la discussion commence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
