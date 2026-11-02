import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Editor } from '@/components/Editor'
import type { Block } from '@/types'

describe('Editor', () => {
  const mockOnBlocksChange = jest.fn()

  const initialBlocks: Block[] = [
    {
      id: 'block-1',
      type: 'paragraph',
      content: 'First paragraph',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'block-2',
      type: 'paragraph',
      content: 'Second paragraph',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<Editor blocks={initialBlocks} onBlocksChange={mockOnBlocksChange} />)
    expect(screen.getByRole('textbox', { name: /page content editor/i })).toBeInTheDocument()
  })

  it('renders all blocks', () => {
    render(<Editor blocks={initialBlocks} onBlocksChange={mockOnBlocksChange} />)
    
    expect(screen.getByText('First paragraph')).toBeInTheDocument()
    expect(screen.getByText('Second paragraph')).toBeInTheDocument()
  })

  it('calls onBlocksChange when blocks change', async () => {
    render(<Editor blocks={initialBlocks} onBlocksChange={mockOnBlocksChange} />)
    
    const editable = screen.getByRole('textbox', { name: /start typing/i })
    fireEvent(editable, new Event('input', { bubbles: true }))
    Object.defineProperty(editable, 'textContent', { value: 'Updated first paragraph' })
    fireEvent.input(editable)
    
    await waitFor(() => {
      expect(mockOnBlocksChange).toHaveBeenCalled()
    })
  })

  describe('Block insertion', () => {
    it('creates new paragraph block on Enter in paragraph', async () => {
      const singleBlock: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'First paragraph',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={singleBlock} onBlocksChange={mockOnBlocksChange} />)

      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editable, { key: 'Enter' })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1', content: 'First paragraph' }),
            expect.objectContaining({ type: 'paragraph' }),
          ])
        )
      })
    })

    it('creates new heading block on Enter in heading', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'heading1',
          content: 'Main Heading',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const heading = screen.getByRole('heading', { level: 1 })
      fireEvent.keyDown(heading, { key: 'Enter' })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1', type: 'heading1' }),
            expect.objectContaining({ type: 'paragraph' }),
          ])
        )
      })
    })

    it('creates new todo block on Enter in todo', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'todo',
          content: 'Buy milk',
          checked: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const editable = screen.getByRole('textbox', { name: /to-do/i })
      fireEvent.keyDown(editable, { key: 'Enter' })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1', type: 'todo' }),
            expect.objectContaining({ type: 'todo' }),
          ])
        )
      })
    })

    it('adds new list item on Enter in list', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'bulletedList',
          items: [{ id: 'item-1', content: 'Item 1' }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const editable = screen.getByRole('textbox', { name: /list item/i })
      fireEvent.keyDown(editable, { key: 'Enter' })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              items: expect.arrayContaining([
                expect.objectContaining({ content: 'Item 1' }),
                expect.objectContaining({ content: '' }),
              ]),
            }),
          ])
        )
      })
    })

    it('creates paragraph after code block on Enter', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'code',
          content: 'console.log("hello")',
          language: 'javascript',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1', type: 'code' }),
            expect.objectContaining({ type: 'paragraph' }),
          ])
        )
      })
    })
  })

  describe('Block deletion', () => {
    it('deletes empty paragraph block on Backspace', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'First paragraph',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'block-2',
          type: 'paragraph',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      // Focus the second (empty) block
      const editables = screen.getAllByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editables[1], { key: 'Backspace' })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1' }),
          ])
        )
        expect(mockOnBlocksChange).not.toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-2' }),
          ])
        )
      })
    })

    it('does not delete first block on Backspace when empty', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editable, { key: 'Backspace' })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1' }),
          ])
        )
      })
    })

    it('deletes empty list block on Backspace', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'First paragraph',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'block-2',
          type: 'bulletedList',
          items: [{ id: 'item-1', content: '' }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const editables = screen.getAllByRole('textbox', { name: /list item/i })
      fireEvent.keyDown(editables[0], { key: 'Backspace' })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1' }),
          ])
        )
        expect(mockOnBlocksChange).not.toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-2' }),
          ])
        )
      })
    })

    it('deletes divider block on Backspace', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'First paragraph',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'block-2',
          type: 'divider',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const divider = screen.getByRole('separator')
      fireEvent.keyDown(divider, { key: 'Backspace' })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1' }),
          ])
        )
        expect(mockOnBlocksChange).not.toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-2' }),
          ])
        )
      })
    })
  })

  describe('Block order preservation', () => {
    it('maintains block order after insertion', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'First',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'block-2',
          type: 'paragraph',
          content: 'Second',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'block-3',
          type: 'paragraph',
          content: 'Third',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      // Press Enter in the second block to insert after it
      const editables = screen.getAllByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editables[1], { key: 'Enter' })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1', content: 'First' }),
            expect.objectContaining({ id: 'block-2', content: 'Second' }),
            expect.objectContaining({ type: 'paragraph' }), // New block
            expect.objectContaining({ id: 'block-3', content: 'Third' }),
          ])
        )
      })
    })

    it('maintains block order after deletion', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'First',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'block-2',
          type: 'paragraph',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'block-3',
          type: 'paragraph',
          content: 'Third',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      // Delete the middle empty block
      const editables = screen.getAllByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editables[1], { key: 'Backspace' })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1', content: 'First' }),
            expect.objectContaining({ id: 'block-3', content: 'Third' }),
          ])
        )
      })
    })

    it('preserves order when converting block types', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'block-2',
          type: 'paragraph',
          content: 'Second',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      // Convert first block to heading1 using Ctrl+1
      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editable, { key: '1', ctrlKey: true })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1', type: 'heading1' }),
            expect.objectContaining({ id: 'block-2', content: 'Second' }),
          ])
        )
      })
    })
  })

  describe('Todo completion state', () => {
    it('toggles todo checkbox', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'todo',
          content: 'Buy milk',
          checked: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1', checked: true }),
          ])
        )
      })
    })

    it('shows strikethrough when todo is checked', () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'todo',
          content: 'Buy milk',
          checked: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      expect(screen.getByRole('checkbox')).toBeChecked()
      expect(screen.getByText('Buy milk').closest('div')).toHaveClass('line-through')
    })
  })

  describe('Slash command menu', () => {
    it('opens slash menu on / key in empty paragraph', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editable, { key: '/' })

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })
    })

    it('does not open slash menu when paragraph has content', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'Some text',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editable, { key: '/' })

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })

    it('does not open slash menu for non-paragraph blocks', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'heading1',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const heading = screen.getByRole('heading', { level: 1 })
      fireEvent.keyDown(heading, { key: '/' })

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })

    it('inserts selected block type from slash menu', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editable, { key: '/' })

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      // Click on "Heading 1" in the menu
      fireEvent.click(screen.getByRole('menuitem', { name: /heading 1/i }))

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1', type: 'heading1' }),
          ])
        )
      })
    })

    it('closes slash menu on Escape', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editable, { key: '/' })

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })
  })

  describe('Keyboard shortcuts', () => {
    it('converts empty paragraph to heading1 with Ctrl+1', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editable, { key: '1', ctrlKey: true })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1', type: 'heading1' }),
          ])
        )
      })
    })

    it('converts empty paragraph to todo with Ctrl+4', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editable, { key: '4', ctrlKey: true })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1', type: 'todo' }),
          ])
        )
      })
    })

    it('converts empty paragraph to bulletedList with Ctrl+5', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editable, { key: '5', ctrlKey: true })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1', type: 'bulletedList' }),
          ])
        )
      })
    })

    it('converts empty paragraph to code with Ctrl+7', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editable, { key: '7', ctrlKey: true })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1', type: 'code' }),
          ])
        )
      })
    })

    it('converts empty paragraph to quote with Ctrl+9', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editable, { key: '9', ctrlKey: true })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1', type: 'quote' }),
          ])
        )
      })
    })

    it('converts empty paragraph to divider with Ctrl+0', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editable, { key: '0', ctrlKey: true })

      await waitFor(() => {
        expect(mockOnBlocksChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'block-1', type: 'divider' }),
          ])
        )
      })
    })
  })

  describe('Focus management', () => {
    it('focuses new block after creation', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'First',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const editable = screen.getByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editable, { key: 'Enter' })

      await waitFor(() => {
        // The new block should be focused
        const editables = screen.getAllByRole('textbox', { name: /start typing/i })
        expect(editables[1]).toHaveFocus()
      })
    })

    it('focuses previous block after deletion', async () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'First',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'block-2',
          type: 'paragraph',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      render(<Editor blocks={blocks} onBlocksChange={mockOnBlocksChange} />)

      const editables = screen.getAllByRole('textbox', { name: /start typing/i })
      fireEvent.keyDown(editables[1], { key: 'Backspace' })

      await waitFor(() => {
        expect(editables[0]).toHaveFocus()
      })
    })
  })
})