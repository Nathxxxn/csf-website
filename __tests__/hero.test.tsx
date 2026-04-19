import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Make next/dynamic synchronous in tests (ssr: false otherwise suppresses rendering)
vi.mock('next/dynamic', () => ({
  default: (importer: () => Promise<any>, _opts?: any) => React.lazy(importer),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/components/ui/blur-fade', () => ({
  BlurFade: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/ui/animated-shiny-text', () => ({
  AnimatedShinyText: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/ui/liquid-glass-button', () => ({
  LiquidButton: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}))

vi.mock('@/components/ui/motion-button', () => ({
  default: ({ label, ...props }: { label: string } & React.ComponentProps<'button'>) => (
    <button {...props}>{label}</button>
  ),
}))

describe('Hero', () => {
  it('renders without legacy background components (DottedSurface and BackgroundPaths replaced by fixed MarketWaveBackground)', async () => {
    const { Hero } = await import('@/components/landing/hero')

    await act(async () => {
      render(
        <React.Suspense fallback={null}>
          <Hero />
        </React.Suspense>
      )
    })

    expect(screen.queryByTestId('dotted-surface')).not.toBeInTheDocument()
    expect(screen.queryByText('Background Paths')).not.toBeInTheDocument()
  })
})
