import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AdminEvent, AdminFormation, AdminPartner } from '@/lib/types'

const { refreshMock, addPhotosMock, updatePartnerLogoMock, createFormationMock, updateFormationSupportMock, clearFormationSupportMock } = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  addPhotosMock: vi.fn(),
  updatePartnerLogoMock: vi.fn(),
  createFormationMock: vi.fn(),
  updateFormationSupportMock: vi.fn(),
  clearFormationSupportMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock, push: vi.fn() }),
}))

vi.mock('@/app/admin/actions/events', () => ({
  deleteEvent: vi.fn(),
  reorderEvents: vi.fn(),
  updateEvent: vi.fn(),
  updateEventImage: vi.fn(),
  createHighlight: vi.fn(),
  updateHighlight: vi.fn(),
  deleteHighlight: vi.fn(),
  reorderHighlights: vi.fn(),
  addPhoto: vi.fn(),
  addPhotos: addPhotosMock,
  deletePhoto: vi.fn(),
  reorderPhotos: vi.fn(),
  updatePhotoCaption: vi.fn(),
}))

vi.mock('@/app/admin/actions/partners', () => ({
  updatePartner: vi.fn(),
  deletePartner: vi.fn(),
  reorderPartners: vi.fn(),
  updatePartnerLogo: updatePartnerLogoMock,
  createPartnerWithLogoUrl: vi.fn(),
}))

vi.mock('@/app/admin/actions/formations', () => ({
  createFormation: createFormationMock,
  updateFormation: vi.fn(),
  deleteFormation: vi.fn(),
  updateFormationSupport: updateFormationSupportMock,
  clearFormationSupport: clearFormationSupportMock,
}))

vi.mock('@/components/admin/sortable-list', () => ({
  SortableList: <T extends { id: string }>({
    items,
    renderItem,
  }: {
    items: T[]
    renderItem: (item: T, dragHandleProps: object) => React.ReactNode
  }) => <div>{items.map((item) => <div key={item.id}>{renderItem(item, {})}</div>)}</div>,
}))

const event: AdminEvent = {
  id: 'event-1',
  title: 'Conférence finance',
  date: '2026-05-20',
  partner: 'BNP',
  partner_description: 'Banque partenaire',
  pole: 'Markets',
  description: 'Description',
  image_url: null,
  status: 'upcoming',
  order_index: 0,
  highlights: [],
  photos: [],
}

const partner: AdminPartner = {
  id: 'partner-1',
  name: 'Goldman Sachs',
  logo_url: '/partners/gs.png',
  order_index: 0,
}

const formation: AdminFormation = {
  id: 'formation-1',
  title: 'Introduction aux dérivés',
  date: '2026-02-10',
  category: 'Marchés',
  description: 'Pricing, couverture et cas pratiques.',
  speaker_name: 'Antoine R.',
  speaker_role: 'Responsable Marchés',
  support_url: null,
  support_filename: null,
  order_index: 0,
}

const formationWithSupport: AdminFormation = {
  ...formation,
  support_url: 'https://example.com/support.pdf',
  support_filename: 'support.pdf',
}

