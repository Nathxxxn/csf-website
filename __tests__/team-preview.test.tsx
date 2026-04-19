import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
  }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

vi.mock('@/lib/data', () => ({
  getTeam: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/components/ui/blur-fade', () => ({
  BlurFade: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/ui/team-showcase', () => ({
  default: () => <div data-testid="team-showcase" />,
}))

describe('TeamPreview', () => {
  it('renders a mobile-only link to /equipe below the showcase', async () => {
    const { TeamPreview } = await import('@/components/landing/team-preview')
    const component = await TeamPreview()
    render(component)

    const links = screen.getAllByRole('link', { name: /voir toute l'équipe/i })
    const mobileLink = links.find((link) => link.className?.includes('sm:hidden'))
    expect(mobileLink).toBeDefined()
    expect(mobileLink?.getAttribute('href')).toBe('/equipe')
  })
})
