'use client'

import { useState, useRef, useCallback, useEffect, KeyboardEvent, FocusEvent } from 'react'
import { Block } from '@/components/blocks/Block'
import { SlashCommandMenu } from '@/components/SlashCommandMenu'
import { cn } from '@/lib/utils'
import type { Block as BlockTypeDef, BlockType } from '@/types'

interface EditorProps {
  blocks: BlockTypeDef[]
  onBlocksChange: (blocks: BlockTypeDef[]) => void
  placeholder?: string
}

export function Editor({ blocks: initialBlocks, onBlocksChange, placeholder = 'Start typing...' }: EditorProps) {
  const [blocks, setBlocks] = useState<BlockTypeDef[]>(initialBlocks)
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [slashMenuOpen, setSlashMenuOpen] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 })
  const [slashSearchQuery, setSlashSearchQuery] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const isComposing = useRef(false)

  // Sync with parent
  useEffect(() => {
    setBlocks(initialBlocks)
  }, [initialBlocks])

  useEffect(() => {
    onBlocksChange(blocks)
  }, [blocks, onBlocksChange])

  // Generate unique block ID
  const generateBlockId = useCallback(() => {
    return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Create a new block of specified type
  const createBlock = useCallback((type: BlockType, afterBlockId?: string): BlockTypeDef => {
    const now = Date.now()
    const baseBlock = {
      id: generateBlockId(),
      type,
      createdAt: now,
      updatedAt: now,
    }

    switch (type) {
      case 'paragraph':
        return { ...baseBlock, type: 'paragraph', content: '' }
      case 'heading1':
      case 'heading2':
      case 'heading3':
        return { ...baseBlock, type, content: '' }
      case 'todo':
        return { ...baseBlock, type: 'todo', content: '', checked: false }
      case 'bulletedList':
      case 'numberedList':
        return { ...baseBlock, type, items: [{ id: `item-${Date.now()}`, content: '' }] }
      case 'code':
        return { ...baseBlock, type: 'code', content: '', language: 'javascript' }
      case 'callout':
        return { ...baseBlock, type: 'callout', content: '', icon: '💡', backgroundColor: '#3b82f6' }
      case 'quote':
        return { ...baseBlock, type: 'quote', content: '' }
      case 'divider':
        return { ...baseBlock, type: 'divider' }
      default:
        return { ...baseBlock, type: 'paragraph', content: '' }
    }
  }, [generateBlockId])

  // Update a block
  const updateBlock = useCallback((updatedBlock: BlockTypeDef) => {
    setBlocks(prev => prev.map(block => 
      block.id === updatedBlock.id ? { ...updatedBlock, updatedAt: Date.now() } : block
    ))
  }, [])

  // Delete a block
  const deleteBlock = useCallback((blockId: string) => {
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === blockId)
      if (index === -1) return prev
      
      const newBlocks = prev.filter(b => b.id !== blockId)
      
      // Focus the previous block if it exists
      if (newBlocks.length > 0) {
        const newIndex = Math.min(index, newBlocks.length - 1)
        setTimeout(() => {
          setActiveBlockId(newBlocks[newIndex].id)
          blockRefs.current.get(newBlocks[newIndex].id)?.focus()
        }, 0)
      } else {
        setActiveBlockId(null)
      }
      
      return newBlocks
    })
  }, [])

  // Insert a new block after a specific block
  const insertBlockAfter = useCallback((type: BlockType, afterBlockId?: string) => {
    const newBlock = createBlock(type)
    setBlocks(prev => {
      if (!afterBlockId) {
        // Insert at the beginning
        return [newBlock, ...prev]
      }
      
      const index = prev.findIndex(b => b.id === afterBlockId)
      if (index === -1) {
        return [...prev, newBlock]
      }
      
      const newBlocks = [...prev]
      newBlocks.splice(index + 1, 0, newBlock)
      return newBlocks
    })
    
    // Focus the new block
    setTimeout(() => {
      setActiveBlockId(newBlock.id)
      blockRefs.current.get(newBlock.id)?.focus()
    }, 0)
    
    setSlashMenuOpen(false)
  }, [createBlock])

  // Handle slash command selection
  const handleSlashSelect = useCallback((type: BlockType) => {
    insertBlockAfter(type, activeBlockId || undefined)
  }, [insertBlockAfter, activeBlockId])

  // Handle block focus
  const handleBlockFocus = useCallback((blockId: string) => {
    setActiveBlockId(blockId)
  }, [])

  // Handle Enter key - create new block
  const handleEnter = useCallback((e: KeyboardEvent<HTMLDivElement>, blockId: string) => {
    if (e.shiftKey) return // Allow shift+enter for newlines in content
    
    const block = blocks.find(b => b.id === blockId)
    if (!block) return
    
    // For divider, code, quote, callout - create paragraph after
    if (['divider', 'code', 'quote', 'callout'].includes(block.type)) {
      e.preventDefault()
      insertBlockAfter('paragraph', blockId)
      return
    }
    
    // For empty blocks at the end, convert to paragraph
    if (!block.content && block.type !== 'paragraph') {
      e.preventDefault()
      updateBlock({ ...block, type: 'paragraph' })
      return
    }
    
    // For list items, add new item
    if (['bulletedList', 'numberedList'].includes(block.type)) {
      e.preventDefault()
      const listBlock = block as BlockTypeDef & { type: 'bulletedList' | 'numberedList'; items: Array<{id: string; content: string}> }
      if (listBlock.items.length > 0 && listBlock.items[listBlock.items.length - 1].content === '') {
        // If last item is empty, remove it and create new block
        const newItems = listBlock.items.slice(0, -1)
        if (newItems.length === 0) {
          // Convert to paragraph
          updateBlock({ ...block, type: 'paragraph', items: undefined })
          insertBlockAfter('paragraph', blockId)
        } else {
          updateBlock({ ...block, items: newItems })
        }
      } else {
        // Add new item
        const newItems = [...listBlock.items, { id: `item-${Date.now()}`, content: '' }]
        updateBlock({ ...block, items: newItems })
      }
      return
    }
    
    // For todo, create new todo
    if (block.type === 'todo') {
      e.preventDefault()
      insertBlockAfter('todo', blockId)
      return
    }
    
    // For headings, create paragraph after
    if (['heading1', 'heading2', 'heading3'].includes(block.type)) {
      e.preventDefault()
      insertBlockAfter('paragraph', blockId)
      return
    }
    
    // For paragraph, create new paragraph
    if (block.type === 'paragraph') {
      e.preventDefault()
      insertBlockAfter('paragraph', blockId)
      return
    }
  }, [blocks, insertBlockAfter, updateBlock])

  // Handle Backspace key - delete empty block or merge with previous
  const handleBackspace = useCallback((e: KeyboardEvent<HTMLDivElement>, blockId: string) => {
    const block = blocks.find(b => b.id === blockId)
    if (!block) return
    
    const blockIndex = blocks.findIndex(b => b.id === blockId)
    const prevBlock = blockIndex > 0 ? blocks[blockIndex - 1] : null
    
    // If block has content, let browser handle it
    if (block.content && block.content.length > 0) return
    
    // For lists, if empty and first item, convert to paragraph
    if (['bulletedList', 'numberedList'].includes(block.type)) {
      const listBlock = block as BlockTypeDef & { items: Array<{id: string; content: string}> }
      if (listBlock.items.length === 1 && !listBlock.items[0].content) {
        e.preventDefault()
        updateBlock({ ...block, type: 'paragraph', items: undefined })
        return
      }
      return
    }
    
    // For empty blocks (except first), delete and focus previous
    if (blockIndex > 0) {
      e.preventDefault()
      deleteBlock(blockId)
      return
    }
    
    // For first block, if it's not a paragraph, convert to paragraph
    if (blockIndex === 0 && block.type !== 'paragraph') {
      e.preventDefault()
      updateBlock({ ...block, type: 'paragraph' })
    }
  }, [blocks, updateBlock, deleteBlock])

  // Handle slash key - open slash menu
  const handleSlash = useCallback((e: KeyboardEvent<HTMLDivElement>, blockId: string) => {
    const block = blocks.find(b => b.id === blockId)
    if (!block) return
    
    // Only trigger on empty paragraph blocks
    if (block.type !== 'paragraph' || block.content.length > 0) return
    
    // Check if slash is at the beginning
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    
    const range = selection.getRangeAt(0)
    if (range.startOffset !== 0) return
    
    e.preventDefault()
    e.stopPropagation()
    
    // Get position for slash menu
    const blockEl = blockRefs.current.get(blockId)
    if (!blockEl) return
    
    const rect = blockEl.getBoundingClientRect()
    const editorRect = editorRef.current?.getBoundingClientRect()
    if (!editorRect) return
    
    setSlashMenuPosition({
      x: rect.left - editorRect.left + 8, // 8px for the block number
      y: rect.top - editorRect.top + rect.height + 4,
    })
    setSlashSearchQuery('')
    setSlashMenuOpen(true)
  }, [blocks])

  // Handle keyboard shortcuts for block types
  const handleShortcuts = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) return
    
    const shortcuts: Record<string, BlockType> = {
      '1': 'heading1',
      '2': 'heading2',
      '3': 'heading3',
      '4': 'todo',
      '5': 'bulletedList',
      '6': 'numberedList',
      '7': 'code',
      '8': 'callout',
      '9': 'quote',
      '0': 'divider',
    }
    
    const type = shortcuts[e.key]
    if (type && activeBlockId) {
      e.preventDefault()
      const block = blocks.find(b => b.id === activeBlockId)
      if (block && !block.content) {
        updateBlock({ ...block, type })
      }
    }
  }, [activeBlockId, blocks, updateBlock])

  // Handle global keydown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (slashMenuOpen) return // Let slash menu handle its own keys
      
      if (e.target instanceof HTMLElement && e.target.isContentEditable) {
        handleShortcuts(e as unknown as KeyboardEvent<HTMLDivElement>)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [slashMenuOpen, handleShortcuts])

  // Close slash menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (slashMenuOpen && editorRef.current && !editorRef.current.contains(e.target as Node)) {
        setSlashMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [slashMenuOpen])

  // Focus first block on mount
  useEffect(() => {
    if (blocks.length > 0 && !activeBlockId) {
      setActiveBlockId(blocks[0].id)
      setTimeout(() => {
        blockRefs.current.get(blocks[0].id)?.focus()
      }, 0)
    }
  }, [blocks, activeBlockId])

  if (blocks.length === 0) {
    // Create initial empty paragraph
    const initialBlock = createBlock('paragraph')
    setBlocks([initialBlock])
    return null
  }

  return (
    <div
      ref={editorRef}
      className={cn(
        'max-w-3xl mx-auto',
        'prose prose-notion max-w-none',
        'focus-within:ring-2 focus-within:ring-notion-accent focus-within:ring-offset-2 focus-within:ring-offset-notion-bgSecondary'
      )}
      role="textbox"
      aria-multiline="true"
      aria-label="Page content editor"
    >
      {blocks.map((block, index) => (
        <Block
          key={block.id}
          ref={(el) => { 
            if (el) blockRefs.current.set(block.id, el as unknown as HTMLDivElement)
            else blockRefs.current.delete(block.id)
          }}
          block={block}
          index={index}
          isActive={activeBlockId === block.id}
          onUpdate={updateBlock}
          onDelete={deleteBlock}
          onFocus={handleBlockFocus}
          onBlockTypeChange={(id, type) => {
            const block = blocks.find(b => b.id === id)
            if (block && !block.content) {
              updateBlock({ ...block, type })
            }
          }}
          onKeyDown={handleEnter}
          onKeyUp={handleBackspace}
          onSlash={handleSlash}
        />
      ))}
      
      {/* Empty state for new pages */}
      {blocks.length === 1 && blocks[0].type === 'paragraph' && !blocks[0].content && (
        <div className="text-center py-12 text-notion-textMuted">
          <p className="text-lg">{placeholder}</p>
          <p className="text-sm mt-2">Press <kbd className="px-1.5 py-0.5 font-mono bg-notion-bgTertiary rounded">/</kbd> for commands</p>
        </div>
      )}
      
      {/* Slash Command Menu */}
      <SlashCommandMenu
        isOpen={slashMenuOpen}
        position={slashMenuPosition}
        onSelect={handleSlashSelect}
        onClose={() => setSlashMenuOpen(false)}
        searchQuery={slashSearchQuery}
      />
    </div>
  )
}