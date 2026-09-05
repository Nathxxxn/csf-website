import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { PoleData } from '@/lib/types'

const { getTeamMock } = vi.hoisted(() => ({
  getTeamMock: vi.fn(),
}))

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
  getTeam: getTeamMock,
}))

vi.mock('@/components/ui/blur-fade', () => ({
  BlurFade: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/ui/team-showcase', () => ({
  default: () => <div data-testid="team-showcase" />,
}))

vi.mock('@/components/landing/team-scroll-card', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/landing/team-scroll-card')>()
  return { TeamScrollCard: vi.fn(actual.TeamScrollCard) }
})

describe('TeamPreview', () => {
  it('renders a mobile-only link to /equipe below the showcase', async () => {
    getTeamMock.mockResolvedValue([])
    const { TeamPreview } = await import('@/components/landing/team-preview')
    const component = await TeamPreview()
    render(component)

    const links = screen.getAllByRole('link', { name: /voir toute l'équipe/i })
    const mobileLink = links.find((link) => link.className?.includes('sm:hidden'))
    expect(mobileLink).toBeDefined()
    expect(mobileLink?.getAttribute('href')).toBe('/equipe')
  })

  it('treats the same member listed under two poles as one identity even when name casing differs', async () => {
    const poles: PoleData[] = [
      {
        pole: 'Alumni',
        badge: 'Alumni',
        description: 'Réseau des anciens.',
        members: [
          { name: 'Tibor DUBOIS', role: 'Membre', photo: '/team/tibor.jpeg', linkedin: null },
        ],
      },
      {
        pole: 'Bureau',
        badge: 'BUR',
        description: 'Le bureau.',
        members: [
          { name: '  Tibor Dubois  ', role: 'Président', photo: '/team/tibor.jpeg', linkedin: null },
        ],
      },
    ]
    getTeamMock.mockResolvedValue(poles)
    const { TeamScrollCard } = vi.mocked(await import('@/components/landing/team-scroll-card'))
    vi.mocked(TeamScrollCard).mockClear()

    const { TeamPreview } = await import('@/components/landing/team-preview')
    const component = await TeamPreview()
    render(component)

    expect(TeamScrollCard).toHaveBeenCalledTimes(1)
    const { members } = vi.mocked(TeamScrollCard).mock.calls[0][0] as { members: Array<{ image: string }> }
    expect(members).toHaveLength(1)
    expect(members[0].image).toBe('/team/tibor.jpeg')
  })
})
