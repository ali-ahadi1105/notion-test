import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Block } from '@/components/blocks/Block'
import type { Block as BlockType } from '@/types'

describe('Block Components', () => {
  const mockOnUpdate = jest.fn()
  const mockOnDelete = jest.fn()
  const mockOnFocus = jest.fn()
  const mockOnBlockTypeChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ParagraphBlock', () => {
    it('renders paragraph block with content', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'paragraph',
        content: 'Hello world',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      expect(screen.getByText('Hello world')).toBeInTheDocument()
    })

    it('shows placeholder when empty', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'paragraph',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      expect(screen.getByText('Start typing...')).toBeInTheDocument()
    })

    it('calls onUpdate when content changes', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'paragraph',
        content: 'Initial',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent(editable, new Event('input', { bubbles: true }))
      
      // Simulate content change
      Object.defineProperty(editable, 'textContent', { value: 'Updated content' })
      fireEvent.input(editable)
      
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'block-1',
          type: 'paragraph',
          content: 'Updated content',
        })
      )
    })

    it('calls onDelete when backspace on empty block', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'paragraph',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editable, { key: 'Backspace' })

      expect(mockOnDelete).toHaveBeenCalledWith('block-1')
    })

    it('calls onBlockTypeChange when Enter is pressed', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'paragraph',
        content: 'Some text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editable, { key: 'Enter' })

      expect(mockOnBlockTypeChange).toHaveBeenCalledWith('block-1', 'paragraph')
    })
  })

  describe('HeadingBlock', () => {
    it('renders heading 1 with correct style', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'heading1',
        content: 'Main Heading',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      expect(screen.getByText('Main Heading')).toBeInTheDocument()
      expect(screen.getByText('Main Heading').closest('h1')).toHaveClass('text-3xl')
    })

    it('renders heading 2 with correct style', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'heading2',
        content: 'Sub Heading',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      expect(screen.getByText('Sub Heading')).toBeInTheDocument()
      expect(screen.getByText('Sub Heading').closest('h2')).toHaveClass('text-2xl')
    })

    it('renders heading 3 with correct style', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'heading3',
        content: 'Small Heading',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      expect(screen.getByText('Small Heading')).toBeInTheDocument()
      expect(screen.getByText('Small Heading').closest('h3')).toHaveClass('text-xl')
    })

    it('converts to paragraph on Enter', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'heading1',
        content: 'Heading',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      const heading = screen.getByText('Heading')
      fireEvent.keyDown(heading, { key: 'Enter' })

      expect(mockOnBlockTypeChange).toHaveBeenCalledWith('block-1', 'paragraph')
    })

    it('calls onDelete when backspace on empty heading', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'heading1',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      const heading = screen.getByText('Heading 1')
      fireEvent.keyDown(heading, { key: 'Backspace' })

      expect(mockOnDelete).toHaveBeenCalledWith('block-1')
    })
  })

  describe('TodoBlock', () => {
    it('renders todo with checkbox', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'todo',
        content: 'Buy milk',
        checked: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).not.toBeChecked()
      expect(screen.getByText('Buy milk')).toBeInTheDocument()
    })

    it('shows checked todo with strikethrough', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'todo',
        content: 'Buy milk',
        checked: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      expect(screen.getByRole('checkbox')).toBeChecked()
      expect(screen.getByText('Buy milk').closest('div')).toHaveClass('line-through')
    })

    it('toggles checkbox on click', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'todo',
        content: 'Buy milk',
        checked: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'block-1',
          checked: true,
        })
      )
    })

    it('creates new todo on Enter', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'todo',
        content: 'Buy milk',
        checked: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      const editable = screen.getByRole('textbox', { name: /to-do/i })
      fireEvent.keyDown(editable, { key: 'Enter' })

      expect(mockOnBlockTypeChange).toHaveBeenCalledWith('block-1', 'todo')
    })
  })

  describe('ListBlock', () => {
    it('renders bulleted list with items', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'bulletedList',
        items: [
          { id: 'item-1', content: 'Item 1' },
          { id: 'item-2', content: 'Item 2' },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      // Check for bullet points
      const bullets = screen.getAllByRole('listitem')
      expect(bullets.length).toBe(2)
    })

    it('renders numbered list with numbers', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'numberedList',
        items: [
          { id: 'item-1', content: 'First' },
          { id: 'item-2', content: 'Second' },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
    })

    it('adds new item on Enter', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'bulletedList',
        items: [{ id: 'item-1', content: 'Item 1' }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      const editable = screen.getByRole('textbox', { name: /list item/i })
      fireEvent.keyDown(editable, { key: 'Enter' })

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({ content: 'Item 1' }),
            expect.objectContaining({ content: '' }),
          ]),
        })
      )
    })

    it('deletes block when backspace on empty single item', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'bulletedList',
        items: [{ id: 'item-1', content: '' }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      const editable = screen.getByRole('textbox', { name: /list item/i })
      fireEvent.keyDown(editable, { key: 'Backspace' })

      expect(mockOnDelete).toHaveBeenCalledWith('block-1')
    })
  })

  describe('CodeBlock', () => {
    it('renders code block with content', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'code',
        content: 'console.log("hello")',
        language: 'javascript',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      expect(screen.getByDisplayValue('console.log("hello")')).toBeInTheDocument()
      expect(screen.getByText('javascript')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
    })

    it('shows plaintext when no language specified', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'code',
        content: 'some code',
        language: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      expect(screen.getByText('plaintext')).toBeInTheDocument()
    })

    it('copies code to clipboard on copy button click', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'code',
        content: 'console.log("hello")',
        language: 'javascript',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      const mockWriteText = jest.fn()
      Object.assign(navigator, { clipboard: { writeText: mockWriteText } })

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /copy/i }))

      expect(mockWriteText).toHaveBeenCalledWith('console.log("hello")')
    })

    it('converts to paragraph on Escape', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'code',
        content: 'code',
        language: 'javascript',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.keyDown(textarea, { key: 'Escape' })

      expect(mockOnBlockTypeChange).toHaveBeenCalledWith('block-1', 'paragraph')
    })
  })

  describe('CalloutBlock', () => {
    it('renders callout with icon and content', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'callout',
        content: 'Important note!',
        icon: '⚠️',
        backgroundColor: '#ef4444',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      expect(screen.getByText('⚠️')).toBeInTheDocument()
      expect(screen.getByText('Important note!')).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /callout/i })).toBeInTheDocument()
    })

    it('converts to paragraph on Ctrl+Enter', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'callout',
        content: 'Note',
        icon: '💡',
        backgroundColor: '#3b82f6',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      const editable = screen.getByRole('textbox', { name: /callout/i })
      fireEvent.keyDown(editable, { key: 'Enter', ctrlKey: true })

      expect(mockOnBlockTypeChange).toHaveBeenCalledWith('block-1', 'paragraph')
    })
  })

  describe('QuoteBlock', () => {
    it('renders quote with content', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'quote',
        content: 'Life is what happens when you\'re busy making other plans.',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      expect(screen.getByText("Life is what happens when you're busy making other plans.")).toBeInTheDocument()
      const blockquote = screen.getByText("Life is what happens when you're busy making other plans.").closest('blockquote')
      expect(blockquote).toBeInTheDocument()
      expect(blockquote).toHaveClass('border-l-4')
      expect(blockquote).toHaveClass('border-notion-accent')
    })

    it('shows placeholder when empty', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'quote',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      expect(screen.getByText('Quote')).toBeInTheDocument()
    })

    it('converts to paragraph on Ctrl+Enter', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'quote',
        content: 'Quote text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      const editable = screen.getByRole('textbox', { name: /quote/i })
      fireEvent.keyDown(editable, { key: 'Enter', ctrlKey: true })

      expect(mockOnBlockTypeChange).toHaveBeenCalledWith('block-1', 'paragraph')
    })

    it('calls onDelete when backspace on empty quote', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'quote',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      const editable = screen.getByRole('textbox', { name: /quote/i })
      fireEvent.keyDown(editable, { key: 'Backspace' })

      expect(mockOnDelete).toHaveBeenCalledWith('block-1')
    })
  })

  describe('DividerBlock', () => {
    it('renders horizontal rule', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'divider',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      // Check that the divider renders (there are two separator roles - the parent div and hr)
      const separators = screen.getAllByRole('separator', { hidden: true })
      expect(separators.length).toBeGreaterThanOrEqual(1)
      expect(separators[0]).toHaveAttribute('aria-orientation', 'horizontal')
    })

    it('converts to paragraph on Enter', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'divider',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      const divider = screen.getAllByRole('separator', { hidden: true })[0]
      fireEvent.keyDown(divider, { key: 'Enter' })

      expect(mockOnBlockTypeChange).toHaveBeenCalledWith('block-1', 'paragraph')
    })

    it('calls onDelete on Backspace', () => {
      const block: BlockType = {
        id: 'block-1',
        type: 'divider',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <Block
          block={block}
          index={0}
          isActive={false}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onFocus={mockOnFocus}
          onBlockTypeChange={mockOnBlockTypeChange}
        />
      )

      const divider = screen.getAllByRole('separator', { hidden: true })[0]
      fireEvent.keyDown(divider, { key: 'Backspace' })

      expect(mockOnDelete).toHaveBeenCalledWith('block-1')
    })
  })

  // Block transformation keyboard shortcuts (Ctrl+1-9, Ctrl+0) are handled at the Editor level,
  // not Block level. The Block component only handles Enter/Backspace/Slash for its specific block type.
  // These integration tests would require the full Editor component to work properly.
})