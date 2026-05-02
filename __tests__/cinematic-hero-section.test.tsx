import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Event } from '@/lib/types'

const gsapMocks = vi.hoisted(() => {
  const timeline = {
    to: vi.fn(() => timeline),
  }

  return {
    timeline,
    gsap: {
      registerPlugin: vi.fn(),
      set: vi.fn(),
      timeline: vi.fn((config?: { scrollTrigger?: { pin?: boolean; trigger?: HTMLElement } }) => {
        const trigger = config?.scrollTrigger?.trigger

        if (config?.scrollTrigger?.pin && trigger?.parentNode) {
          const spacer = document.createElement('div')
          spacer.dataset.testid = 'simulated-gsap-pin-spacer'
          trigger.parentNode.insertBefore(spacer, trigger)
          spacer.appendChild(trigger)
        }

        return timeline
      }),
      context: vi.fn((callback: () => void) => {
        callback()
        return { revert: vi.fn() }
      }),
      fromTo: vi.fn(),
    },
  }
})

vi.mock('gsap', () => ({
  gsap: gsapMocks.gsap,
}))

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {},
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/components/ui/animated-shiny-text', () => ({
  AnimatedShinyText: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/ui/liquid-glass-button', () => ({
  LiquidButton: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/motion-button', () => ({
  default: ({ label, ...props }: { label: string } & React.ComponentProps<'button'>) => (
    <button {...props}>{label}</button>
  ),
}))

vi.mock('@/components/ui/team-showcase', () => ({
  default: () => <div data-testid="team-showcase" />,
}))

const members = [
  {
    id: '1',
    name: 'Ada Lovelace',
    role: 'Présidente',
    image: '/ada.jpg',
  },
]

const upcomingEvent: Event = {
  id: 'event-upcoming',
  title: 'Conférence finance',
  date: '2099-05-01',
  partner: 'CS Finance',
  partnerDescription: null,
  pole: 'Marchés',
  description: 'Une conférence à venir.',
  image: '/events/conference-finance.jpg',
  images: [],
  highlights: [],
  photos: [],
  status: 'upcoming',
}

const pastEvent: Event = {
  id: 'event-past',
  title: 'Atelier M&A',
  date: '2020-06-12',
  partner: 'Banque Test',
  partnerDescription: null,
  pole: 'Corporate finance',
  description: 'Un atelier passé.',
  image: '/events/atelier-ma.jpg',
  images: [],
  highlights: [],
  photos: [],
  status: 'past',
}

const secondUpcoming: Event = {
  id: 'event-upcoming-2',
  title: 'Forum Carrières Finance',
  date: '2099-09-15',
  partner: 'CS Finance',
  partnerDescription: null,
  pole: 'Gestion',
  description: 'Un forum carrières.',
  image: '/events/forum.jpg',
  images: [],
  highlights: [],
  photos: [],
  status: 'upcoming',
}

const events: Event[] = [upcomingEvent, pastEvent]

