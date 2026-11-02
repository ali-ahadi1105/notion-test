'use client'

import { cn } from '@/lib/utils'
import type { Block } from '@/types'
import { KeyboardEvent, FocusEvent } from 'react'

interface BlockProps {
  block: Block
  index: number
  isActive: boolean
  onUpdate: (block: Block) => void
  onDelete: (id: string) => void
  onFocus: (id: string) => void
  onBlockTypeChange: (id: string, newType: Block['type']) => void
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>, blockId: string) => void
  onKeyUp?: (e: KeyboardEvent<HTMLDivElement>, blockId: string) => void
  onSlash?: (e: KeyboardEvent<HTMLDivElement>, blockId: string) => void
  onPaste?: (e: React.ClipboardEvent<HTMLDivElement>, blockId: string) => void
}

export function Block({ block, index, isActive, onUpdate, onDelete, onFocus, onBlockTypeChange, onKeyDown, onKeyUp, onSlash, onPaste }: BlockProps) {
  // Base block wrapper - individual block types will render their own content
  return (
    <div
      className={cn(
        'relative py-2 px-4 transition-colors',
        'hover:bg-notion-bgSecondary',
        isActive && 'bg-notion-bgSecondary',
        'focus-within:ring-2 focus-within:ring-notion-accent focus-within:ring-offset-2 focus-within:ring-offset-notion-bgSecondary'
      )}
      data-block-id={block.id}
      data-block-type={block.type}
    >
      {/* Block drag handle / type indicator */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-notion-textMuted hover:text-notion-text">
        <span className="text-xs font-mono">{index + 1}</span>
      </div>
      
      {/* Block content - will be rendered by specific block components */}
      <div className="ml-8">
        {renderBlockContent(block, isActive, onUpdate, onDelete, onFocus, onBlockTypeChange, onKeyDown, onKeyUp, onSlash)}
      </div>
    </div>
  )
}

function renderBlockContent(
  block: Block,
  isActive: boolean,
  onUpdate: (block: Block) => void,
  onDelete: (id: string) => void,
  onFocus: (id: string) => void,
  onBlockTypeChange: (id: string, newType: Block['type']) => void,
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement> | React.KeyboardEvent<HTMLTextAreaElement>, blockId: string) => void,
  onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement> | React.KeyboardEvent<HTMLTextAreaElement>, blockId: string) => void,
  onSlash?: (e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => void
) {
  switch (block.type) {
    case 'paragraph':
      return <ParagraphBlock block={block} isActive={isActive} onUpdate={onUpdate} onDelete={onDelete} onFocus={onFocus} onBlockTypeChange={onBlockTypeChange} onKeyDown={onKeyDown} onKeyUp={onKeyUp} onSlash={onSlash} />
    case 'heading1':
    case 'heading2':
    case 'heading3':
      return <HeadingBlock block={block} isActive={isActive} onUpdate={onUpdate} onDelete={onDelete} onFocus={onFocus} onBlockTypeChange={onBlockTypeChange} onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
    case 'todo':
      return <TodoBlock block={block} isActive={isActive} onUpdate={onUpdate} onDelete={onDelete} onFocus={onFocus} onBlockTypeChange={onBlockTypeChange} onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
    case 'bulletedList':
    case 'numberedList':
      return <ListBlock block={block} isActive={isActive} onUpdate={onUpdate} onDelete={onDelete} onFocus={onFocus} onBlockTypeChange={onBlockTypeChange} onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
    case 'code':
      return <CodeBlock block={block} isActive={isActive} onUpdate={onUpdate} onDelete={onDelete} onFocus={onFocus} onBlockTypeChange={onBlockTypeChange} onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
    case 'callout':
      return <CalloutBlock block={block} isActive={isActive} onUpdate={onUpdate} onDelete={onDelete} onFocus={onFocus} onBlockTypeChange={onBlockTypeChange} onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
    case 'quote':
      return <QuoteBlock block={block} isActive={isActive} onUpdate={onUpdate} onDelete={onDelete} onFocus={onFocus} onBlockTypeChange={onBlockTypeChange} onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
    case 'divider':
      return <DividerBlock block={block} isActive={isActive} onUpdate={onUpdate} onDelete={onDelete} onFocus={onFocus} onBlockTypeChange={onBlockTypeChange} onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
    default:
      return <ParagraphBlock block={block} isActive={isActive} onUpdate={onUpdate} onDelete={onDelete} onFocus={onFocus} onBlockTypeChange={onBlockTypeChange} onKeyDown={onKeyDown} onKeyUp={onKeyUp} onSlash={onSlash} />
  }
}

