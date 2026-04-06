'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'

interface ScrollExpansionHeroProps {
  mediaSrc: string
  bgImageSrc: string
  title?: string
  date?: string
  scrollToExpand?: string
  children?: ReactNode
}

export function ScrollExpansionHero({
  mediaSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand = 'Défiler pour découvrir',
  children,
}: ScrollExpansionHeroProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showContent, setShowContent] = useState(false)
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const touchStartY = useRef<number | null>(null)

  // Skip animation entirely when user prefers reduced motion
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setScrollProgress(1)
      setMediaFullyExpanded(true)
      setShowContent(true)
    }
  }, [])

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0)
    }
  }, [])

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768)
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  useEffect(() => {
    const handleWheel = (e: Event) => {
      const we = e as globalThis.WheelEvent
      if (mediaFullyExpanded && we.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false)
        we.preventDefault()
      } else if (!mediaFullyExpanded) {
        we.preventDefault()
        setScrollProgress((prev) => {
          const next = Math.min(Math.max(prev + we.deltaY * 0.0009, 0), 1)
          if (next >= 1) {
            setMediaFullyExpanded(true)
            setShowContent(true)
          } else if (next < 0.75) {
            setShowContent(false)
          }
          return next
        })
      }
    }

    const handleTouchStart = (e: Event) => {
      touchStartY.current = (e as TouchEvent).touches[0].clientY
    }

    const handleTouchMove = (e: Event) => {
      const te = e as TouchEvent
      if (touchStartY.current === null) return
      const deltaY = touchStartY.current - te.touches[0].clientY
      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false)
        te.preventDefault()
      } else if (!mediaFullyExpanded) {
        te.preventDefault()
        const factor = deltaY < 0 ? 0.008 : 0.005
        setScrollProgress((prev) => {
          const next = Math.min(Math.max(prev + deltaY * factor, 0), 1)
          if (next >= 1) {
            setMediaFullyExpanded(true)
            setShowContent(true)
          } else if (next < 0.75) {
            setShowContent(false)
          }
          return next
        })
        touchStartY.current = te.touches[0].clientY
      }
    }

    const handleTouchEnd = () => {
      touchStartY.current = null
    }

    const handleScroll = () => {
      if (!mediaFullyExpanded) window.scrollTo(0, 0)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [mediaFullyExpanded])

  const mediaWidth = 300 + scrollProgress * (isMobile ? 650 : 1250)
  const mediaHeight = 400 + scrollProgress * (isMobile ? 200 : 400)
  const textTranslateX = scrollProgress * (isMobile ? 180 : 150)

  const firstWord = title?.split(' ')[0] ?? ''
  const restOfTitle = title?.split(' ').slice(1).join(' ') ?? ''

  return (
    <div className="overflow-x-hidden">
      <section className="relative flex flex-col items-center justify-start min-h-[100dvh]">
        <div className="relative w-full flex flex-col items-center min-h-[100dvh]">
          {/* Fading background image */}
          <motion.div
            className="absolute inset-0 z-0 h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            <Image
              src={bgImageSrc}
              alt=""
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>

          <div className="container mx-auto flex flex-col items-center justify-start relative z-10">
            <div className="flex flex-col items-center justify-center w-full h-[100dvh] relative">
              {/* Expanding image */}
              <div
                className="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden"
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: '95vw',
                  maxHeight: '85vh',
                  boxShadow: '0px 0px 50px rgba(0, 0, 0, 0.4)',
                }}
              >
                <Image
                  src={mediaSrc}
                  alt={title ?? ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 95vw, 1250px"
                  priority
                />
                <motion.div
                  className="absolute inset-0 bg-black/50"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 0.7 - scrollProgress * 0.4 }}
                  transition={{ duration: 0.2 }}
                />
              </div>

              {/* Date sliding left + hint sliding right */}
              <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10">
                {date && (
                  <p
                    className="text-sm text-white/60 tabular-nums"
                    style={{ transform: `translateX(-${textTranslateX}vw)` }}
                  >
                    {date}
                  </p>
                )}
                {!mediaFullyExpanded && (
                  <p
                    className="text-white/40 text-xs font-medium"
                    style={{ transform: `translateX(${textTranslateX}vw)` }}
                  >
                    {scrollToExpand}
                  </p>
                )}
              </div>

              {/* Title — first word slides left, rest slides right */}
              <div className="flex items-center justify-center text-center gap-3 w-full relative z-10 flex-col pointer-events-none select-none">
                <span
                  className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white"
                  style={{ transform: `translateX(-${textTranslateX}vw)` }}
                >
                  {firstWord}
                </span>
                <span
                  className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white"
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                >
                  {restOfTitle}
                </span>
              </div>
            </div>

            {/* Content shown after full expansion */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
