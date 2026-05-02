import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/data', () => ({
  getTeam: vi.fn().mockResolvedValue([
    {
      pole: 'Bureau',
      badge: 'Direction',
      description: "Coordonne l'association.",
      members: [
        {
          name: 'Alice Martin',
          role: 'Présidente',
          photo: null,
          linkedin: null,
        },
      ],
    },
  ]),
}))

vi.mock('@/components/ui/team-spotlight', () => ({
  TeamSpotlight: () => <section data-testid="team-spotlight" />,
}))

describe('TeamPage', () => {
  it('renders the TeamSpotlight presentation', async () => {
    const TeamPage = (await import('@/app/equipe/page')).default

    render(await TeamPage())

    expect(screen.getByTestId('team-spotlight')).toBeInTheDocument()
  })
})
