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

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}))

describe('AboutPage', () => {
  it('h1 uses responsive text sizing (text-4xl on mobile, text-5xl on sm+)', async () => {
    const { default: AboutPage } = await import('@/app/a-propos/page')
    const page = await AboutPage()
    render(page)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.className).toContain('text-4xl')
    expect(h1.className).toContain('sm:text-5xl')
  })
})
