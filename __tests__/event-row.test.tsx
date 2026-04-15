import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Event } from '@/lib/types'

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  formatEventDay: () => '14',
  formatEventMonth: () => 'AVRL',
}))

const event: Event = {
  id: '1',
  title: 'Test Event',
  date: '2026-04-14',
  partner: 'Test Partner',
  partnerDescription: '',
  pole: 'Formation',
  description: 'Test description',
  image: null,
  images: [],
  status: 'upcoming',
  highlights: [],
  photos: [],
}

describe('EventRow', () => {
  it('uses a 2-column grid on mobile and 3-column on sm+', async () => {
    const { EventRow } = await import('@/components/shared/event-row')
    const { container } = render(<EventRow event={event} />)
    const row = container.firstElementChild as HTMLElement
    expect(row.className).toContain('grid-cols-[64px_1fr]')
    expect(row.className).toContain('sm:grid-cols-[80px_1fr_auto]')
  })
})
