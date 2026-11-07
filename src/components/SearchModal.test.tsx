import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { SearchModal } from '@/components/SearchModal'
import { useDocumentStore } from '@/store/documentStore'
import { useSidebarStore } from '@/store/sidebarStore'
import type { Document, Block } from '@/types'

// Mock the stores
jest.mock('@/store/documentStore', () => ({
  useDocumentStore: jest.fn(),
}))

jest.mock('@/store/sidebarStore', () => ({
  useSidebarStore: jest.fn(),
}))

const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    title: 'Getting Started',
    icon: '📖',
    coverImage: { type: 'color', value: '#1a1a2e' },
    parentId: null,
    isArchived: false,
    isFavorite: false,
    isDeleted: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    blocks: [
      { id: 'block-1', type: 'paragraph', content: 'Welcome to the getting started guide', createdAt: Date.now(), updatedAt: Date.now() },
      { id: 'block-2', type: 'heading1', content: 'Introduction', createdAt: Date.now(), updatedAt: Date.now() },
    ],
    slug: 'getting-started',
  },
  {
    id: 'doc-2',
    title: 'Advanced Features',
    icon: '⚡',
    coverImage: { type: 'color', value: '#16213e' },
    parentId: null,
    isArchived: false,
    isFavorite: true,
    isDeleted: false,
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 172800000,
    blocks: [
      { id: 'block-3', type: 'paragraph', content: 'Learn about advanced features and customization', createdAt: Date.now(), updatedAt: Date.now() },
    ],
    slug: 'advanced-features',
  },
  {
    id: 'doc-3',
    title: 'API Reference',
    icon: '📚',
    coverImage: { type: 'color', value: '#0f3460' },
    parentId: 'doc-1',
    isArchived: false,
    isFavorite: false,
    isDeleted: false,
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 259200000,
    blocks: [],
    slug: 'getting-started/api-reference',
  },
  {
    id: 'doc-4',
    title: 'Archived Page',
    icon: '📦',
    coverImage: { type: 'color', value: '#2c3e50' },
    parentId: null,
    isArchived: true,
    isFavorite: false,
    isDeleted: false,
    createdAt: Date.now() - 345600000,
    updatedAt: Date.now() - 345600000,
    blocks: [],
    slug: 'archived-page',
  },
  {
    id: 'doc-5',
    title: 'Deleted Page',
    icon: '🗑️',
    coverImage: { type: 'color', value: '#8b0000' },
    parentId: null,
    isArchived: false,
    isFavorite: false,
    isDeleted: true,
    deletedAt: Date.now() - 100000,
    createdAt: Date.now() - 432000000,
    updatedAt: Date.now() - 432000000,
    blocks: [],
    slug: 'deleted-page',
  },
]

const mockSetActivePage = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  ;(useDocumentStore as jest.Mock).mockReturnValue({ documents: mockDocuments })
  ;(useSidebarStore as jest.Mock).mockReturnValue({ setActivePage: mockSetActivePage })
})

describe('SearchModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSelectDocument: jest.fn(),
  }

  it('renders search modal when isOpen is true', () => {
    render(<SearchModal {...defaultProps} />)
    expect(screen.getByRole('dialog', { name: 'Quick Search' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search pages... (⌘K)')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<SearchModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog', { name: 'Quick Search' })).not.toBeInTheDocument()
  })

  it('shows empty state when query is empty', () => {
    render(<SearchModal {...defaultProps} />)
    expect(screen.getByText('Start typing to search across all pages')).toBeInTheDocument()
    expect(screen.getByText('Searches titles and content')).toBeInTheDocument()
  })

  it('filters results by title match', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search pages... (⌘K)')
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Getting' } })
    })
    
    await waitFor(() => {
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
    })
    expect(screen.queryByText('Advanced Features')).not.toBeInTheDocument()
  })

  it('filters results by content match', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search pages... (⌘K)')
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'advanced' } })
    })
    
    await waitFor(() => {
      expect(screen.getByText('Advanced Features')).toBeInTheDocument()
    })
    expect(screen.queryByText('Getting Started')).not.toBeInTheDocument()
  })

  it('shows match count for documents with content matches', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search pages... (⌘K)')
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Welcome' } })
    })
    
    await waitFor(() => {
      expect(screen.getByText('1 match')).toBeInTheDocument()
    })
  })

  it('excludes archived documents from results', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search pages... (⌘K)')
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Archived' } })
    })
    
    await waitFor(() => {
      expect(screen.getByText('No results for "Archived"')).toBeInTheDocument()
    })
  })

  it('excludes deleted documents from results', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search pages... (⌘K)')
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Deleted' } })
    })
    
    await waitFor(() => {
      expect(screen.getByText('No results for "Deleted"')).toBeInTheDocument()
    })
  })

  it('shows favorite indicator for favorited documents', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search pages... (⌘K)')
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Advanced' } })
    })
    
    await waitFor(() => {
      const favoriteIcon = screen.getByLabelText('Favorite')
      expect(favoriteIcon).toBeInTheDocument()
    })
  })

  it('calls onSelectDocument when a result is clicked', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search pages... (⌘K)')
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Getting' } })
    })
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Getting Started'))
    })
    
    expect(defaultProps.onSelectDocument).toHaveBeenCalledWith('doc-1')
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('closes on Escape key', async () => {
    render(<SearchModal {...defaultProps} />)
    
    // The Escape key is handled by the inner modal div's onKeyDown handler
    // Get the inner modal element (the one with onKeyDown)
    const modal = screen.getByRole('dialog', { name: 'Quick Search' })
    // The modal structure: outer div -> backdrop -> inner modal div (with onKeyDown) -> content
    const innerModal = modal.children[1] as HTMLElement
    
    await act(async () => {
      fireEvent.keyDown(innerModal, { key: 'Escape' })
    })
    
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('navigates results with arrow keys', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search pages... (⌘K)')
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Getting' } })
    })
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
    })
    
    // Arrow down should select the first result
    await act(async () => {
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' })
    })
    
    // Arrow up should wrap around
    await act(async () => {
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowUp' })
    })
  })

  it('opens selected document on Enter key', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search pages... (⌘K)')
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Getting' } })
    })
    
    await waitFor(() => {
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
    })
    
    await act(async () => {
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Enter' })
    })
    
    expect(defaultProps.onSelectDocument).toHaveBeenCalledWith('doc-1')
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('shows document slug in results', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search pages... (⌘K)')
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'API' } })
    })
    
    await waitFor(() => {
      expect(screen.getByText('getting-started/api-reference')).toBeInTheDocument()
    })
  })

  it('shows indexed pages count in footer', () => {
    render(<SearchModal {...defaultProps} />)
    expect(screen.getByText('3 pages indexed')).toBeInTheDocument()
  })

  it('clears query when clear button is clicked', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search pages... (⌘K)')
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Getting' } })
    })
    
    await waitFor(() => {
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
    })
    
    // Click clear button
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Clear search'))
    })
    
    expect(input).toHaveValue('')
    expect(screen.getByText('Start typing to search across all pages')).toBeInTheDocument()
  })
})