import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Event } from '@/lib/types'

const eventBase: Event = {
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
}

vi.mock('@/lib/data', () => ({
  getUpcomingEvents: vi.fn(async () => [eventBase]),
  getPastEvents: vi.fn(async () => [{ ...eventBase, id: 'event-2', status: 'past' }]),
  getTeam: vi.fn(async () => [
    {
      members: [
        {
          name: 'Ada Lovelace',
          role: 'Présidente',
          photo: '/ada.jpg',
          linkedin: null,
        },
      ],
    },
  ]),
}))

vi.mock('@/components/ui/market-wave-background', () => ({
  MarketWaveBackground: () => <div data-testid="market-wave-background" />,
}))

vi.mock('@/components/landing/cinematic-hero-section', () => ({
  CinematicHeroSection: () => <section data-testid="cinematic-hero" />,
}))

vi.mock('@/components/landing/events-preview', () => ({
  EventsPreview: () => <section data-testid="events-preview" />,
}))

vi.mock('@/components/landing/partners-marquee', () => ({
  PartnersMarquee: () => <section data-testid="partners-marquee" />,
}))

vi.mock('@/components/landing/partners-cta', () => ({
  PartnersCta: () => <section data-testid="partners-cta" />,
}))

describe('HomePage', () => {
  it('continues from the cinematic events card directly into partners and collaboration', async () => {
    const HomePage = (await import('@/app/page')).default

    render(await HomePage())

    expect(screen.getByTestId('market-wave-background')).toBeInTheDocument()
    expect(screen.getByTestId('cinematic-hero')).toBeInTheDocument()
    expect(screen.queryByTestId('events-preview')).not.toBeInTheDocument()

    const partners = screen.getByTestId('partners-marquee')
    const cta = screen.getByTestId('partners-cta')

    expect(partners.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
