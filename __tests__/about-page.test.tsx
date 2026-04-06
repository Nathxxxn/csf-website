import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/data', () => ({
  getTeam: vi.fn().mockResolvedValue([
    {
      pole: 'Bureau',
      badge: 'Bureau',
      description: "Donne la direction de l'association et coordonne les pôles.",
      members: [],
    },
    {
      pole: 'Formation',
      badge: 'Skills',
      description: 'Travaille les bases techniques utiles aux membres.',
      members: [],
    },
  ]),
}))

vi.mock('@/components/ui/blur-fade', () => ({
  BlurFade: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}))

vi.mock('@/components/ui/number-ticker', () => ({
  NumberTicker: ({ value }: { value: number }) => <span>{value}</span>,
}))

describe('AboutPage', () => {
  it('uses a wider page container and renders uniform pole cards', async () => {
    const { default: AboutPage } = await import('@/app/a-propos/page')

    const page = await AboutPage()
    const { container } = render(page)

    const pageRoot = container.firstElementChild as HTMLElement | null
    expect(pageRoot).not.toBeNull()
    expect(pageRoot?.className).toContain('max-w-screen-2xl')
    expect(pageRoot?.className).not.toContain('max-w-6xl')

    const bureauCard = screen.getByRole('heading', { name: 'Bureau' }).closest('div.rounded-xl')
    const formationCard = screen.getByRole('heading', { name: 'Formation' }).closest('div.rounded-xl')

    expect(bureauCard).not.toBeNull()
    expect(formationCard).not.toBeNull()
    expect(bureauCard?.className).toContain('h-full')
    expect(bureauCard?.className).toContain('sm:aspect-[2/1]')
    expect(formationCard?.className).toContain('h-full')
    expect(formationCard?.className).toContain('sm:aspect-[2/1]')
  })
})
