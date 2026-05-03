import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AdminEvent, AdminPartner } from '@/lib/types'

const { refreshMock, addPhotosMock, updatePartnerLogoMock } = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  addPhotosMock: vi.fn(),
  updatePartnerLogoMock: vi.fn(),
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

describe('admin management panels', () => {
  beforeEach(() => {
    refreshMock.mockClear()
    addPhotosMock.mockClear()
    updatePartnerLogoMock.mockClear()
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
})
