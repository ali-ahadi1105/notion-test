import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MainContent } from '@/components/MainContent'
import { useSidebarStore } from '@/store/sidebarStore'

// Mock the store
jest.mock('@/store/sidebarStore', () => ({
  useSidebarStore: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}))

const mockUseSidebarStore = useSidebarStore as unknown as jest.Mock

describe('MainContent', () => {
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
      isItemExpanded: jest.fn(() => false),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<MainContent activePageId={null} />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('shows welcome message when no active page', () => {
    render(<MainContent activePageId={null} />)
    expect(screen.getByText(/welcome to acme corp/i)).toBeInTheDocument()
    expect(screen.getByText(/select a page from the sidebar/i)).toBeInTheDocument()
  })

  it('shows page title when active page is set', () => {
    render(<MainContent activePageId={'1'} />)
    // The page title is in an h1, breadcrumbs are in spans
    expect(screen.getByRole('heading', { level: 1, name: 'Getting Started' })).toBeInTheDocument()
    expect(screen.getByText(/start typing to add content/i)).toBeInTheDocument()
  })

  it('renders top toolbar', () => {
    render(<MainContent activePageId={null} />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders breadcrumbs with workspace name', () => {
    render(<MainContent activePageId={null} />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('renders breadcrumbs with page path', () => {
    render(<MainContent activePageId={'1-3-1'} />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Core Concepts')).toBeInTheDocument()
    // The last breadcrumb item should be "Blocks" with font-medium
    const breadcrumbBlocks = screen.getAllByText('Blocks').find(el => el.closest('nav'))
    expect(breadcrumbBlocks).toBeInTheDocument()
  })

  it('renders toolbar actions', () => {
    render(<MainContent activePageId={null} />)
    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument()
    expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument()
    expect(screen.getByLabelText('Share page')).toBeInTheDocument()
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument()
    expect(screen.getByLabelText('Help and support')).toBeInTheDocument()
    expect(screen.getByLabelText('More options')).toBeInTheDocument()
  })

  it('toggles sidebar when menu button clicked', () => {
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

    render(<MainContent activePageId={null} />)
    fireEvent.click(screen.getByLabelText('Collapse sidebar'))

    expect(setCollapsedMock).toHaveBeenCalledWith(true)
  })

  it('applies correct margin when sidebar is collapsed', () => {
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

    const { container } = render(<MainContent activePageId={null} />)
    const main = container.querySelector('[role="main"]')
    expect(main).toHaveStyle('margin-left: 64px')
  })

  it('applies correct margin when sidebar is expanded', () => {
    mockUseSidebarStore.mockReturnValue({
      isCollapsed: false,
      width: 280,
      activePageId: null,
      expandedItems: new Set(),
      setCollapsed: jest.fn(),
      setWidth: jest.fn(),
      setActivePage: jest.fn(),
      toggleItemExpansion: jest.fn(),
      isItemExpanded: jest.fn(() => false),
    })

    const { container } = render(<MainContent activePageId={null} />)
    const main = container.querySelector('[role="main"]')
    expect(main).toHaveStyle('margin-left: 280px')
  })

  it('has sticky header', () => {
    render(<MainContent activePageId={null} />)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('sticky')
    expect(header).toHaveClass('top-0')
  })

  it('has correct background', () => {
    render(<MainContent activePageId={null} />)
    const main = screen.getByRole('main')
    expect(main).toHaveClass('bg-notion-bgSecondary')
  })
})