describe('admin management panels', () => {
  beforeEach(() => {
    refreshMock.mockClear()
    addPhotosMock.mockClear()
    updatePartnerLogoMock.mockClear()
    createFormationMock.mockClear()
    updateFormationSupportMock.mockClear()
    clearFormationSupportMock.mockClear()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('opens event editing in a right side panel from the events tab', async () => {
    const user = userEvent.setup()
    const { EvenementsTab } = await import('@/components/admin/tabs/evenements-tab')

    render(<EvenementsTab events={[event]} />)
    await user.click(screen.getByRole('button', { name: /éditer conférence finance/i }))

    const panel = screen.getByRole('complementary', { name: /édition événement/i })
    expect(panel).toBeInTheDocument()
    expect(panel).toHaveTextContent('Conférence finance')
    expect(panel.querySelector('textarea[name="description"]')).toHaveClass('resize-y')
  })

  it('uploads several event photos before refreshing the admin data', async () => {
    const { ImageUpload } = await import('@/components/admin/image-upload')
    const fetchMock = vi.mocked(fetch)
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: 'https://example.com/a.jpg' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: 'https://example.com/b.jpg' }), { status: 200 }))
    const fileA = new File(['a'], 'a.jpg', { type: 'image/jpeg' })
    const fileB = new File(['b'], 'b.jpg', { type: 'image/jpeg' })
    const onUpload = vi.fn(async (urls: string[]) => {
      await addPhotosMock('event-1', urls.map((url) => ({ url })))
    })

    render(<ImageUpload label="Ajouter des photos" multiple onUpload={onUpload} />)
    fireEvent.change(screen.getByLabelText('Ajouter des photos'), { target: { files: [fileA, fileB] } })

    await waitFor(() => expect(onUpload).toHaveBeenCalledWith([
      'https://example.com/a.jpg',
      'https://example.com/b.jpg',
    ]))
    expect(addPhotosMock).toHaveBeenCalledWith('event-1', [
      { url: 'https://example.com/a.jpg' },
      { url: 'https://example.com/b.jpg' },
    ])
    expect(refreshMock).toHaveBeenCalledTimes(1)
  })

  it('opens partner editing in a right side panel from the partners tab', async () => {
    const user = userEvent.setup()
    const { PartenairesTab } = await import('@/components/admin/tabs/partenaires-tab')

    render(<PartenairesTab partners={[partner]} />)
    await user.click(screen.getByRole('button', { name: /éditer goldman sachs/i }))

    const panel = screen.getByRole('complementary', { name: /édition partenaire/i })
    expect(panel).toBeInTheDocument()
    expect(panel).toHaveTextContent('Goldman Sachs')
    expect(panel.querySelector('img')).toHaveAttribute('src', '/partners/gs.png')
  })

  it('opens formation editing in a right side panel from the formations tab', async () => {
    const user = userEvent.setup()
    const { FormationsTab } = await import('@/components/admin/tabs/formations-tab')

    render(<FormationsTab formations={[formation]} />)
    await user.click(screen.getByRole('button', { name: /éditer introduction aux dérivés/i }))

    const panel = screen.getByRole('complementary', { name: /édition formation/i })
    expect(panel).toBeInTheDocument()
    expect(panel).toHaveTextContent('Introduction aux dérivés')
    expect(panel.querySelector('textarea[name="description"]')).toHaveClass('resize-y')
  })

  it('uploads one document support and passes filename metadata', async () => {
    const { FileUpload } = await import('@/components/admin/file-upload')
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ url: 'https://example.com/support.pdf' }), { status: 200 }))
    const support = new File(['support'], 'formation.pdf', { type: 'application/pdf' })
    const onUpload = vi.fn(async (payload: { url: string; filename: string; mimeType: string }) => {
      await updateFormationSupportMock('formation-1', payload)
    })

    render(<FileUpload label="Support" onUpload={onUpload} />)
    fireEvent.change(screen.getByLabelText('Support'), { target: { files: [support] } })

    await waitFor(() => expect(onUpload).toHaveBeenCalledWith({
      url: 'https://example.com/support.pdf',
      filename: 'formation.pdf',
      mimeType: 'application/pdf',
    }))
    expect(updateFormationSupportMock).toHaveBeenCalledWith('formation-1', {
      url: 'https://example.com/support.pdf',
      filename: 'formation.pdf',
      mimeType: 'application/pdf',
    })
    expect(refreshMock).toHaveBeenCalledTimes(1)
  })

  it('lets admins attach a PDF support while creating a formation', async () => {
    const { FormationsTab } = await import('@/components/admin/tabs/formations-tab')
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ url: 'https://example.com/new-support.pdf' }), { status: 200 }))
    const support = new File(['support'], 'new-support.pdf', { type: 'application/pdf' })

    render(<FormationsTab formations={[]} />)
    fireEvent.change(screen.getByLabelText('Support de la formation'), { target: { files: [support] } })

    await waitFor(() => {
      expect(screen.getByDisplayValue('https://example.com/new-support.pdf')).toBeInTheDocument()
      expect(screen.getByDisplayValue('new-support.pdf')).toBeInTheDocument()
    })
  })

  it('clears an attached PDF from the formation editor', async () => {
    const user = userEvent.setup()
    const { FormationsTab } = await import('@/components/admin/tabs/formations-tab')

    render(<FormationsTab formations={[formationWithSupport]} />)
    await user.click(screen.getByRole('button', { name: /éditer introduction aux dérivés/i }))
    await user.click(screen.getByRole('button', { name: /retirer le support/i }))

    await waitFor(() => expect(clearFormationSupportMock).toHaveBeenCalledWith('formation-1'))
    expect(refreshMock).toHaveBeenCalled()
  })

  it('clears the creation form PDF after creating the formation', async () => {
    const user = userEvent.setup()
    const { FormationsTab } = await import('@/components/admin/tabs/formations-tab')
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ url: 'https://example.com/new-support.pdf' }), { status: 200 }))
    const support = new File(['support'], 'new-support.pdf', { type: 'application/pdf' })

    render(<FormationsTab formations={[]} />)
    fireEvent.change(screen.getByLabelText('Support de la formation'), { target: { files: [support] } })
    await screen.findByText('new-support.pdf')

    await user.type(screen.getByLabelText('Titre'), 'Nouvelle formation')
    await user.type(screen.getByLabelText('Date'), '2026-02-10')
    await user.type(screen.getByLabelText('Catégorie'), 'Marchés')
    await user.type(screen.getByLabelText('Description'), 'Description de la formation')
    await user.type(screen.getByLabelText('Intervenant'), 'Antoine R.')
    await user.type(screen.getByLabelText('Rôle'), 'Responsable Marchés')
    fireEvent.submit(screen.getByRole('button', { name: /créer la formation/i }).closest('form') as HTMLFormElement)

    await waitFor(() => expect(createFormationMock).toHaveBeenCalled())
    await waitFor(() => expect(screen.queryByText('new-support.pdf')).not.toBeInTheDocument())
    expect(document.querySelector('input[name="support_url"]')).toHaveAttribute('value', '')
  })
})
