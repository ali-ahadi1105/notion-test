import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AppShell } from '@/components/AppShell'
import { useSidebarStore } from '@/store/sidebarStore'
import { act } from 'react-dom/test-utils'

// Mock the store
jest.mock('@/store/sidebarStore', () => ({
  useSidebarStore: jest.fn(),
}))

const mockUseSidebarStore = useSidebarStore as jest.Mock

describe('AppShell', () => {
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
    render(<AppShell />)
    expect(screen.getByRole('navigation', { name: /sidebar navigation/i })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders sidebar with workspace header', () => {
    render(<AppShell />)
    // The workspace name appears in sidebar header (h1) and breadcrumbs (span)
    // Use getByRole to target the specific one in the sidebar
    expect(screen.getByRole('heading', { level: 1, name: 'Acme Corp' })).toBeInTheDocument()
    expect(screen.getByText('Workspace')).toBeInTheDocument()
  })

  it('renders quick actions', () => {
    render(<AppShell />)
    expect(screen.getByLabelText(/new page/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/search/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/trash/i)).toBeInTheDocument()
  })

  it('renders page tree navigation', () => {
    render(<AppShell />)
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders main content area', () => {
    render(<AppShell />)
    expect(screen.getByText(/welcome to acme corp/i)).toBeInTheDocument()
  })

  it('renders top toolbar with breadcrumbs', () => {
    render(<AppShell />)
    expect(screen.getByLabelText(/breadcrumb/i)).toBeInTheDocument()
  })

  it('renders toolbar actions', () => {
    render(<AppShell />)
    expect(screen.getByLabelText(/add to favorites/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/share page/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/help and support/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/more options/i)).toBeInTheDocument()
  })

  it('has no layout shift - consistent structure', () => {
    const { container } = render(<AppShell />)
    // Check that the main structural elements exist
    const sidebar = container.querySelector('[role="navigation"]')
    const main = container.querySelector('[role="main"]')
    const header = container.querySelector('header')

    expect(sidebar).toBeInTheDocument()
    expect(main).toBeInTheDocument()
    expect(header).toBeInTheDocument()
  })

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<AppShell />)
    const sidebar = container.querySelector('[role="navigation"]')
    const main = container.querySelector('[role="main"]')

    expect(sidebar).toHaveClass('fixed')
    expect(sidebar).toHaveClass('left-0')
    expect(sidebar).toHaveClass('top-0')
    expect(sidebar).toHaveClass('h-screen')
    expect(main).toHaveClass('flex-1')
    expect(main).toHaveClass('min-h-screen')
  })
})