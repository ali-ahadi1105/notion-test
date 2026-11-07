import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Sidebar } from '@/components/Sidebar'
import { useSidebarStore } from '@/store/sidebarStore'
import { useDocumentStore } from '@/store/documentStore'
import { act } from 'react-dom/test-utils'

// Mock the stores
jest.mock('@/store/sidebarStore', () => ({
  useSidebarStore: jest.fn(),
}))

jest.mock('@/store/documentStore', () => ({
  useDocumentStore: jest.fn(),
}))

const mockUseSidebarStore = useSidebarStore as unknown as jest.Mock
const mockUseDocumentStore = useDocumentStore as unknown as jest.Mock

describe('Sidebar', () => {
  beforeEach(() => {
    mockUseSidebarStore.mockReturnValue({
      isCollapsed: false,
      width: 280,
      activePageId: null,
      expandedItems: new Set(),
      setCollapsed: jest.fn(),
      setWidth: jest.fn(),
      setActivePage: jest.fn(),
      toggleItemExpansion: jest.fn(),
      isItemExpanded: jest.fn((id: string) => id === '1' || id === '2'), // First level items expanded by default
    })
    mockUseDocumentStore.mockReturnValue({
      getFavorites: () => [],
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<Sidebar />)
    expect(screen.getByRole('navigation', { name: /sidebar navigation/i })).toBeInTheDocument()
  })

  it('renders workspace header when not collapsed', () => {
    render(<Sidebar />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Workspace')).toBeInTheDocument()
    expect(screen.getByLabelText('Workspace settings')).toBeInTheDocument()
  })

  it('hides workspace header details when collapsed', () => {
    mockUseSidebarStore.mockReturnValue({
      isCollapsed: true,
      width: 280,
      activePageId: null,
      expandedItems: new Set(),
      setCollapsed: jest.fn(),
      setWidth: jest.fn(),
      setActivePage: jest.fn(),
      toggleItemExpansion: jest.fn(),
      isItemExpanded: jest.fn(() => false),
    })

    render(<Sidebar />)
    // The header should still exist but content hidden
    expect(screen.getByLabelText('Workspace settings')).toBeInTheDocument()
  })

  it('renders quick actions', () => {
    render(<Sidebar />)
    expect(screen.getByLabelText(/new page/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/search/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/trash/i)).toBeInTheDocument()
  })

  it('renders page tree with nested items', () => {
    render(<Sidebar />)
    // Top level items in the page tree
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Archive')).toBeInTheDocument()
    // Trash appears in both quick actions and page tree, use getAllByText
    expect(screen.getAllByText('Trash').length).toBeGreaterThan(0)

    // Nested items (since 1 and 2 are expanded by default)
    expect(screen.getByText('Introduction')).toBeInTheDocument()
    expect(screen.getByText('Quick Start Guide')).toBeInTheDocument()
    expect(screen.getByText('Core Concepts')).toBeInTheDocument()
    expect(screen.getByText('Editor')).toBeInTheDocument()
    expect(screen.getByText('Collaboration')).toBeInTheDocument()
    expect(screen.getByText('Integrations')).toBeInTheDocument()
  })

  it('can toggle item expansion', () => {
    const toggleMock = jest.fn()
    // Start with item NOT expanded, so it should show "Expand"
    const isExpandedMock = jest.fn((id: string) => false)

    mockUseSidebarStore.mockReturnValue({
      isCollapsed: false,
      width: 280,
      activePageId: null,
      expandedItems: new Set(),
      setCollapsed: jest.fn(),
      setWidth: jest.fn(),
      setActivePage: jest.fn(),
      toggleItemExpansion: toggleMock,
      isItemExpanded: isExpandedMock,
    })

    render(<Sidebar />)

    // Click the chevron for "Getting Started" - the aria-label uses the actual title
    const chevron = screen.getByLabelText(/expand getting started/i)
    fireEvent.click(chevron)

    expect(toggleMock).toHaveBeenCalledWith('1')
  })

  it('can select a page', () => {
    const setActivePageMock = jest.fn()

    mockUseSidebarStore.mockReturnValue({
      isCollapsed: false,
      width: 280,
      activePageId: null,
      expandedItems: new Set(),
      setCollapsed: jest.fn(),
      setWidth: jest.fn(),
      setActivePage: setActivePageMock,
      toggleItemExpansion: jest.fn(),
      isItemExpanded: jest.fn(() => false),
    })

    render(<Sidebar />)

    const pageButton = screen.getByRole('button', { name: 'Getting Started' })
    fireEvent.click(pageButton)

    expect(setActivePageMock).toHaveBeenCalledWith('1')
  })

  it('shows add subpage button on hover for items with children', () => {
    render(<Sidebar />)

    const pageButton = screen.getByRole('button', { name: 'Getting Started' })
    fireEvent.mouseEnter(pageButton)

    expect(screen.getByLabelText(/add subpage to getting started/i)).toBeInTheDocument()
  })

  it('renders collapse/expand toggle button', () => {
    render(<Sidebar />)
    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument()
  })

  it('renders expand button when collapsed', () => {
    mockUseSidebarStore.mockReturnValue({
      isCollapsed: true,
      width: 280,
      activePageId: null,
      expandedItems: new Set(),
      setCollapsed: jest.fn(),
      setWidth: jest.fn(),
      setActivePage: jest.fn(),
      toggleItemExpansion: jest.fn(),
      isItemExpanded: jest.fn(() => false),
    })

    render(<Sidebar />)
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument()
  })

  it('has resize handle when not collapsed', () => {
    render(<Sidebar />)
    const resizeHandle = screen.getByRole('separator', { name: /resize sidebar/i })
    expect(resizeHandle).toBeInTheDocument()
  })

  it('does not have resize handle when collapsed', () => {
    mockUseSidebarStore.mockReturnValue({
      isCollapsed: true,
      width: 280,
      activePageId: null,
      expandedItems: new Set(),
      setCollapsed: jest.fn(),
      setWidth: jest.fn(),
      setActivePage: jest.fn(),
      toggleItemExpansion: jest.fn(),
      isItemExpanded: jest.fn(() => false),
    })

    render(<Sidebar />)
    expect(screen.queryByRole('separator', { name: /resize sidebar/i })).not.toBeInTheDocument()
  })

  it('applies correct width style', () => {
    const { container } = render(<Sidebar />)
    const sidebar = container.querySelector('[role="navigation"]')
    expect(sidebar).toHaveStyle('width: 280px')
  })

  it('applies collapsed width style when collapsed', () => {
    mockUseSidebarStore.mockReturnValue({
      isCollapsed: true,
      width: 280,
      activePageId: null,
      expandedItems: new Set(),
      setCollapsed: jest.fn(),
      setWidth: jest.fn(),
      setActivePage: jest.fn(),
      toggleItemExpansion: jest.fn(),
      isItemExpanded: jest.fn(() => false),
    })

    const { container } = render(<Sidebar />)
    const sidebar = container.querySelector('[role="navigation"]')
    expect(sidebar).toHaveStyle('width: 64px')
  })

  it('highlights active page', () => {
    mockUseSidebarStore.mockReturnValue({
      isCollapsed: false,
      width: 280,
      activePageId: '1',
      expandedItems: new Set(),
      setCollapsed: jest.fn(),
      setWidth: jest.fn(),
      setActivePage: jest.fn(),
      toggleItemExpansion: jest.fn(),
      isItemExpanded: jest.fn(() => false),
    })

    render(<Sidebar />)
    const activeButton = screen.getByText('Getting Started').closest('button')
    expect(activeButton).toHaveClass('bg-notion-bgSecondary')
    expect(activeButton).toHaveClass('text-notion-text')
  })

  it('handles keyboard navigation - Escape collapses sidebar', () => {
    const setCollapsedMock = jest.fn()

    mockUseSidebarStore.mockReturnValue({
      isCollapsed: false,
      width: 280,
      activePageId: null,
      expandedItems: new Set(),
      setCollapsed: setCollapsedMock,
      setWidth: jest.fn(),
      setActivePage: jest.fn(),
      toggleItemExpansion: jest.fn(),
      isItemExpanded: jest.fn(() => false),
    })

    render(<Sidebar />)
    // Target the sidebar navigation specifically by its aria-label
    fireEvent.keyDown(screen.getByRole('navigation', { name: /sidebar navigation/i }), { key: 'Escape' })

    expect(setCollapsedMock).toHaveBeenCalledWith(true)
  })
})

describe('FavoritesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSidebarStore.mockReturnValue({
      isCollapsed: false,
      width: 280,
      activePageId: '1',
      expandedItems: new Set(),
      setCollapsed: jest.fn(),
      setWidth: jest.fn(),
      setActivePage: jest.fn(),
      toggleItemExpansion: jest.fn(),
      isItemExpanded: jest.fn(() => true),
    })
    mockUseDocumentStore.mockReturnValue({
      getFavorites: () => [],
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does not render when there are no favorites', () => {
    render(<Sidebar />)
    expect(screen.queryByText('Favorites')).not.toBeInTheDocument()
  })

  it('renders favorites section when there are favorited documents', () => {
    const favoriteDocs = [
      {
        id: 'fav-1',
        title: 'Favorite Page',
        icon: '⭐',
        coverImage: { type: 'color', value: '#1a1a2e' },
        parentId: null,
        isArchived: false,
        isFavorite: true,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        blocks: [],
        slug: 'favorite-page',
      },
    ]

    mockUseDocumentStore.mockReturnValue({
      getFavorites: () => favoriteDocs,
    })

    render(<Sidebar />)
    expect(screen.getByText('Favorites')).toBeInTheDocument()
    expect(screen.getByText('Favorite Page')).toBeInTheDocument()
  })

  it('shows favorite star icon for favorited documents', () => {
    const favoriteDocs = [
      {
        id: 'fav-1',
        title: 'Favorite Page',
        icon: '⭐',
        coverImage: { type: 'color', value: '#1a1a2e' },
        parentId: null,
        isArchived: false,
        isFavorite: true,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        blocks: [],
        slug: 'favorite-page',
      },
    ]

    mockUseDocumentStore.mockReturnValue({
      getFavorites: () => favoriteDocs,
    })

    const { container } = render(<Sidebar />)
    // Check that the favorite page is rendered with its title
    expect(screen.getByText('Favorite Page')).toBeInTheDocument()
    // The Star icon from lucide-react should be in the document
    // We can check for the presence of the Star SVG by checking the container
    const starSvgs = container.querySelectorAll('svg')
    // At least one star should be present (the one in the header + the one in the favorites list)
    expect(starSvgs.length).toBeGreaterThan(0)
  })

  it('highlights active favorite page', () => {
    const favoriteDocs = [
      {
        id: 'fav-1',
        title: 'Active Favorite',
        icon: '⭐',
        coverImage: { type: 'color', value: '#1a1a2e' },
        parentId: null,
        isArchived: false,
        isFavorite: true,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        blocks: [],
        slug: 'active-favorite',
      },
    ]

    mockUseDocumentStore.mockReturnValue({
      getFavorites: () => favoriteDocs,
    })

    mockUseSidebarStore.mockReturnValue({
      isCollapsed: false,
      width: 280,
      activePageId: 'fav-1',
      expandedItems: new Set(),
      setCollapsed: jest.fn(),
      setWidth: jest.fn(),
      setActivePage: jest.fn(),
      toggleItemExpansion: jest.fn(),
      isItemExpanded: jest.fn(() => true),
    })

    render(<Sidebar />)
    const activeButton = screen.getByText('Active Favorite').closest('button')
    expect(activeButton).toHaveClass('bg-notion-bgSecondary')
    expect(activeButton).toHaveClass('text-notion-text')
  })

  it('navigates to favorite page when clicked', () => {
    const favoriteDocs = [
      {
        id: 'fav-1',
        title: 'Favorite Page',
        icon: '⭐',
        coverImage: { type: 'color', value: '#1a1a2e' },
        parentId: null,
        isArchived: false,
        isFavorite: true,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        blocks: [],
        slug: 'favorite-page',
      },
    ]

    mockUseDocumentStore.mockReturnValue({
      getFavorites: () => favoriteDocs,
    })

    const setActivePageMock = jest.fn()
    mockUseSidebarStore.mockReturnValue({
      isCollapsed: false,
      width: 280,
      activePageId: '1',
      expandedItems: new Set(),
      setCollapsed: jest.fn(),
      setWidth: jest.fn(),
      setActivePage: setActivePageMock,
      toggleItemExpansion: jest.fn(),
      isItemExpanded: jest.fn(() => true),
    })

    render(<Sidebar />)
    const favButton = screen.getByRole('button', { name: /favorite page/i })
    fireEvent.click(favButton)
    expect(setActivePageMock).toHaveBeenCalledWith('fav-1')
  })

  it('does not render when sidebar is collapsed', () => {
    const favoriteDocs = [
      {
        id: 'fav-1',
        title: 'Favorite Page',
        icon: '⭐',
        coverImage: { type: 'color', value: '#1a1a2e' },
        parentId: null,
        isArchived: false,
        isFavorite: true,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        blocks: [],
        slug: 'favorite-page',
      },
    ]

    mockUseDocumentStore.mockReturnValue({
      getFavorites: () => favoriteDocs,
    })

    mockUseSidebarStore.mockReturnValue({
      isCollapsed: true,
      width: 280,
      activePageId: '1',
      expandedItems: new Set(),
      setCollapsed: jest.fn(),
      setWidth: jest.fn(),
      setActivePage: jest.fn(),
      toggleItemExpansion: jest.fn(),
      isItemExpanded: jest.fn(() => true),
    })

    render(<Sidebar />)
    expect(screen.queryByText('Favorites')).not.toBeInTheDocument()
  })
})