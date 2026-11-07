import { act, renderHook, waitFor } from '@testing-library/react'
import { render, screen, fireEvent, waitFor as waitForDOM } from '@testing-library/react'
import { DocumentHeader } from '@/components/DocumentHeader'
import type { Document } from '@/types'

// Mock window.confirm
global.confirm = jest.fn(() => true)

// Create a mock store
const mockStore = {
  documents: [
    {
      id: 'doc-1',
      title: 'Test Document',
      icon: '📄',
      coverImage: { type: 'color', value: '#1a1a2e' },
      parentId: null,
      isArchived: false,
      isFavorite: false,
      isDeleted: false,
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
      content: '',
      slug: 'test-document',
    },
  ],
  updateDocument: jest.fn(),
  toggleFavorite: jest.fn(),
  toggleArchive: jest.fn(),
  deleteDocument: jest.fn(),
  restoreDocument: jest.fn(),
  createDocument: jest.fn(),
}

// Mock the document store
jest.mock('@/store/documentStore', () => ({
  useDocumentStore: () => mockStore,
}))

const mockDocument: Document = {
  id: 'doc-1',
  title: 'Test Document',
  icon: '📄',
  coverImage: { type: 'color', value: '#1a1a2e' },
  parentId: null,
  isArchived: false,
  isFavorite: false,
  isDeleted: false,
  createdAt: Date.now() - 86400000,
  updatedAt: Date.now() - 86400000,
  content: '',
  slug: 'test-document',
}

describe('DocumentHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('renders document title', () => {
    render(<DocumentHeader document={mockDocument} />)
    expect(screen.getByText('Test Document')).toBeInTheDocument()
  })

  it('renders document icon', () => {
    render(<DocumentHeader document={mockDocument} />)
    expect(screen.getByText('📄')).toBeInTheDocument()
  })

  it('renders cover image banner', () => {
    render(<DocumentHeader document={mockDocument} />)
    const banner = screen.getByTestId('cover-banner')
    expect(banner).toBeInTheDocument()
    expect(banner).toHaveStyle({ backgroundColor: '#1a1a2e' })
  })

  it('shows favorite button', () => {
    render(<DocumentHeader document={mockDocument} />)
    const favoriteBtn = screen.getByLabelText('Add to favorites')
    expect(favoriteBtn).toBeInTheDocument()
  })

  it('toggles favorite when clicked', () => {
    render(<DocumentHeader document={mockDocument} />)
    const favoriteBtn = screen.getByLabelText('Add to favorites')
    fireEvent.click(favoriteBtn)
    
    expect(mockStore.toggleFavorite).toHaveBeenCalledWith('doc-1')
  })

  it('shows action dropdown', () => {
    render(<DocumentHeader document={mockDocument} />)
    const moreBtn = screen.getByLabelText('More actions')
    fireEvent.click(moreBtn)
    
    expect(screen.getByRole('menuitem', { name: /duplicate/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /add to favorites/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /move to archive/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /move to trash/i })).toBeInTheDocument()
  })

  it('allows editing title', () => {
    render(<DocumentHeader document={mockDocument} />)
    
    // Click on title to edit
    const title = screen.getByText('Test Document')
    fireEvent.click(title)
    
    const input = screen.getByDisplayValue('Test Document')
    expect(input).toBeInTheDocument()
    expect(input).toHaveFocus()
  })

  it('saves title on blur', async () => {
    render(<DocumentHeader document={mockDocument} />)
    
    const title = screen.getByText('Test Document')
    fireEvent.click(title)
    
    const input = screen.getByDisplayValue('Test Document')
    fireEvent.change(input, { target: { value: 'Updated Title' } })
    fireEvent.blur(input)
    
    await waitForDOM(() => {
      expect(mockStore.updateDocument).toHaveBeenCalledWith('doc-1', { title: 'Updated Title' })
    })
  })

  it('shows trash state for deleted documents', () => {
    const deletedDoc = { ...mockDocument, isDeleted: true, deletedAt: Date.now() }
    render(<DocumentHeader document={deletedDoc} />)
    
    expect(screen.getByText('Trash')).toBeInTheDocument()
    
    const moreBtn = screen.getByLabelText('More actions')
    fireEvent.click(moreBtn)
    
    // Check for the restore option
    expect(screen.getByRole('menuitem', { name: /restore/i })).toBeInTheDocument()
  })

  it('shows archive state for archived documents', () => {
    const archivedDoc = { 
      ...mockDocument, 
      isArchived: true,
      coverImage: { type: 'color' as const, value: '#1a1a2e' }
    }
    render(<DocumentHeader document={archivedDoc} />)
    
    expect(screen.getByText('Archive')).toBeInTheDocument()
    
    const moreBtn = screen.getByLabelText('More actions')
    fireEvent.click(moreBtn)
    
    expect(screen.getByRole('menuitem', { name: /restore from archive/i })).toBeInTheDocument()
  })

  it('opens icon picker when icon is clicked', () => {
    render(<DocumentHeader document={mockDocument} />)
    
    const iconBtn = screen.getByLabelText('Change icon')
    fireEvent.click(iconBtn)
    
    expect(screen.getByRole('dialog', { name: /select icon/i })).toBeInTheDocument()
  })

  it('opens cover picker when cover button is clicked', () => {
    render(<DocumentHeader document={mockDocument} />)
    
    const coverBtn = screen.getByLabelText('Change cover')
    fireEvent.click(coverBtn)
    
    expect(screen.getByRole('dialog', { name: /change cover/i })).toBeInTheDocument()
  })

  it('renders null when document is null', () => {
    const { container } = render(<DocumentHeader document={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows favorite as filled when isFavorite is true', () => {
    const favoriteDoc = { ...mockDocument, isFavorite: true }
    render(<DocumentHeader document={favoriteDoc} />)
    
    const favoriteBtn = screen.getByLabelText('Remove from favorites')
    expect(favoriteBtn).toBeInTheDocument()
    const star = favoriteBtn.querySelector('svg')
    expect(star).toHaveClass('fill-current')
  })

  it('has proper accessibility attributes', () => {
    render(<DocumentHeader document={mockDocument} />)
    
    const title = screen.getByText('Test Document')
    expect(title).toHaveAttribute('tabIndex', '0')
    
    const moreBtn = screen.getByLabelText('More actions')
    expect(moreBtn).toHaveAttribute('aria-haspopup', 'menu')
    expect(moreBtn).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows export options in action menu', () => {
    render(<DocumentHeader document={mockDocument} />)
    const moreBtn = screen.getByLabelText('More actions')
    fireEvent.click(moreBtn)
    
    expect(screen.getByRole('menuitem', { name: /export as markdown/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /export as json/i })).toBeInTheDocument()
  })
})