// Paragraph Block Component
interface ParagraphBlockProps {
  block: Block
  isActive: boolean
  onUpdate: (block: Block) => void
  onDelete: (id: string) => void
  onFocus: (id: string) => void
  onBlockTypeChange: (id: string, newType: Block['type']) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => void
  onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => void
  onSlash?: (e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => void
}

function ParagraphBlock({ block, isActive, onUpdate, onDelete, onFocus, onBlockTypeChange, onKeyDown, onKeyUp, onSlash }: ParagraphBlockProps) {
  const paragraphBlock = block as Block & { type: 'paragraph'; content: string }
  
  const handleChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || ''
    onUpdate({ ...paragraphBlock, content: newContent, updatedAt: Date.now() })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // Signal to parent to create new block
      onBlockTypeChange(block.id, 'paragraph')
    } else if (e.key === 'Backspace' && !paragraphBlock.content) {
      e.preventDefault()
      onDelete(block.id)
    } else if (e.key === '/' && !paragraphBlock.content && e.target === e.currentTarget) {
      // Trigger slash menu
      e.preventDefault()
      onSlash?.(e, block.id)
    }
    // Pass to parent handler
    onKeyDown?.(e, block.id)
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyUp?.(e, block.id)
  }

  return (
    <div
      className="min-h-[24px] outline-none"
      contentEditable
      suppressContentEditableWarning
      onInput={handleChange}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onFocus={() => onFocus(block.id)}
      role="textbox"
      aria-label="Start typing..."
      data-placeholder="Start typing..."
      style={{ 
        minHeight: '24px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {paragraphBlock.content || <span className="text-notion-textMuted">Start typing...</span>}
    </div>
  )
}

// Heading Block Component
interface HeadingBlockProps {
  block: Block
  isActive: boolean
  onUpdate: (block: Block) => void
  onDelete: (id: string) => void
  onFocus: (id: string) => void
  onBlockTypeChange: (id: string, newType: Block['type']) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => void
  onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => void
}

function HeadingBlock({ block, isActive, onUpdate, onDelete, onFocus, onBlockTypeChange, onKeyDown, onKeyUp }: HeadingBlockProps) {
  const headingBlock = block as Block & { type: 'heading1' | 'heading2' | 'heading3'; content: string }
  const level = headingBlock.type === 'heading1' ? 1 : headingBlock.type === 'heading2' ? 2 : 3
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  const className = level === 1 ? 'text-3xl font-light' : level === 2 ? 'text-2xl font-normal' : 'text-xl font-medium'
  
  const handleChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || ''
    onUpdate({ ...headingBlock, content: newContent, updatedAt: Date.now() })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onBlockTypeChange(block.id, 'paragraph')
    } else if (e.key === 'Backspace' && !headingBlock.content) {
      e.preventDefault()
      onDelete(block.id)
    }
    onKeyDown?.(e, block.id)
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyUp?.(e, block.id)
  }

  return (
    <Tag
      className={cn(className, 'text-notion-text min-h-[24px] outline-none')}
      contentEditable
      suppressContentEditableWarning
      onInput={handleChange}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onFocus={() => onFocus(block.id)}
      role="textbox"
      aria-label={`Heading ${level}`}
      data-placeholder={`Heading ${level}`}
    >
      {headingBlock.content || <span className="text-notion-textMuted">Heading {level}</span>}
    </Tag>
  )
}

// Todo Block Component
interface TodoBlockProps {
  block: Block
  isActive: boolean
  onUpdate: (block: Block) => void
  onDelete: (id: string) => void
  onFocus: (id: string) => void
  onBlockTypeChange: (id: string, newType: Block['type']) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => void
  onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => void
}

function TodoBlock({ block, isActive, onUpdate, onDelete, onFocus, onBlockTypeChange, onKeyDown, onKeyUp }: TodoBlockProps) {
  const todoBlock = block as Block & { type: 'todo'; content: string; checked: boolean }
  
  const handleCheckboxChange = () => {
    onUpdate({ ...todoBlock, checked: !todoBlock.checked, updatedAt: Date.now() })
  }

  const handleChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || ''
    onUpdate({ ...todoBlock, content: newContent, updatedAt: Date.now() })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onBlockTypeChange(block.id, 'todo')
    } else if (e.key === 'Backspace' && !todoBlock.content) {
      e.preventDefault()
      onDelete(block.id)
    } else if (e.key === ' ') {
      // Toggle checkbox on space
      if (e.target === e.currentTarget && !todoBlock.content) {
        e.preventDefault()
        handleCheckboxChange()
      }
    }
    onKeyDown?.(e, block.id)
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyUp?.(e, block.id)
  }

  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={todoBlock.checked}
        onChange={handleCheckboxChange}
        className="mt-1 w-4 h-4 rounded border-notion-border text-notion-accent focus:ring-notion-accent"
        aria-label="Todo checkbox"
      />
      <div
        className={cn(
          'flex-1 min-h-[24px] outline-none',
          todoBlock.checked && 'line-through text-notion-textMuted'
        )}
        contentEditable
        suppressContentEditableWarning
        onInput={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onFocus={() => onFocus(block.id)}
        role="textbox"
        aria-label="To-do"
        data-placeholder="To-do"
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {todoBlock.content || <span className="text-notion-textMuted">To-do</span>}
      </div>
    </div>
  )
}

