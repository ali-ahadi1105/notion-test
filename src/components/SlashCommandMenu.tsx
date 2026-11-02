'use client'

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from 'react'
import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  CheckSquare, 
  List, 
  ListOrdered, 
  Code, 
  MessageSquare, 
  Quote, 
  Minus,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BlockType } from '@/types'

interface SlashCommandItem {
  type: BlockType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  shortcut?: string
}

const SLASH_COMMANDS: SlashCommandItem[] = [
  { type: 'paragraph', label: 'Text', description: 'Start writing with plain text', icon: Type },
  { type: 'heading1', label: 'Heading 1', description: 'Large section heading', icon: Heading1, shortcut: 'Ctrl+1' },
  { type: 'heading2', label: 'Heading 2', description: 'Medium section heading', icon: Heading2, shortcut: 'Ctrl+2' },
  { type: 'heading3', label: 'Heading 3', description: 'Small section heading', icon: Heading3, shortcut: 'Ctrl+3' },
  { type: 'todo', label: 'To-do list', description: 'Track tasks with checkboxes', icon: CheckSquare },
  { type: 'bulletedList', label: 'Bulleted list', description: 'Create a simple bullet list', icon: List },
  { type: 'numberedList', label: 'Numbered list', description: 'Create a numbered list', icon: ListOrdered },
  { type: 'code', label: 'Code block', description: 'Display code with syntax highlighting', icon: Code },
  { type: 'callout', label: 'Callout', description: 'Highlight important information', icon: MessageSquare },
  { type: 'quote', label: 'Quote', description: 'Capture a quote or excerpt', icon: Quote },
  { type: 'divider', label: 'Divider', description: 'Add a visual separator', icon: Minus },
]

interface SlashCommandMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  onSelect: (type: BlockType) => void
  onClose: () => void
  searchQuery?: string
}

export function SlashCommandMenu({ 
  isOpen, 
  position, 
  onSelect, 
  onClose,
  searchQuery = ''
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement[]>([])

  // Filter commands based on search query
  const filteredCommands = SLASH_COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Reset selection when menu opens/closes or query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [isOpen, searchQuery])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex].type)
          onClose()
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
      case 'Tab':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
        break
    }
  }, [filteredCommands, selectedIndex, onSelect, onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (itemsRef.current[selectedIndex]) {
      itemsRef.current[selectedIndex].scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  if (!isOpen || filteredCommands.length === 0) return null

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-50 w-64 bg-notion-bgSecondary border border-notion-border rounded-lg shadow-lg',
        'overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150'
      )}
      style={{
        left: position.x,
        top: position.y,
      }}
      onKeyDown={handleKeyDown}
      role="menu"
      aria-label="Slash commands"
    >
      <div className="p-1">
        {filteredCommands.map((command, index) => (
          <div
            key={command.type}
            ref={(el) => { itemsRef.current[index] = el }}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors',
              'text-sm text-notion-text',
              index === selectedIndex 
                ? 'bg-notion-bgTertiary text-notion-text' 
                : 'hover:bg-notion-bgTertiary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent'
            )}
            role="menuitem"
            tabIndex={index === selectedIndex ? 0 : -1}
            onClick={() => {
              onSelect(command.type)
              onClose()
            }}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <command.icon className="w-5 h-5 text-notion-textMuted flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{command.label}</div>
              <div className="text-xs text-notion-textMuted truncate">{command.description}</div>
            </div>
            {command.shortcut && (
              <kbd className="px-1.5 py-0.5 text-xs font-mono text-notion-textMuted bg-notion-bgTertiary rounded">
                {command.shortcut}
              </kbd>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}