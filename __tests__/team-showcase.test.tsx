import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { TeamMember } from '@/components/ui/team-showcase'

vi.mock('react-icons/fa', () => ({
  FaLinkedinIn: () => null,
  FaTwitter: () => null,
  FaBehance: () => null,
  FaInstagram: () => null,
}))

const members: TeamMember[] = [
  { id: '1', name: 'Alice Martin', role: 'Présidente', image: '/alice.jpg' },
  { id: '2', name: 'Bob Dupont', role: 'Trésorier', image: '/bob.jpg' },
  { id: '3', name: 'Claire Morin', role: 'VP Partenariats', image: '/claire.jpg' },
  { id: '4', name: 'David Petit', role: 'VP Formation', image: '/david.jpg' },
]

describe('TeamShowcase', () => {
  it('renders a mobile 2-column photo grid (md:hidden grid-cols-2)', async () => {
    const { default: TeamShowcase } = await import('@/components/ui/team-showcase')
    const { container } = render(<TeamShowcase members={members} />)

    const mobileGrid = container.querySelector('.md\\:hidden')
    expect(mobileGrid).not.toBeNull()
    expect(mobileGrid?.className).toContain('grid-cols-2')

    const photos = mobileGrid?.querySelectorAll('img')
    expect(photos?.length).toBe(4)
  })

  it('renders name and role on each mobile photo card via data-member-name', async () => {
    const { default: TeamShowcase } = await import('@/components/ui/team-showcase')
    const { container } = render(<TeamShowcase members={members} />)

    const mobileGrid = container.querySelector('.md\\:hidden')
    const nameEls = mobileGrid?.querySelectorAll('[data-member-name]')
    expect(nameEls?.length).toBe(4)
    expect(nameEls?.[0].textContent).toBe('Alice Martin')
  })

  it('hides the staggered desktop grid on mobile (hidden md:flex)', async () => {
    const { default: TeamShowcase } = await import('@/components/ui/team-showcase')
    const { container } = render(<TeamShowcase members={members} />)

    const desktopGrid = container.querySelector('.hidden.md\\:flex')
    expect(desktopGrid).not.toBeNull()
  })
})
