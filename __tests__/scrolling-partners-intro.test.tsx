import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Partner } from '@/lib/types'

vi.mock('next/image', () => ({
  default: ({ alt = '', ...props }: React.ComponentProps<'img'> & { alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

const partners: Partner[] = [
  { name: 'Goldman Sachs', logo: '/images/partners/goldman.png' },
  { name: 'BNP Paribas CIB', logo: '/images/partners/bnp.png' },
]

describe('ScrollingPartnersIntro', () => {
  it('renders partner logos and the central editorial copy', async () => {
    const { ScrollingPartnersIntro } = await import('@/components/ui/scrolling-partners-intro')

    render(<ScrollingPartnersIntro partners={partners} />)

    expect(screen.getByAltText('Logo Goldman Sachs')).toBeInTheDocument()
    expect(screen.getByAltText('Logo BNP Paribas CIB')).toBeInTheDocument()
    expect(screen.getByText('Partenaires')).toBeInTheDocument()
    expect(screen.getByText('Ils nous connaissent deja.')).toBeInTheDocument()
  })

  it('shows the partner name if a logo fails to load', async () => {
    const { ScrollingPartnersIntro } = await import('@/components/ui/scrolling-partners-intro')

    render(<ScrollingPartnersIntro partners={partners} />)

    fireEvent.error(screen.getByAltText('Logo Goldman Sachs'))

    expect(screen.getByText('Goldman Sachs')).toBeInTheDocument()
  })
})