// List Block Component
interface ListBlockProps {
  block: Block
  isActive: boolean
  onUpdate: (block: Block) => void
  onDelete: (id: string) => void
  onFocus: (id: string) => void
  onBlockTypeChange: (id: string, newType: Block['type']) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => void
  onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => void
}

function ListBlock({ block, isActive, onUpdate, onDelete, onFocus, onBlockTypeChange, onKeyDown, onKeyUp }: ListBlockProps) {
  const listBlock = block as Block & { type: 'bulletedList' | 'numberedList'; items: Array<{ id: string; content: string; checked?: boolean }> }
  
  const handleItemChange = (itemId: string, newContent: string) => {
    const newItems = listBlock.items.map(item => 
      item.id === itemId ? { ...item, content: newContent } : item
    )
    onUpdate({ ...listBlock, items: newItems, updatedAt: Date.now() })
  }

  const handleAddItem = () => {
    const newItem = { id: `item-${Date.now()}`, content: '' }
    onUpdate({ ...listBlock, items: [...listBlock.items, newItem], updatedAt: Date.now() })
  }

  const handleRemoveItem = (itemId: string) => {
    if (listBlock.items.length <= 1) {
      onDelete(block.id)
      return
    }
    const newItems = listBlock.items.filter(item => item.id !== itemId)
    onUpdate({ ...listBlock, items: newItems, updatedAt: Date.now() })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, itemIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddItem()
    } else if (e.key === 'Backspace' && !listBlock.items[itemIndex]?.content) {
      e.preventDefault()
      if (listBlock.items.length > 1) {
        handleRemoveItem(listBlock.items[itemIndex].id)
      } else {
        onDelete(block.id)
      }
    }
    onKeyDown?.(e, block.id)
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyUp?.(e, block.id)
  }

  return (
    <div className="space-y-1" role="list">
      {listBlock.items.map((item, index) => (
        <div key={item.id} className="flex items-start gap-3" role="listitem" onFocus={() => onFocus(block.id)}>
          {listBlock.type === 'bulletedList' ? (
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-notion-textMuted flex-shrink-0" aria-hidden="true" />
          ) : (
            <span className="mt-1 text-sm text-notion-textMuted flex-shrink-0 w-6 text-right" aria-hidden="true">
              {index + 1}.
            </span>
          )}
          <div
            className="flex-1 min-h-[24px] outline-none"
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => handleItemChange(item.id, e.currentTarget.textContent || '')}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onKeyUp={handleKeyUp}
            onFocus={() => onFocus(block.id)}
            role="textbox"
            aria-label={listBlock.type === 'bulletedList' ? 'List item' : `${index + 1}.`}
            data-placeholder={listBlock.type === 'bulletedList' ? 'List item' : `${index + 1}.`}
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {item.content || <span className="text-notion-textMuted">{listBlock.type === 'bulletedList' ? 'List item' : `${index + 1}.`}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

// Code Block Component
interface CodeBlockProps {
  block: Block
  isActive: boolean
  onUpdate: (block: Block) => void
  onDelete: (id: string) => void
  onFocus: (id: string) => void
  onBlockTypeChange: (id: string, newType: Block['type']) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>, blockId: string) => void
  onKeyUp?: (e: React.KeyboardEvent<HTMLTextAreaElement>, blockId: string) => void
}

function CodeBlock({ block, isActive, onUpdate, onDelete, onFocus, onBlockTypeChange, onKeyDown, onKeyUp }: CodeBlockProps) {
  const codeBlock = block as Block & { type: 'code'; content: string; language: string }
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...codeBlock, content: e.target.value, updatedAt: Date.now() })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onBlockTypeChange(block.id, 'paragraph')
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onBlockTypeChange(block.id, 'paragraph')
    }
    onKeyDown?.(e, block.id)
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyUp?.(e, block.id)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeBlock.content)
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-notion-textMuted font-mono">{codeBlock.language || 'plaintext'}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-notion-textMuted hover:text-notion-text transition-colors px-2 py-1 rounded bg-notion-bgSecondary hover:bg-notion-bgTertiary"
          aria-label="Copy code"
        >
          Copy
        </button>
      </div>
      <textarea
        className="w-full min-h-[100px] font-mono text-sm bg-notion-bgTertiary border border-notion-border rounded-lg p-3 outline-none focus:ring-2 focus:ring-notion-accent resize-none"
        value={codeBlock.content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onFocus={() => onFocus(block.id)}
        placeholder="Write code..."
        spellCheck={false}
      />
    </div>
  )
}

