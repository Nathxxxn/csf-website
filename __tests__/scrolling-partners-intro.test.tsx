import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Partner } from '@/lib/types'

const partners: Partner[] = [
  { name: 'Goldman Sachs', logo: '/images/partners/goldman.png' },
  { name: 'BNP Paribas CIB', logo: '/images/partners/bnp.png' },
]

describe('ScrollingPartnersIntro', () => {
  it('renders partner logos and the central editorial copy', async () => {
    const { ScrollingPartnersIntro } = await import('@/components/ui/scrolling-partners-intro')

    render(<ScrollingPartnersIntro partners={partners} />)

    expect(screen.getAllByAltText('Logo Goldman Sachs').length).toBeGreaterThan(0)
    expect(screen.getAllByAltText('Logo BNP Paribas CIB').length).toBeGreaterThan(0)
    expect(screen.getByText('Partenaires')).toBeInTheDocument()
    expect(screen.getByText('Ils nous connaissent déjà.')).toBeInTheDocument()
  })

  it('shows the partner name if a logo fails to load', async () => {
    const { ScrollingPartnersIntro } = await import('@/components/ui/scrolling-partners-intro')

    render(<ScrollingPartnersIntro partners={partners} />)

    fireEvent.error(screen.getAllByAltText('Logo Goldman Sachs')[0])

    expect(screen.getByText('Goldman Sachs')).toBeInTheDocument()
  })

  it('does not place the sticky stage inside an overflow-hidden section ancestor', async () => {
    const { ScrollingPartnersIntro } = await import('@/components/ui/scrolling-partners-intro')

    const { container } = render(<ScrollingPartnersIntro partners={partners} />)
    const section = container.firstElementChild

    expect(section).not.toBeNull()
    expect(section?.className).not.toContain('overflow-hidden')
  })
})
