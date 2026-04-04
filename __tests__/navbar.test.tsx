import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let pathname = '/'

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ alt = '', ...props }: React.ComponentProps<'img'> & { alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

describe('Navbar', () => {
  beforeEach(() => {
    pathname = '/'
  })

  it('renders the CSF logo', async () => {
    const { Navbar } = await import('@/components/layout/navbar')

    render(<Navbar />)

    expect(screen.getByAltText('CSF Logo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'CSF Logo' })).toHaveAttribute('href', '/')
  })

  it('public nav links point to the exact routes', async () => {
    const { Navbar } = await import('@/components/layout/navbar')

    render(<Navbar />)

    expect(screen.getByRole('link', { name: 'Événements' })).toHaveAttribute('href', '/evenements')
    expect(screen.getByRole('link', { name: 'Équipe' })).toHaveAttribute('href', '/equipe')
    expect(screen.getByRole('link', { name: 'À propos' })).toHaveAttribute('href', '/a-propos')
    expect(screen.getByRole('link', { name: 'Nous contacter' })).toHaveAttribute('href', '/contact')
  })

  it('mobile menu opens, closes, and contains /contact', async () => {
    const user = userEvent.setup()
    const { Navbar } = await import('@/components/layout/navbar')

    render(<Navbar />)

    expect(screen.getByRole('button', { name: 'Open Menu' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Contacter' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open Menu' }))
    expect(screen.getByRole('button', { name: 'Close Menu' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contacter' })).toHaveAttribute('href', '/contact')

    await user.click(screen.getByRole('button', { name: 'Close Menu' }))
    expect(screen.getByRole('button', { name: 'Open Menu' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Contacter' })).not.toBeInTheDocument()
  })
})

describe('SiteChrome', () => {
  beforeEach(() => {
    pathname = '/'
  })

  it('shows navbar and footer on a public route', async () => {
    pathname = '/'
    const { SiteChrome } = await import('@/components/layout/site-chrome')

    render(
      <SiteChrome>
        <div>Content</div>
      </SiteChrome>,
    )

    expect(screen.getByRole('button', { name: 'Open Menu' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('hides navbar and footer on /admin', async () => {
    pathname = '/admin'
    const { SiteChrome } = await import('@/components/layout/site-chrome')

    render(
      <SiteChrome>
        <div>Content</div>
      </SiteChrome>,
    )

    expect(screen.queryByRole('button', { name: 'Open Menu' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'LinkedIn' })).not.toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('hides navbar and footer on /admin/dashboard', async () => {
    pathname = '/admin/dashboard'
    const { SiteChrome } = await import('@/components/layout/site-chrome')

    render(
      <SiteChrome>
        <div>Content</div>
      </SiteChrome>,
    )

    expect(screen.queryByRole('button', { name: 'Open Menu' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'LinkedIn' })).not.toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('shows navbar and footer on /administrator', async () => {
    pathname = '/administrator'
    const { SiteChrome } = await import('@/components/layout/site-chrome')

    render(
      <SiteChrome>
        <div>Content</div>
      </SiteChrome>,
    )

    expect(screen.getByRole('button', { name: 'Open Menu' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})

describe('Navbar pathname changes', () => {
  beforeEach(() => {
    pathname = '/'
  })

  it('closes the mobile menu when pathname changes', async () => {
    const user = userEvent.setup()
    const { Navbar } = await import('@/components/layout/navbar')

    const { rerender } = render(<Navbar />)

    await user.click(screen.getByRole('button', { name: 'Open Menu' }))
    expect(screen.getByRole('button', { name: 'Close Menu' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contacter' })).toHaveAttribute('href', '/contact')
    expect(screen.getByRole('button', { name: 'Close Menu' })).toHaveAttribute('aria-controls', 'mobile-nav-panel')
    expect(screen.getByRole('link', { name: 'Contacter' }).closest('#mobile-nav-panel')).not.toBeNull()

    pathname = '/evenements'
    rerender(<Navbar />)

    expect(screen.getByRole('button', { name: 'Open Menu' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Contacter' })).not.toBeInTheDocument()
  })
})
