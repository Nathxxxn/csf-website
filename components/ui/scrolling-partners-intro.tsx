'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'

import type { Partner } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ScrollingPartnersIntroProps {
  partners: Partner[]
}

interface OrbitCardProps {
  partner: Partner
  angle: number
  radius: number
  mobile: boolean
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function OrbitCard({ partner, angle, radius, mobile }: OrbitCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const size = mobile ? 72 : 96
  const x = radius * Math.cos(angle)
  const y = radius * Math.sin(angle)

  return (
    <div
      className={cn(
        'absolute z-0 overflow-hidden rounded-2xl border-4 border-white/10 bg-[#111111] shadow-lg transition-transform duration-300 ease-out',
        mobile ? 'rounded-[18px]' : 'rounded-2xl',
      )}
      style={{
        width: size,
        height: size,
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {imageFailed ? (
        <div className="flex h-full w-full items-center justify-center p-3 text-center text-[11px] font-semibold leading-tight text-white/85">
          {partner.name}
        </div>
      ) : (
        <div className="relative h-full w-full bg-[#0d0d0d]">
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
  const sectionRef = useRef<HTMLElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const [localScroll, setLocalScroll] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const update = () => {
      const section = sectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const maxTravel = Math.max(section.offsetHeight - window.innerHeight, 1)
      const current = clamp(-rect.top, 0, maxTravel)
      setLocalScroll(current)
    }

    const handleScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        update()
      })
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      update()
    }

    handleResize()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  const orbitCount = isMobile ? 6 : 8
  const visiblePartners = useMemo(() => {
    if (partners.length === 0) return []
    return Array.from({ length: orbitCount }, (_, index) => partners[index % partners.length])
  }, [orbitCount, partners])

  const animationProgress = clamp(localScroll / (isMobile ? 360 : 500), 0, 1)
  const expandRadius = animationProgress * (isMobile ? 130 : 300)
  const centerOpacity = clamp((localScroll - (isMobile ? 160 : 250)) / (isMobile ? 90 : 120), 0, 1)

  return (
    <section
      ref={sectionRef}
      className="min-h-[170vh] border-b border-border bg-background md:min-h-[200vh]"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-4 md:p-8">
        <div className="relative">
          <div
            className={cn(
              'flex items-center justify-center rounded-full transition-all duration-500',
              localScroll > (isMobile ? 220 : 300) ? 'border-2 border-white/10' : 'border-2 border-transparent',
            )}
            style={{
              width: isMobile ? 320 : 600,
              height: isMobile ? 320 : 600,
            }}
          >
            <div
              className={cn(
                'relative flex items-center justify-center rounded-full transition-all duration-500',
                localScroll > (isMobile ? 90 : 100) ? 'border-2 border-white/16' : 'border-2 border-transparent',
              )}
              style={{
                width: isMobile ? 250 : 500,
                height: isMobile ? 250 : 500,
              }}
            >
              <div
                className="relative flex items-center justify-center rounded-full bg-gradient-to-r from-white/18 via-white/8 to-white/18 p-px"
                style={{
                  width: isMobile ? 190 : 400,
                  height: isMobile ? 190 : 400,
                }}
              >
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-background">
                  {visiblePartners.map((partner, index) => (
                    <OrbitCard
                      key={`${partner.name}-${index}`}
                      partner={partner}
                      angle={(Math.PI / 4) * index}
                      radius={expandRadius}
                      mobile={isMobile}
                    />
                  ))}

                  <div
                    className={cn(
                      'relative z-20 flex flex-col items-center justify-center text-center transition-opacity duration-500',
                      centerOpacity > 0 ? 'opacity-100' : 'opacity-0',
                    )}
                    style={{ opacity: centerOpacity }}
                  >
                    <p className="mb-2 text-[10px] font-semibold tracking-[0.32em] uppercase text-white/48 md:text-xs">
                      Partenaires
                    </p>
                    <h2 className="mb-2 text-3xl font-bold text-white md:text-4xl">
                      Ils nous connaissent déjà.
                    </h2>
                    <p className="max-w-[220px] text-center text-xs leading-relaxed text-white/60 md:max-w-xs md:text-sm">
                      Quelques équipes avec qui nous avons déjà travaillé et avec qui la discussion existe déjà.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
