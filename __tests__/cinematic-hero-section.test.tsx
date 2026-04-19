import React from 'react'
import { act, render } from '@testing-library/react'
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
    image: null,
    images: [],
    highlights: [],
    photos: [],
    status: 'upcoming',
  },
]

describe('CinematicHeroSection', () => {
  afterEach(() => {
    vi.useRealTimers()
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
})
