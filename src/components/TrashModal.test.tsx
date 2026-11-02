import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TrashModal } from '@/components/TrashModal'
import type { Document } from '@/types'

// Mock window.confirm
global.confirm = jest.fn(() => true)

// Create a mock store
const mockTrashItems: Document[] = [
  {
    id: 'doc-1',
    title: 'Document 1',
    icon: '📄',
    coverImage: { type: 'color', value: '#1a1a2e' },
    parentId: null,
    isArchived: false,
    isFavorite: false,
    isDeleted: true,
    deletedAt: Date.now() - 86400000,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000,
    content: '',
    slug: 'document-1',
  },
  {
    id: 'doc-2',
    title: 'Document 2',
    icon: '📝',
    coverImage: { type: 'color', value: '#16213e' },
    parentId: 'doc-1',
    isArchived: false,
    isFavorite: true,
    isDeleted: true,
    deletedAt: Date.now() - 172800000,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 172800000,
    content: '',
    slug: 'document-1/document-2',
  },
  {
    id: 'doc-3',
    title: 'Old Document',
    icon: '📋',
    coverImage: { type: 'color', value: '#0f3460' },
    parentId: null,
    isArchived: false,
    isFavorite: false,
    isDeleted: true,
    deletedAt: Date.now() - 30 * 86400000,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 30 * 86400000,
    content: '',
    slug: 'old-document',
  },
]

const mockStore = {
  documents: [...mockTrashItems],
  getTrash: jest.fn(() => mockTrashItems),
  restoreDocument: jest.fn(),
  deleteDocument: jest.fn(),
  emptyTrash: jest.fn(),
}

// Mock the document store
jest.mock('@/store/documentStore', () => ({
  useDocumentStore: () => mockStore,
}))

describe('TrashModal', () => {
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<TrashModal isOpen={false} onClose={onClose} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders modal when isOpen is true', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    expect(screen.getByRole('dialog', { name: /trash/i })).toBeInTheDocument()
  })

  it('shows trash item count in header', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    expect(screen.getByText('3 items')).toBeInTheDocument()
  })

  it('shows empty state when no trash items', () => {
    // Create a fresh mock store with empty documents
    const originalGetTrash = mockStore.getTrash
    mockStore.getTrash = jest.fn(() => [])
    
    render(<TrashModal isOpen={true} onClose={onClose} />)
    expect(screen.getByText('Trash is empty')).toBeInTheDocument()
    
    mockStore.getTrash = originalGetTrash
  })

  it('displays all trash items', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    expect(screen.getByText('Document 1')).toBeInTheDocument()
    expect(screen.getByText('Document 2')).toBeInTheDocument()
    expect(screen.getByText('Old Document')).toBeInTheDocument()
  })

  it('shows delete time for each item', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    const deleteTimes = screen.getAllByText(/deleted/i)
    expect(deleteTimes.length).toBe(3)
  })

  it('shows favorite indicator for favorited items', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    const favoriteIcon = screen.getByLabelText('Favorite')
    expect(favoriteIcon).toBeInTheDocument()
  })

  it('filters items by search query', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    
    const searchInput = screen.getByPlaceholderText('Search trash...')
    fireEvent.change(searchInput, { target: { value: 'Document 1' } })
    
    expect(screen.getByText('Document 1')).toBeInTheDocument()
    expect(screen.queryByText('Document 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Old Document')).not.toBeInTheDocument()
  })

  it('filters items by date filter', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    
    const filterSelect = screen.getByLabelText('Filter by date')
    fireEvent.change(filterSelect, { target: { value: 'recent' } })
    
    // Should show only recent items (last 7 days)
    expect(screen.getByText('Document 1')).toBeInTheDocument()
    expect(screen.getByText('Document 2')).toBeInTheDocument()
  })

  it('restores item when restore button clicked', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    
    const restoreBtns = screen.getAllByLabelText('Restore')
    fireEvent.click(restoreBtns[0])
    
    expect(mockStore.restoreDocument).toHaveBeenCalledWith('doc-1')
  })

  it('deletes item permanently when delete button clicked', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    
    const deleteBtns = screen.getAllByLabelText('Delete permanently')
    fireEvent.click(deleteBtns[0])
    
    expect(mockStore.deleteDocument).toHaveBeenCalledWith('doc-1', true)
  })

  it('selects item when checkbox clicked', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    
    const checkboxes = screen.getAllByLabelText('Select')
    fireEvent.click(checkboxes[0])
    
    expect(screen.getByText('1 item selected')).toBeInTheDocument()
  })

  it('shows bulk actions when items selected', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    
    const checkboxes = screen.getAllByLabelText('Select')
    fireEvent.click(checkboxes[0])
    
    // Bulk actions buttons appear in the footer
    const restoreBtns = screen.getAllByRole('button', { name: /^restore$/i })
    const deleteBtns = screen.getAllByRole('button', { name: /delete permanently/i })
    expect(restoreBtns.length).toBeGreaterThan(1) // Individual + bulk
    expect(deleteBtns.length).toBeGreaterThan(1) // Individual + bulk
  })

  it('restores selected items', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    
    const checkboxes = screen.getAllByLabelText('Select')
    fireEvent.click(checkboxes[0])
    
    // The bulk actions button is the one in the footer (after the individual restore buttons)
    const restoreBtns = screen.getAllByRole('button', { name: /^restore$/i })
    // The last one is the bulk actions button
    fireEvent.click(restoreBtns[restoreBtns.length - 1])
    
    expect(mockStore.restoreDocument).toHaveBeenCalledWith('doc-1')
  })

  it('deletes selected items permanently', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    
    const checkboxes = screen.getAllByLabelText('Select')
    fireEvent.click(checkboxes[0])
    
    // The bulk actions button is the one in the footer (after the restore button)
    const deleteBtns = screen.getAllByRole('button', { name: /delete permanently/i })
    // The last one is the bulk actions button
    fireEvent.click(deleteBtns[deleteBtns.length - 1])
    
    expect(mockStore.deleteDocument).toHaveBeenCalledWith('doc-1', true)
  })

  it('empties trash when empty trash button clicked', async () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    
    const emptyBtn = screen.getByRole('button', { name: /empty trash/i })
    fireEvent.click(emptyBtn)
    
    // Wait for setTimeout to complete
    await waitFor(() => {
      expect(mockStore.emptyTrash).toHaveBeenCalled()
    })
  })

  it('closes modal when close button clicked', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    
    const closeBtn = screen.getByLabelText('Close trash')
    fireEvent.click(closeBtn)
    
    expect(onClose).toHaveBeenCalled()
  })

  it('closes modal when backdrop clicked', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    
    const backdrop = screen.getByTestId('modal-backdrop')
    fireEvent.click(backdrop)
    
    expect(onClose).toHaveBeenCalled()
  })

  it('closes modal on Escape key', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(onClose).toHaveBeenCalled()
  })

  it('has proper accessibility attributes', () => {
    render(<TrashModal isOpen={true} onClose={onClose} />)
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'trash-modal-title')
  })
})