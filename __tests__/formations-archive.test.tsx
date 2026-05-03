import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { Formation } from '@/lib/types'

const formations: Formation[] = [
  {
    id: 'f-1',
    title: 'Introduction aux produits dérivés',
    date: '2025-10-14',
    category: 'Marchés',
    description: 'Forwards, futures, swaps.',
    speakerName: 'Antoine R.',
    speakerRole: 'Responsable Marchés',
    supportUrl: 'https://blob.example/derives.pdf',
    supportFilename: 'derives.pdf',
  },
  {
    id: 'f-2',
    title: 'LBO step-by-step',
    date: '2025-05-12',
    category: 'Private Equity',
    description: 'Sources and uses, IRR et MOIC.',
    speakerName: 'Pierre L.',
    speakerRole: 'VP PE',
    supportUrl: null,
    supportFilename: null,
  },
  {
    id: 'f-3',
    title: 'Backtester sa première stratégie',
    date: '2024-04-11',
    category: 'Quant',
    description: 'Pandas et gestion des biais.',
    speakerName: 'Hugo D.',
    speakerRole: 'Responsable Quant',
    supportUrl: 'https://blob.example/backtest.pdf',
    supportFilename: 'backtest.pdf',
  },
]

describe('FormationsArchive', () => {
  it('renders totals, generated category filters, and school-year groups', async () => {
    const { FormationsArchive } = await import('@/components/formations/formations-archive')

    render(<FormationsArchive formations={formations} />)

    expect(screen.getByText('003')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tous 3/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /marchés 1/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /private equity 1/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /2025.*26/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /2023.*24/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /télécharger introduction aux produits dérivés/i })).toHaveAttribute('href', 'https://blob.example/derives.pdf')
    expect(screen.getByLabelText(/support indisponible pour lbo step-by-step/i)).toBeInTheDocument()
  })

  it('filters by category and search text with an empty state', async () => {
    const user = userEvent.setup()
    const { FormationsArchive } = await import('@/components/formations/formations-archive')

    render(<FormationsArchive formations={formations} />)

    await user.click(screen.getByRole('button', { name: /quant 1/i }))
    expect(screen.getByText('Backtester sa première stratégie')).toBeInTheDocument()
    expect(screen.queryByText('Introduction aux produits dérivés')).not.toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox', { name: /rechercher/i }))
    await user.type(screen.getByRole('searchbox', { name: /rechercher/i }), 'introuvable')

    expect(screen.getByText('Aucun résultat.')).toBeInTheDocument()
    expect(within(screen.getByText('Aucun résultat.').closest('div') as HTMLElement).getByText(/essayez un autre mot-clé/i)).toBeInTheDocument()
  })
})
