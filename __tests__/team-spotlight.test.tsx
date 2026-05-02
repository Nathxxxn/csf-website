import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PoleData } from '@/lib/types'

const poles: PoleData[] = [
  {
    pole: 'Bureau',
    badge: 'Direction',
    description: "Coordonne l'association.",
    members: [
      {
        name: 'Alice Martin',
        role: 'Présidente',
        photo: '/team/alice.jpg',
        linkedin: 'https://www.linkedin.com/in/alice',
        tagline: 'Stratège, connectrice, cheffe d orchestre.',
        bio: 'Pilote la stratégie et la relation alumni.',
        promo: '3A',
        joinedYear: '2024',
        contributions: 12,
        skills: ['M&A', 'Strategy'],
        email: 'alice@example.com',
      },
      {
        name: 'Bob Dupont',
        role: 'Trésorier',
        photo: null,
        linkedin: null,
      },
    ],
  },
  {
    pole: 'Marchés Financiers',
    badge: 'Markets',
    description: 'Analyse et notes de marché.',
    members: [
      {
        name: 'Claire Morin',
        role: 'Analyste marchés',
        photo: '/team/claire.jpg',
        linkedin: 'https://www.linkedin.com/in/claire',
      },
    ],
  },
]

describe('TeamSpotlight', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 100 })
  })

  it('slightly scrolls the initial viewport down on first load', async () => {
    const scrollTo = vi.fn()
    const originalScrollTo = window.scrollTo
    const originalHash = window.location.hash

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
    window.scrollTo = scrollTo
    window.location.hash = ''

    const { TeamSpotlight } = await import('@/components/ui/team-spotlight')

    try {
      render(<TeamSpotlight poles={poles} />)

      expect(scrollTo).toHaveBeenCalledWith({ top: 36, behavior: 'auto' })
    } finally {
      window.scrollTo = originalScrollTo
      window.location.hash = originalHash
    }
  })

  it('renders pole tabs with member counts and shows the first member by default', async () => {
    const { TeamSpotlight } = await import('@/components/ui/team-spotlight')

    render(<TeamSpotlight poles={poles} />)

    expect(screen.getByRole('tab', { name: /tous 3/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /bureau 2/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /marchés financiers 1/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /alice martin/i })).toBeInTheDocument()
    expect(screen.getByText('Présidente')).toBeInTheDocument()
    expect(screen.getByText('01 / 03')).toBeInTheDocument()
  })

  it('moves to the next member with the next button', async () => {
    const user = userEvent.setup()
    const { TeamSpotlight } = await import('@/components/ui/team-spotlight')

    render(<TeamSpotlight poles={poles} />)
    await user.click(screen.getByRole('button', { name: /membre suivant/i }))

    expect(screen.getByRole('heading', { name: /bob dupont/i })).toBeInTheDocument()
    expect(screen.getByText('02 / 03')).toBeInTheDocument()
  })

  it('does not use element scrollIntoView when changing members', async () => {
    const user = userEvent.setup()
    const scrollIntoView = vi.fn()
    const originalScrollIntoView = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = scrollIntoView

    const { TeamSpotlight } = await import('@/components/ui/team-spotlight')

    try {
      render(<TeamSpotlight poles={poles} />)
      await user.click(screen.getByRole('button', { name: /membre suivant/i }))

      expect(scrollIntoView).not.toHaveBeenCalled()
    } finally {
      Element.prototype.scrollIntoView = originalScrollIntoView
    }
  })

  it('filters by pole and resets to the first member of that pole', async () => {
    const user = userEvent.setup()
    const { TeamSpotlight } = await import('@/components/ui/team-spotlight')

    render(<TeamSpotlight poles={poles} />)
    await user.click(screen.getByRole('button', { name: /membre suivant/i }))
    await user.click(screen.getByRole('tab', { name: /marchés financiers 1/i }))

    expect(screen.getByRole('heading', { name: /claire morin/i })).toBeInTheDocument()
    expect(screen.getByText('01 / 01')).toBeInTheDocument()
  })

  it('shows enriched profile content and social links when available', async () => {
    const { TeamSpotlight } = await import('@/components/ui/team-spotlight')

    render(<TeamSpotlight poles={poles} />)

    expect(screen.getByText(/Stratège, connectrice, cheffe d orchestre./i)).toBeInTheDocument()
    expect(screen.getByText('Pilote la stratégie et la relation alumni.')).toBeInTheDocument()
    expect(screen.getByText('Promo')).toBeInTheDocument()
    expect(screen.getByText('3A')).toBeInTheDocument()
    expect(screen.getByText('Au bureau')).toBeInTheDocument()
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByText('Contributions')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('M&A')).toBeInTheDocument()
    expect(screen.getByText('Strategy')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /email de alice martin/i })).toHaveAttribute(
      'href',
      'mailto:alice@example.com',
    )
    expect(screen.getByRole('link', { name: /linkedin de alice martin/i })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/alice',
    )
  })

  it('keeps fallback metadata and hides enriched blocks for members without enriched profile fields', async () => {
    const user = userEvent.setup()
    const { TeamSpotlight } = await import('@/components/ui/team-spotlight')

    render(<TeamSpotlight poles={poles} />)
    await user.click(screen.getByRole('button', { name: /membre suivant/i }))

    expect(screen.getByRole('heading', { name: /bob dupont/i })).toBeInTheDocument()
    expect(screen.getByText('Pôle')).toBeInTheDocument()
    expect(screen.getByText('Rang')).toBeInTheDocument()
    expect(screen.queryByText('Promo')).not.toBeInTheDocument()
    expect(screen.queryByText('Au bureau')).not.toBeInTheDocument()
    expect(screen.queryByText('Contributions')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /email de bob dupont/i })).not.toBeInTheDocument()
  })
})
