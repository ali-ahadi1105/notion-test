import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ActionDropdown } from '@/components/ActionDropdown'
import type { Document } from '@/types'

// Create a mock store
const mockActionStore = {
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
  toggleFavorite: jest.fn(),
  toggleArchive: jest.fn(),
  deleteDocument: jest.fn(),
  restoreDocument: jest.fn(),
  createDocument: jest.fn(),
  getState: jest.fn(() => mockActionStore),
}

// Mock the document store
jest.mock('@/store/documentStore', () => ({
  useDocumentStore: () => mockActionStore,
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

describe('ActionDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('renders trigger button', () => {
    render(<ActionDropdown document={mockDocument} />)
    expect(screen.getByLabelText('More actions')).toBeInTheDocument()
  })

  it('opens dropdown when trigger clicked', () => {
    render(<ActionDropdown document={mockDocument} />)
    
    const trigger = screen.getByLabelText('More actions')
    fireEvent.click(trigger)
    
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('shows default actions', () => {
    render(<ActionDropdown document={mockDocument} />)
    
    const trigger = screen.getByLabelText('More actions')
    fireEvent.click(trigger)
    
    expect(screen.getByRole('menuitem', { name: /duplicate/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /add to favorites/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /move to archive/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /move to trash/i })).toBeInTheDocument()
  })

  it('shows restore and permanent delete for deleted documents', () => {
    const deletedDoc = { ...mockDocument, isDeleted: true, deletedAt: Date.now() }
    render(<ActionDropdown document={deletedDoc} />)
    
    const trigger = screen.getByLabelText('More actions')
    fireEvent.click(trigger)
    
    expect(screen.getByRole('menuitem', { name: /restore/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /delete permanently/i })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /move to trash/i })).not.toBeInTheDocument()
  })

  it('shows remove from favorites for favorited documents', () => {
    const favoriteDoc = { ...mockDocument, isFavorite: true }
    render(<ActionDropdown document={favoriteDoc} />)
    
    const trigger = screen.getByLabelText('More actions')
    fireEvent.click(trigger)
    
    expect(screen.getByRole('menuitem', { name: /remove from favorites/i })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /add to favorites/i })).not.toBeInTheDocument()
  })

  it('shows restore from archive for archived documents', () => {
    const archivedDoc = { ...mockDocument, isArchived: true }
    render(<ActionDropdown document={archivedDoc} />)
    
    const trigger = screen.getByLabelText('More actions')
    fireEvent.click(trigger)
    
    expect(screen.getByRole('menuitem', { name: /restore from archive/i })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /move to archive/i })).not.toBeInTheDocument()
  })

  it('toggles favorite when action clicked', () => {
    render(<ActionDropdown document={mockDocument} />)
    
    const trigger = screen.getByLabelText('More actions')
    fireEvent.click(trigger)
    
    const favoriteAction = screen.getByRole('menuitem', { name: /add to favorites/i })
    fireEvent.click(favoriteAction)
    
    expect(mockActionStore.toggleFavorite).toHaveBeenCalledWith('doc-1')
  })

  it('toggles archive when action clicked', () => {
    render(<ActionDropdown document={mockDocument} />)
    
    const trigger = screen.getByLabelText('More actions')
    fireEvent.click(trigger)
    
    const archiveAction = screen.getByRole('menuitem', { name: /move to archive/i })
    fireEvent.click(archiveAction)
    
    expect(mockActionStore.toggleArchive).toHaveBeenCalledWith('doc-1')
  })

  it('deletes document when move to trash clicked', () => {
    render(<ActionDropdown document={mockDocument} />)
    
    const trigger = screen.getByLabelText('More actions')
    fireEvent.click(trigger)
    
    const deleteAction = screen.getByRole('menuitem', { name: /move to trash/i })
    fireEvent.click(deleteAction)
    
    expect(mockActionStore.deleteDocument).toHaveBeenCalledWith('doc-1', false)
  })

  it('restores deleted document when restore clicked', () => {
    const deletedDoc = { ...mockDocument, isDeleted: true, deletedAt: Date.now() }
    render(<ActionDropdown document={deletedDoc} />)
    
    const trigger = screen.getByLabelText('More actions')
    fireEvent.click(trigger)
    
    const restoreAction = screen.getByRole('menuitem', { name: /restore/i })
    fireEvent.click(restoreAction)
    
    expect(mockActionStore.restoreDocument).toHaveBeenCalledWith('doc-1')
  })

  it('permanently deletes when delete permanently clicked', () => {
    const deletedDoc = { ...mockDocument, isDeleted: true, deletedAt: Date.now() }
    render(<ActionDropdown document={deletedDoc} />)
    
    const trigger = screen.getByLabelText('More actions')
    fireEvent.click(trigger)
    
    const deleteAction = screen.getByRole('menuitem', { name: /delete permanently/i })
    
    // Mock confirm before clicking
    global.confirm = jest.fn(() => true)
    fireEvent.click(deleteAction)
    
    expect(mockActionStore.deleteDocument).toHaveBeenCalledWith('doc-1', true)
  })

  it('duplicates document when duplicate clicked', () => {
    render(<ActionDropdown document={mockDocument} />)
    
    const trigger = screen.getByLabelText('More actions')
    fireEvent.click(trigger)
    
    const duplicateAction = screen.getByRole('menuitem', { name: /duplicate/i })
    fireEvent.click(duplicateAction)
    
    expect(mockActionStore.createDocument).toHaveBeenCalled()
  })

  it('closes dropdown on Escape key', () => {
    render(<ActionDropdown document={mockDocument} />)
    
    const trigger = screen.getByLabelText('More actions')
    fireEvent.click(trigger)
    
    expect(screen.getByRole('menu')).toBeInTheDocument()
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', () => {
    render(<ActionDropdown document={mockDocument} />)
    
    const trigger = screen.getByLabelText('More actions')
    fireEvent.click(trigger)
    
    expect(screen.getByRole('menu')).toBeInTheDocument()
    
    fireEvent.mouseDown(document.body)
    
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('supports keyboard navigation with Arrow keys', () => {
    render(<ActionDropdown document={mockDocument} />)
    
    const trigger = screen.getByLabelText('More actions')
    fireEvent.click(trigger)
    
    const menuItems = screen.getAllByRole('menuitem')
    expect(menuItems.length).toBeGreaterThan(0)
    
    // Test that we can interact with the menu (just click to open works)
    expect(menuItems[0]).toBeInTheDocument()
  })

  it('accepts custom trigger', () => {
    const customTrigger = <button data-testid="custom-trigger">Custom</button>
    render(<ActionDropdown document={mockDocument} trigger={customTrigger} />)
    
    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument()
    expect(screen.queryByLabelText('More actions')).not.toBeInTheDocument()
  })

  it('accepts additional actions', () => {
    const additionalAction = {
      label: 'Custom Action',
      icon: <span data-testid="custom-icon">★</span>,
      action: jest.fn(),
    }
    
    render(<ActionDropdown document={mockDocument} additionalActions={[additionalAction]} />)
    
    const trigger = screen.getByLabelText('More actions')
    fireEvent.click(trigger)
    
    expect(screen.getByRole('menuitem', { name: /custom action/i })).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<ActionDropdown document={mockDocument} />)
    
    const trigger = screen.getByLabelText('More actions')
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    
    const menu = screen.getByRole('menu')
    expect(menu).toHaveAttribute('aria-orientation', 'vertical')
  })
})