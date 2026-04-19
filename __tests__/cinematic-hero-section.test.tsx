import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
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

const events: Event[] = [
  {
    id: 'event-1',
    title: 'Conférence finance',
    date: '2026-05-01',
    partner: 'CS Finance',
    partnerDescription: null,
    pole: 'Marchés',
    description: 'Une conférence.',
    image: '/events/conference-finance.jpg',
    images: [],
    highlights: [],
    photos: [],
    status: 'upcoming',
  },
  {
    id: 'event-2',
    title: 'Atelier M&A',
    date: '2026-06-12',
    partner: 'Banque Test',
    partnerDescription: null,
    pole: 'Corporate finance',
    description: 'Un atelier.',
    image: '/events/atelier-ma.jpg',
    images: [],
    highlights: [],
    photos: [],
    status: 'upcoming',
  },
]

function mockAnimationFrame() {
  const callbacks: FrameRequestCallback[] = []

  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback: FrameRequestCallback) => {
      callbacks.push(callback)
      return callbacks.length
    })

  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)

  return {
    runNextFrame() {
      const callback = callbacks.shift()
      if (!callback) return

      callback(performance.now())
    },
    requestAnimationFrameSpy,
  }
}

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
      vi.advanceTimersByTime(60)
    })

    const calls = gsapMocks.timeline.to.mock.calls
    const card2EnterCall = calls.find(([, vars, position]) => {
      const animation = vars as { yPercent?: number; duration?: number }
      return animation.yPercent === 0 && animation.duration === 1.5 && position === 7
    })
    const content2EnterCall = calls.find(([, vars, position]) => {
      const animation = vars as { autoAlpha?: number; y?: number; duration?: number }
      return animation.autoAlpha === 1 && animation.y === 0 && animation.duration === 1 && position === 8
    })

    expect(card2EnterCall).toBeDefined()
    expect(content2EnterCall).toBeDefined()

    const card2 = card2EnterCall?.[0]
    const content2 = content2EnterCall?.[0]
    const section = document.querySelector('section')
    const handoffMask = document.querySelector('[data-testid="handoff-mask"]')
    const footerRevealBridgeCall = calls.find(([, vars, position]) => {
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

  it('anchors the Today indicator dot and event connectors to the same timeline axis', async () => {
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

    const axis = document.querySelector('[data-testid="events-axis"]')
    const todayMarker = document.querySelector('[data-testid="today-marker"]')
    const todayDot = document.querySelector('[data-testid="today-axis-dot"]')
    const eventConnector = document.querySelector('[data-testid="event-connector-event-1"]')

    expect(axis).not.toBeNull()
    expect(todayMarker).not.toBeNull()
    expect(todayDot).not.toBeNull()
    expect(eventConnector).not.toBeNull()

    const axisTop = axis?.getAttribute('data-axis-top')

    expect(todayMarker).toHaveAttribute('data-axis-top', axisTop)
    expect(todayDot).toHaveAttribute('data-axis-top', axisTop)
    expect(todayDot).toHaveStyle({ top: '50%' })
    expect(eventConnector).toHaveAttribute('data-axis-top', axisTop)
  })

  it('uses the same sans typography as the rest of the landing events section', async () => {
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
    const eventDate = screen.getByTestId('event-date-event-1')
    const eventTitle = screen.getByTestId('event-card-title-event-1')

    expect(heading).toHaveClass('font-bold', 'tracking-tight')
    expect(heading).not.toHaveStyle({ fontFamily: 'var(--font-serif), Georgia, serif' })
    expect(eventDate).toHaveClass('font-medium')
    expect(eventDate).not.toHaveClass('font-mono')
    expect(eventTitle).toHaveClass('font-semibold', 'tracking-tight')
    expect(eventTitle).not.toHaveStyle({ fontFamily: 'var(--font-serif), Georgia, serif' })
  })

  it('renders the event primary image inside the landing timeline cards', async () => {
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
    expect(image).toHaveClass('h-full', 'w-full', 'object-cover')
  })

  it('aligns the initial active event connector with the Today marker', async () => {
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

    const todayMarker = screen.getByTestId('today-marker')
    const eventConnector = screen.getByTestId('event-connector-event-1')
    const track = screen.getByTestId('events-track')

    expect(todayMarker).toHaveAttribute('data-anchor-x', '24.5')
    expect(eventConnector).toHaveAttribute('data-anchor-x', '24.5')
    expect(track).toHaveStyle({ transform: 'translateX(-24.5px)' })
  })

  it('moves the event timeline when the mouse moves over it without dragging', async () => {
    const animationFrame = mockAnimationFrame()
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

    const wrap = screen.getByTestId('events-timeline')
    const track = screen.getByTestId('events-track')
    Object.defineProperty(wrap, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        left: 0,
        top: 0,
        width: 1000,
        height: 320,
        right: 1000,
        bottom: 320,
        x: 0,
        y: 0,
        toJSON: () => {},
      }),
    })

    expect(track).toHaveStyle({ transform: 'translateX(-24.5px)' })

    fireEvent.mouseMove(wrap, { clientX: 900 })

    act(() => {
      animationFrame.runNextFrame()
    })

    const match = track.style.transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/)
    const translatedX = match ? Number(match[1]) : 0

    expect(translatedX).toBeLessThan(-25)
    expect(animationFrame.requestAnimationFrameSpy).toHaveBeenCalled()
  })
})
