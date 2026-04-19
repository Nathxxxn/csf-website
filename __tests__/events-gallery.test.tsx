import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Event } from '@/lib/types'

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

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    className,
  }: React.ComponentProps<'img'>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  ),
}))

vi.mock('motion/react', () => ({
  MotionConfig: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useMotionValueEvent: vi.fn(),
}))

vi.mock('@/components/ui/animated-gallery', () => ({
  ContainerScroll: ({
    children,
    className,
    style,
  }: React.ComponentProps<'div'>) => (
    <div data-testid="container-scroll" className={className} style={style}>
      {children}
    </div>
  ),
  ContainerSticky: ({ children, className }: React.ComponentProps<'div'>) => (
    <div className={className}>{children}</div>
  ),
  GalleryContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  GalleryCol: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useContainerScrollContext: () => ({
    scrollYProgress: { on: vi.fn() },
  }),
}))

const makeEvent = (id: string): Event => ({
  id,
  title: `Event ${id}`,
  date: '2026-04-01',
  partner: 'Partner',
  partnerDescription: '',
  pole: 'Formation',
  description: 'Desc',
  image: `/img/${id}.jpg`,
  images: [],
  status: 'past',
  highlights: [],
  photos: [],
})

describe('EventsGallery', () => {
  it('renders a mobile grid (md:hidden) with one link per event that has an image', async () => {
    const { EventsGallery } = await import('@/components/events/events-gallery')
    const events = [makeEvent('1'), makeEvent('2'), makeEvent('3')]
    const { container } = render(<EventsGallery events={events} />)

    const mobileGrid = container.querySelector('.md\\:hidden')
    expect(mobileGrid).not.toBeNull()

    const links = mobileGrid?.querySelectorAll('a')
    expect(links?.length).toBe(3)
  })

  it('wraps the desktop ContainerScroll in hidden md:block', async () => {
    const { EventsGallery } = await import('@/components/events/events-gallery')
    const { container } = render(<EventsGallery events={[makeEvent('a')]} />)

    const desktopWrapper = container.querySelector('.hidden.md\\:block')
    expect(desktopWrapper).not.toBeNull()
  })
})
