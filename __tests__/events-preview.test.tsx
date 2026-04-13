import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Event } from '@/lib/types'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('@/components/ui/blur-fade', () => ({
  BlurFade: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="blur-fade" className={className}>{children}</div>
  ),
}))

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`tab-${value}`}>{children}</div>
  ),
}))

vi.mock('@/components/ui/animated-list', () => ({
  AnimatedList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/border-beam', () => ({
  BorderBeam: () => <div data-testid="border-beam" />,
}))

vi.mock('@/components/ui/magic-card', () => ({
  MagicCard: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="magic-card" className={className}>{children}</div>
  ),
}))

const eventBase: Event = {
  id: 'event-1',
  title: 'Mock Event',
  date: '2026-04-01',
  partner: 'Partner',
  partnerDescription: '',
  pole: 'Formation',
  description: 'Description',
  image: null,
  images: [],
  status: 'past',
  highlights: [],
  photos: [],
}

describe('EventsPreview', () => {
  it('stretches past-event cards to a uniform grid height', async () => {
    const { EventsPreview } = await import('@/components/landing/events-preview')

    render(
      <EventsPreview
        upcoming={[{ ...eventBase, id: 'upcoming-1', status: 'upcoming' }]}
        past={[
          eventBase,
          { ...eventBase, id: 'event-2', title: 'Another Event', description: 'Longer description to vary content length.' },
        ]}
      />,
    )

    const pastTab = screen.getByTestId('tab-past')
    const grid = pastTab.querySelector('.grid')

    expect(grid).not.toBeNull()

    const gridItems = Array.from(grid?.children ?? [])
    expect(gridItems).toHaveLength(2)
    gridItems.forEach((item) => {
      expect(item.className).toContain('h-full')
    })

    const cards = screen.getAllByTestId('magic-card')
    expect(cards).toHaveLength(2)
    cards.forEach((card) => {
      expect(card.className).toContain('h-full')
    })
  })
})
