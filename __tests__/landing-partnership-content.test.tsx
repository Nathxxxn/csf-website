import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Partner, SiteContent } from '@/lib/types'

const partners: Partner[] = [
  { name: 'Goldman Sachs', logo: '/goldman.png' },
  { name: 'BNP Paribas CIB', logo: '/bnp.png' },
]

vi.mock('@/lib/data', () => ({
  getPartners: vi.fn(async () => partners),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/components/ui/blur-fade', () => ({
  BlurFade: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/ui/marquee', () => ({
  Marquee: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/text-animate', () => ({
  TextAnimate: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}))

vi.mock('@/components/ui/flow-button', () => ({
  FlowButton: ({ text }: { text: string }) => <button>{text}</button>,
}))

vi.mock('@/components/ui/liquid-glass-button', () => ({
  LiquidButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}))

const content: SiteContent = {
  hero_title: '',
  hero_subtitle: '',
  stats_poles: '',
  stats_membres: '',
  stats_etudiants: '',
  stats_evenements: '',
  partners_marquee_label: 'Partenaires éditables',
  partners_cta_eyebrow: 'Relations entreprises',
  partners_cta_title: 'Construire un format avec CSF',
  partners_cta_body: 'Conférence, workshop ou immersion métier avec nos membres.',
  partners_cta_primary_label: 'Contacter CSF',
  partners_cta_secondary_label: 'Voir le réseau',
  events_eyebrow: '',
  events_intro: '',
  about_heading: '',
  about_intro: '',
  about_legal_address: '',
  about_legal_rna: '',
}

describe('landing partnership content', () => {
  it('renders the partner marquee label from site content', async () => {
    const { PartnersMarquee } = await import('@/components/landing/partners-marquee')

    render(await PartnersMarquee({ content }))

    expect(screen.getByText('Partenaires éditables')).toBeInTheDocument()
  })

  it('renders the partnership CTA copy from site content', async () => {
    const { PartnersCta } = await import('@/components/landing/partners-cta')

    render(<PartnersCta content={content} />)

    expect(screen.getByText('Relations entreprises')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Construire un format avec CSF' })).toBeInTheDocument()
    expect(screen.getByText('Conférence, workshop ou immersion métier avec nos membres.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Contacter CSF' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Voir le réseau' })).toBeInTheDocument()
  })
})
