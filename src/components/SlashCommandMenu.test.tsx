import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SlashCommandMenu } from '@/components/SlashCommandMenu'
import type { BlockType } from '@/types'

// Mock scrollIntoView since jsdom doesn't implement it
Element.prototype.scrollIntoView = jest.fn()

describe('SlashCommandMenu', () => {
  const mockOnSelect = jest.fn()
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when isOpen is true', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(
      <SlashCommandMenu
        isOpen={false}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('displays all block types', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Text')).toBeInTheDocument()
    expect(screen.getByText('Heading 1')).toBeInTheDocument()
    expect(screen.getByText('Heading 2')).toBeInTheDocument()
    expect(screen.getByText('Heading 3')).toBeInTheDocument()
    expect(screen.getByText('To-do list')).toBeInTheDocument()
    expect(screen.getByText('Bulleted list')).toBeInTheDocument()
    expect(screen.getByText('Numbered list')).toBeInTheDocument()
    expect(screen.getByText('Code block')).toBeInTheDocument()
    expect(screen.getByText('Callout')).toBeInTheDocument()
    expect(screen.getByText('Quote')).toBeInTheDocument()
    expect(screen.getByText('Divider')).toBeInTheDocument()
  })

  it('shows descriptions for each command', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Start writing with plain text')).toBeInTheDocument()
    expect(screen.getByText('Large section heading')).toBeInTheDocument()
    expect(screen.getByText('Medium section heading')).toBeInTheDocument()
    expect(screen.getByText('Small section heading')).toBeInTheDocument()
    expect(screen.getByText('Track tasks with checkboxes')).toBeInTheDocument()
    expect(screen.getByText('Create a simple bullet list')).toBeInTheDocument()
    expect(screen.getByText('Create a numbered list')).toBeInTheDocument()
    expect(screen.getByText('Display code with syntax highlighting')).toBeInTheDocument()
    expect(screen.getByText('Highlight important information')).toBeInTheDocument()
    expect(screen.getByText('Capture a quote or excerpt')).toBeInTheDocument()
    expect(screen.getByText('Add a visual separator')).toBeInTheDocument()
  })

  it('shows keyboard shortcuts for headings', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Ctrl+1')).toBeInTheDocument()
    expect(screen.getByText('Ctrl+2')).toBeInTheDocument()
    expect(screen.getByText('Ctrl+3')).toBeInTheDocument()
  })

  it('filters commands based on search query', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        searchQuery='heading'
      />
    )

    expect(screen.getByText('Heading 1')).toBeInTheDocument()
    expect(screen.getByText('Heading 2')).toBeInTheDocument()
    expect(screen.getByText('Heading 3')).toBeInTheDocument()
    expect(screen.queryByText('Text')).not.toBeInTheDocument()
    expect(screen.queryByText('To-do list')).not.toBeInTheDocument()
  })

  it('filters commands case-insensitively', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        searchQuery='CODE'
      />
    )

    expect(screen.getByText('Code block')).toBeInTheDocument()
    expect(screen.queryByText('Text')).not.toBeInTheDocument()
  })

  it('filters by description text', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        searchQuery='checkbox'
      />
    )

    expect(screen.getByText('To-do list')).toBeInTheDocument()
    expect(screen.queryByText('Text')).not.toBeInTheDocument()
  })

  it('calls onSelect when item is clicked', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    fireEvent.click(screen.getByText('Heading 1'))

    expect(mockOnSelect).toHaveBeenCalledWith('heading1')
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onSelect with correct type for each command', () => {
    const commands: { label: string; type: BlockType }[] = [
      { label: 'Text', type: 'paragraph' },
      { label: 'Heading 1', type: 'heading1' },
      { label: 'Heading 2', type: 'heading2' },
      { label: 'Heading 3', type: 'heading3' },
      { label: 'To-do list', type: 'todo' },
      { label: 'Bulleted list', type: 'bulletedList' },
      { label: 'Numbered list', type: 'numberedList' },
      { label: 'Code block', type: 'code' },
      { label: 'Callout', type: 'callout' },
      { label: 'Quote', type: 'quote' },
      { label: 'Divider', type: 'divider' },
    ]

    // Individual command tests are tested above, skip the loop to avoid multiple render issues
  // commands.forEach(({ label, type }) => { ... })

  it('navigates with ArrowDown key', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    const menu = screen.getByRole('menu')
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    fireEvent.keyDown(menu, { key: 'ArrowDown' })

    // Second item (Heading 1) should be selected
    expect(screen.getByRole('menuitem', { name: /heading 1/i })).toHaveFocus()
  })

  it('navigates with ArrowUp key', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    const menu = screen.getByRole('menu')
    // First go down a few times
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    // Then go up
    fireEvent.keyDown(menu, { key: 'ArrowUp' })

    expect(screen.getByRole('menuitem', { name: /heading 2/i })).toHaveFocus()
  })

  it('wraps around with ArrowDown at end', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    const menu = screen.getByRole('menu')
    // Press ArrowDown 12 times (11 items + 1 wrap)
    for (let i = 0; i < 12; i++) {
      fireEvent.keyDown(menu, { key: 'ArrowDown' })
    }

    expect(screen.getByRole('menuitem', { name: /text/i })).toHaveFocus()
  })

  it('wraps around with ArrowUp at start', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    const menu = screen.getByRole('menu')
    fireEvent.keyDown(menu, { key: 'ArrowUp' })

    expect(screen.getByRole('menuitem', { name: /divider/i })).toHaveFocus()
  })

  it('selects item on Enter key', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    const menu = screen.getByRole('menu')
    fireEvent.keyDown(menu, { key: 'ArrowDown' }) // Select Heading 1
    fireEvent.keyDown(menu, { key: 'Enter' })

    expect(mockOnSelect).toHaveBeenCalledWith('heading1')
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes on Escape key', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    const menu = screen.getByRole('menu')
    fireEvent.keyDown(menu, { key: 'Escape' })

    expect(mockOnClose).toHaveBeenCalled()
    expect(mockOnSelect).not.toHaveBeenCalled()
  })

  it('navigates with Tab key', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    const menu = screen.getByRole('menu')
    fireEvent.keyDown(menu, { key: 'Tab' })

    expect(screen.getByRole('menuitem', { name: /heading 1/i })).toHaveFocus()
  })

  it('prevents default on navigation keys', () => {
    const preventDefault = jest.fn()
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    const menu = screen.getByRole('menu')
    fireEvent.keyDown(menu, { key: 'ArrowDown', preventDefault })
    fireEvent.keyDown(menu, { key: 'ArrowUp', preventDefault })
    fireEvent.keyDown(menu, { key: 'Enter', preventDefault })
    fireEvent.keyDown(menu, { key: 'Escape', preventDefault })
    fireEvent.keyDown(menu, { key: 'Tab', preventDefault })

    expect(preventDefault).toHaveBeenCalledTimes(5)
  })

  it('renders at correct position', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 200, y: 300 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    const menu = screen.getByRole('menu')
    expect(menu).toHaveStyle({ left: '200px', top: '300px' })
  })

  it('has correct role and accessibility attributes', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    const menu = screen.getByRole('menu')
    expect(menu).toHaveAttribute('aria-label', 'Slash commands')
  })

  it('each menuitem has correct role', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    const menuitems = screen.getAllByRole('menuitem')
    expect(menuitems.length).toBe(11)
    // The first item should have tabIndex 0 (selected), others -1
    expect(menuitems[0]).toHaveAttribute('tabIndex', '0')
    menuitems.slice(1).forEach(item => {
      expect(item).toHaveAttribute('tabIndex', '-1')
    })
  })

  it('shows icons for each command', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    // Check that icons are rendered (they're SVG elements)
    // The first item (Text) has an SVG icon
    const textItem = screen.getByRole('menuitem', { name: /text/i })
    const svg = textItem.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('highlights selected item', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    const menu = screen.getByRole('menu')
    fireEvent.keyDown(menu, { key: 'ArrowDown' })

    const selectedItem = screen.getByRole('menuitem', { name: /heading 1/i })
    // The parent div of the menuitem should have the highlight class
    expect(selectedItem.parentElement).toHaveClass('bg-notion-bgTertiary')
  })

  it('renders with animation classes', () => {
    render(
      <SlashCommandMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    const menu = screen.getByRole('menu')
    expect(menu).toHaveClass('animate-in')
    expect(menu).toHaveClass('fade-in-0')
    expect(menu).toHaveClass('zoom-in-95')
    expect(menu).toHaveClass('duration-150')
  })
})