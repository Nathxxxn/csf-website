import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Partner } from '@/lib/types'

const partners: Partner[] = [
  { name: 'Goldman Sachs', logo: '/goldman.png' },
  { name: 'BNP Paribas CIB', logo: '/bnp.png' },
  { name: 'Lazard', logo: '/lazard.png' },
  { name: 'Rothschild & Co', logo: '/rothschild.png' },
]

vi.mock('@/lib/data', () => ({
  getPartners: vi.fn(async () => partners),
}))

vi.mock('@/components/ui/blur-fade', () => ({
  BlurFade: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/ui/marquee', () => ({
  Marquee: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="partner-row" className={className}>{children}</div>
  ),
}))

describe('PartnersMarquee', () => {
  it('starts the partner rows close to the previous cinematic card', async () => {
    const { PartnersMarquee } = await import('@/components/landing/partners-marquee')

    const { container } = render(await PartnersMarquee())

    const section = container.querySelector('#partenaires')
    const heading = screen.getByText('Des entreprises avec qui nous avons déjà travaillé')

    expect(section).toHaveClass('pt-4')
    expect(section).not.toHaveClass('py-20')
    expect(heading).toHaveClass('mb-4')
    expect(screen.getAllByTestId('partner-row')).toHaveLength(2)
  })
})