// Callout Block Component
interface CalloutBlockProps {
  block: Block
  isActive: boolean
  onUpdate: (block: Block) => void
  onDelete: (id: string) => void
  onFocus: (id: string) => void
  onBlockTypeChange: (id: string, newType: Block['type']) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => void
  onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => void
}

function CalloutBlock({ block, isActive, onUpdate, onDelete, onFocus, onBlockTypeChange, onKeyDown, onKeyUp }: CalloutBlockProps) {
  const calloutBlock = block as Block & { type: 'callout'; content: string; icon: string; backgroundColor: string }
  
  const handleChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || ''
    onUpdate({ ...calloutBlock, content: newContent, updatedAt: Date.now() })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onBlockTypeChange(block.id, 'paragraph')
    }
    onKeyDown?.(e, block.id)
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyUp?.(e, block.id)
  }

  const calloutStyle = {
    backgroundColor: calloutBlock.backgroundColor + '20', // 20% opacity
    borderLeft: `4px solid ${calloutBlock.backgroundColor}`,
  }

  return (
    <div
      className="rounded-lg p-4"
      style={calloutStyle as React.CSSProperties}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5 flex-shrink-0" aria-hidden="true">{calloutBlock.icon || '💡'}</span>
        <div
          className="flex-1 min-h-[24px] outline-none"
          contentEditable
          suppressContentEditableWarning
          onInput={handleChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onFocus={() => onFocus(block.id)}
          role="textbox"
          aria-label="Callout"
          data-placeholder="Callout"
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {calloutBlock.content || <span className="text-notion-textMuted">Callout</span>}
        </div>
      </div>
    </div>
  )
}

// Quote Block Component
interface QuoteBlockProps {
  block: Block
  isActive: boolean
  onUpdate: (block: Block) => void
  onDelete: (id: string) => void
  onFocus: (id: string) => void
  onBlockTypeChange: (id: string, newType: Block['type']) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => void
  onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => void
}

function QuoteBlock({ block, isActive, onUpdate, onDelete, onFocus, onBlockTypeChange, onKeyDown, onKeyUp }: QuoteBlockProps) {
  const quoteBlock = block as Block & { type: 'quote'; content: string }
  
  const handleChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || ''
    onUpdate({ ...quoteBlock, content: newContent, updatedAt: Date.now() })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onBlockTypeChange(block.id, 'paragraph')
    } else if (e.key === 'Backspace' && !quoteBlock.content) {
      e.preventDefault()
      onDelete(block.id)
    }
    onKeyDown?.(e, block.id)
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyUp?.(e, block.id)
  }

  return (
    <blockquote className="border-l-4 border-notion-accent pl-4 italic text-notion-textSecondary">
      <div
        className="min-h-[24px] outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onFocus={() => onFocus(block.id)}
        role="textbox"
        aria-label="Quote"
        data-placeholder="Quote"
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {quoteBlock.content || <span className="text-notion-textMuted">Quote</span>}
      </div>
    </blockquote>
  )
}

// Divider Block Component
interface DividerBlockProps {
  block: Block
  isActive: boolean
  onUpdate: (block: Block) => void
  onDelete: (id: string) => void
  onFocus: (id: string) => void
  onBlockTypeChange: (id: string, newType: Block['type']) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => void
  onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => void
}

function DividerBlock({ block, isActive, onUpdate, onDelete, onFocus, onBlockTypeChange, onKeyDown, onKeyUp }: DividerBlockProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onBlockTypeChange(block.id, 'paragraph')
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      onDelete(block.id)
    }
    onKeyDown?.(e, block.id)
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyUp?.(e, block.id)
  }

  return (
    <div
      className="w-full"
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onFocus={() => onFocus(block.id)}
      tabIndex={0}
      role="separator"
      aria-orientation="horizontal"
    >
      <hr className="border-notion-border" />
    </div>
  )
}