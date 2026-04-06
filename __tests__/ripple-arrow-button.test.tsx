import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('RippleArrowButton', () => {
  it('renders a disabled button with its label and the three-arrow icon', async () => {
    const { RippleArrowButton } = await import('@/components/ui/ripple-arrow-button')

    const { container } = render(
      <RippleArrowButton disabled>
        Envoyer
      </RippleArrowButton>,
    )

    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeDisabled()
    expect(container.querySelectorAll('polygon')).toHaveLength(3)
  })

  it('keeps the arrow icon inline so the hover motion matches the source component', async () => {
    const { RippleArrowButton } = await import('@/components/ui/ripple-arrow-button')

    const { container } = render(<RippleArrowButton>Envoyer</RippleArrowButton>)
    const svg = container.querySelector('svg')

    expect(svg).not.toBeNull()
    expect(svg?.className.baseVal ?? svg?.getAttribute('class') ?? '').not.toContain('absolute')
  })

  it('does not rely on enabled:group-hover on child elements', async () => {
    const { RippleArrowButton } = await import('@/components/ui/ripple-arrow-button')

    const { container } = render(<RippleArrowButton>Envoyer</RippleArrowButton>)
    const childClasses = Array.from(container.querySelectorAll('span, svg, polygon'))
      .map(node => node.getAttribute('class') ?? '')
      .join(' ')

    expect(childClasses).not.toContain('enabled:group-hover')
  })
})