describe('CinematicHeroSection', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('unmounts without a ScrollTrigger pin reparenting a React-managed node', async () => {
    vi.useFakeTimers()
    const { CinematicHeroSection } = await import('@/components/landing/cinematic-hero-section')

    Object.defineProperty(SVGElement.prototype, 'getTotalLength', {
      configurable: true,
      value: () => 100,
    })

    const { unmount } = render(
      <React.StrictMode>
        <CinematicHeroSection members={members} events={events} />
      </React.StrictMode>,
    )

    await act(async () => {
      window.dispatchEvent(new Event('csf:loading-done'))
      vi.advanceTimersByTime(60)
    })

    expect(() => unmount()).not.toThrow()
  })

  it('animates the events card out before the normal landing footer takes over', async () => {
    vi.useFakeTimers()
    const { CinematicHeroSection } = await import('@/components/landing/cinematic-hero-section')

    Object.defineProperty(SVGElement.prototype, 'getTotalLength', {
      configurable: true,
      value: () => 100,
    })

    render(
      <React.StrictMode>
        <CinematicHeroSection members={members} events={events} />
      </React.StrictMode>,
    )

    await act(async () => {
      window.dispatchEvent(new Event('csf:loading-done'))
      vi.advanceTimersByTime(60)
    })

    const calls = gsapMocks.timeline.to.mock.calls
    const card2EnterCall = calls.find(([, vars, position]: [unknown, unknown, unknown]) => {
      const animation = vars as { yPercent?: number; duration?: number }
      return animation.yPercent === 0 && animation.duration === 1.5 && position === 7
    })
    const content2EnterCall = calls.find(([, vars, position]: [unknown, unknown, unknown]) => {
      const animation = vars as { autoAlpha?: number; y?: number; duration?: number }
      return animation.autoAlpha === 1 && animation.y === 0 && animation.duration === 1 && position === 8
    })

    expect(card2EnterCall).toBeDefined()
    expect(content2EnterCall).toBeDefined()

    const card2 = card2EnterCall?.[0]
    const content2 = content2EnterCall?.[0]
    const section = document.querySelector('section')
    const handoffMask = document.querySelector('[data-testid="handoff-mask"]')
    const footerRevealBridgeCall = calls.find(([, vars, position]: [unknown, unknown, unknown]) => {
      const animation = vars as { duration?: number }
      return animation.duration !== undefined && position === 11.3
    })

    expect(handoffMask).toBeNull()
    expect(calls).toEqual(
      expect.arrayContaining([
        [
          content2,
          expect.objectContaining({ autoAlpha: 0, y: -30, duration: 1.1 }),
          9.1,
        ],
        [
          card2,
          expect.objectContaining({
            yPercent: -90,
            scale: 0.78,
            autoAlpha: 0,
            borderRadius: '2.5rem',
            duration: 2.3,
          }),
          9,
        ],
      ]),
    )
    expect((footerRevealBridgeCall?.[1] as { duration?: number })?.duration).toBe(2.2)
    expect(section).toHaveStyle({ marginBottom: 'calc(-100vh + 220px)' })
  })

  it('renders the upcoming event as the featured card', async () => {
    const { CinematicHeroSection } = await import('@/components/landing/cinematic-hero-section')

    Object.defineProperty(SVGElement.prototype, 'getTotalLength', {
      configurable: true,
      value: () => 100,
    })

    render(
      <React.StrictMode>
        <CinematicHeroSection members={members} events={events} />
      </React.StrictMode>,
    )

    const featuredLink = screen.getAllByRole('link', { name: /conférence finance/i })[0]
    expect(featuredLink).toHaveAttribute('href', '/evenements/event-upcoming')
  })

  it('shows the À venir badge on upcoming events', async () => {
    const { CinematicHeroSection } = await import('@/components/landing/cinematic-hero-section')

    Object.defineProperty(SVGElement.prototype, 'getTotalLength', {
      configurable: true,
      value: () => 100,
    })

    render(
      <React.StrictMode>
        <CinematicHeroSection members={members} events={events} />
      </React.StrictMode>,
    )

    const badge = screen.getByText('À venir')
    expect(badge).toBeDefined()
  })

  it('renders event images with full-cover treatment', async () => {
    const { CinematicHeroSection } = await import('@/components/landing/cinematic-hero-section')

    Object.defineProperty(SVGElement.prototype, 'getTotalLength', {
      configurable: true,
      value: () => 100,
    })

    render(
      <React.StrictMode>
        <CinematicHeroSection members={members} events={events} />
      </React.StrictMode>,
    )

    const image = screen.getByRole('img', { name: 'Conférence finance' })
    expect(image).toHaveAttribute('src', '/events/conference-finance.jpg')
    expect(image).toHaveClass('object-cover')
  })

  it('renders secondary events as smaller cards alongside the featured event', async () => {
    const { CinematicHeroSection } = await import('@/components/landing/cinematic-hero-section')

    Object.defineProperty(SVGElement.prototype, 'getTotalLength', {
      configurable: true,
      value: () => 100,
    })

    render(
      <React.StrictMode>
        <CinematicHeroSection members={members} events={[upcomingEvent, secondUpcoming, pastEvent]} />
      </React.StrictMode>,
    )

    const secondaryLink = screen.getByRole('link', { name: /forum carrières finance/i })
    expect(secondaryLink).toHaveAttribute('href', '/evenements/event-upcoming-2')
  })

  it('makes all event cards clickable links to the event detail page', async () => {
    const { CinematicHeroSection } = await import('@/components/landing/cinematic-hero-section')

    Object.defineProperty(SVGElement.prototype, 'getTotalLength', {
      configurable: true,
      value: () => 100,
    })

    render(
      <React.StrictMode>
        <CinematicHeroSection members={members} events={events} />
      </React.StrictMode>,
    )

    const pastLink = screen.getByRole('link', { name: /atelier m&a/i })
    expect(pastLink).toHaveAttribute('href', '/evenements/event-past')
  })

  it('renders the section heading for the events magazine', async () => {
    const { CinematicHeroSection } = await import('@/components/landing/cinematic-hero-section')

    Object.defineProperty(SVGElement.prototype, 'getTotalLength', {
      configurable: true,
      value: () => 100,
    })

    render(
      <React.StrictMode>
        <CinematicHeroSection members={members} events={events} />
      </React.StrictMode>,
    )

    const heading = screen.getByRole('heading', {
      name: /événements récents & à venir/i,
    })
    expect(heading).toHaveClass('font-bold', 'tracking-tight')
  })
})
