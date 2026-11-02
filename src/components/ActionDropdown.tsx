'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Trash2, 
  Copy, 
  Star, 
  Archive, 
  RotateCcw,
  MoreHorizontal,
  Edit,
  Download,
  Share2,
  Link,
  Flag,
  Bell,
  Move,
  ChevronRight,
  Check,
  X,
  FolderOpen,
  File,
} from 'lucide-react'
import { useDocumentStore } from '@/store/documentStore'
import type { Document } from '@/types'
import { cn } from '@/lib/utils'

interface ActionItem {
  label: string
  icon: React.ReactNode
  action: () => void
  variant?: 'default' | 'danger' | 'warning'
  disabled?: boolean
  shortcut?: string
}

interface ActionDropdownProps {
  document: Document
  trigger?: React.ReactNode
  children?: React.ReactNode
  additionalActions?: ActionItem[]
  onClose?: () => void
}

// Move to modal component
interface MoveToModalProps {
  isOpen: boolean
  onClose: () => void
  currentDocument: Document
  onMove: (newParentId: string | null) => void
}

function MoveToModal({ isOpen, onClose, currentDocument, onMove }: MoveToModalProps) {
  if (!isOpen) return null

  const { getChildren, getDocument, getDescendants } = useDocumentStore()
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Get root documents (no parent)
  const rootDocuments = getChildren(null)
  
  // Get all documents that can be parents (excluding current document and its descendants)
  const currentDescendants = getDescendants(currentDocument.id)
  const excludedIds = new Set([currentDocument.id, ...currentDescendants.map(d => d.id)])

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectParent = (parentId: string | null) => {
    setSelectedParentId(parentId)
  }

  const handleConfirm = () => {
    onMove(selectedParentId)
    onClose()
  }

  const renderTree = (documents: Document[], level = 0) => (
    <div style={{ paddingLeft: `${level * 16}px` }}>
      {documents.map(doc => {
        if (excludedIds.has(doc.id)) return null
        
        const children = getChildren(doc.id)
        const hasChildren = children.length > 0
        const isExpanded = expandedIds.has(doc.id)
        const isSelected = selectedParentId === doc.id

        return (
          <div key={doc.id}>
            <div
              className={cn(
                'flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors',
                isSelected ? 'bg-notion-accent/20 text-notion-accent' : 'hover:bg-notion-bgSecondary'
              )}
              onClick={() => handleSelectParent(doc.id)}
              style={{ paddingLeft: `${level * 16}px` }}
            >
              {hasChildren && (
                <ChevronRight 
                  className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-90')} 
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpand(doc.id)
                  }}
                />
              )}
              {!hasChildren && <span className="w-4 h-4" />}
              <span className="text-sm">
                {typeof doc.icon === 'string' ? (
                  doc.icon || '📄'
                ) : doc.icon ? (
                  <doc.icon className="w-4 h-4" aria-hidden="true" />
                ) : (
                  '📄'
                )}
              </span>
              <span className="text-sm">{doc.title}</span>
              {isSelected && <Check className="w-4 h-4" />}
            </div>
            {isExpanded && hasChildren && renderTree(children, level + 1)}
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-notion-bg border border-notion-border rounded-xl shadow-xl w-full max-w-md max-h-[70vh] flex flex-col">
        <div className="p-4 border-b border-notion-border flex items-center justify-between">
          <h2 className="text-lg font-medium text-notion-text">Move to</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-notion-bgSecondary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="mb-4">
            <button
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors',
                selectedParentId === null ? 'bg-notion-accent/20 text-notion-accent' : 'hover:bg-notion-bgSecondary'
              )}
              onClick={() => handleSelectParent(null)}
            >
              <span className="text-sm">🏠</span>
              <span>Root (no parent)</span>
              {selectedParentId === null && <Check className="w-4 h-4 ml-auto" />}
            </button>
          </div>
          <div className="text-xs text-notion-textMuted mb-2">Documents</div>
          {renderTree(rootDocuments)}
        </div>
        <div className="p-4 border-t border-notion-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-notion-text hover:bg-notion-bgSecondary rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedParentId && selectedParentId !== null}
            className={cn(
              'px-4 py-2 text-sm rounded transition-colors',
              selectedParentId !== undefined 
                ? 'bg-notion-accent text-white hover:bg-notion-accent/90' 
                : 'bg-notion-bgSecondary text-notion-textMuted cursor-not-allowed'
            )}
          >
            Move
          </button>
        </div>
      </div>
    </div>
  )
}

export function ActionDropdown({ 
  document, 
  trigger, 
  children,
  additionalActions = [],
  onClose 
}: ActionDropdownProps) {
  const { 
    toggleFavorite, 
    toggleArchive, 
    deleteDocument, 
    restoreDocument,
    createDocument,
    updateDocument,
    moveDocument
  } = useDocumentStore()
  
  const [isOpen, setIsOpen] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const focusableElementsRef = useRef<HTMLElement[]>([])

  const isDeleted = document.isDeleted
  const isFavorite = document.isFavorite
  const isArchived = document.isArchived

  const handleMove = useCallback((newParentId: string | null) => {
    moveDocument(document.id, newParentId)
    setShowMoveModal(false)
  }, [document.id, moveDocument])

  // Default actions
  const defaultActions: ActionItem[] = [
    {
      label: 'Duplicate',
      icon: <Copy className="w-4 h-4" />,
      action: () => {
        createDocument({
          title: `Copy of ${document.title}`,
          icon: document.icon,
          coverImage: document.coverImage,
          parentId: document.parentId,
          isArchived: false,
          isFavorite: false,
          isDeleted: false,
          content: document.content,
        })
        setIsOpen(false)
      },
    },
    {
      label: isFavorite ? 'Remove from favorites' : 'Add to favorites',
      icon: <Star className={cn('w-4 h-4', isFavorite ? 'fill-current' : '')} />,
      action: () => {
        toggleFavorite(document.id)
        setIsOpen(false)
      },
      variant: isFavorite ? 'warning' : 'default',
    },
    {
      label: isArchived ? 'Restore from archive' : 'Move to archive',
      icon: <Archive className="w-4 h-4" />,
      action: () => {
        toggleArchive(document.id)
        setIsOpen(false)
      },
      variant: isArchived ? 'default' : 'default',
    },
    {
      label: 'Move to...',
      icon: <Move className="w-4 h-4" />,
      action: () => {
        setShowMoveModal(true)
        setIsOpen(false)
      },
      variant: 'default',
    },
    ...additionalActions,
  ]

  // Trash/restore actions for deleted items
  const trashActions: ActionItem[] = isDeleted ? [
    {
      label: 'Restore',
      icon: <RotateCcw className="w-4 h-4" />,
      action: () => {
        restoreDocument(document.id)
        setIsOpen(false)
      },
      variant: 'default',
    },
    {
      label: 'Delete permanently',
      icon: <Trash2 className="w-4 h-4" />,
      action: () => {
        if (confirm('Permanently delete this page? This cannot be undone.')) {
          deleteDocument(document.id, true)
          setIsOpen(false)
        }
      },
      variant: 'danger',
    },
  ] : [
    {
      label: 'Move to trash',
      icon: <Trash2 className="w-4 h-4" />,
      action: () => {
        deleteDocument(document.id, false)
        setIsOpen(false)
      },
      variant: 'danger',
    },
  ]

  const allActions = [...defaultActions, ...trashActions]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          onClose?.()
        }
      }
    }

    if (isOpen && typeof window !== 'undefined') {
      window.document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          setIsOpen(false)
          onClose?.()
          triggerRef.current?.focus()
          break
        case 'Tab':
          // Focus trap within dropdown
          const focusableElements = focusableElementsRef.current
          if (focusableElements.length === 0) return

          const firstElement = focusableElements[0]
          const lastElement = focusableElements[focusableElements.length - 1]

          if (e.shiftKey) {
            if (window.document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            }
          } else {
            if (window.document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          focusNext()
          break
        case 'ArrowUp':
          e.preventDefault()
          focusPrevious()
          break
        case 'Home':
          e.preventDefault()
          focusableElementsRef.current[0]?.focus()
          break
        case 'End':
          e.preventDefault()
          focusableElementsRef.current[focusableElementsRef.current.length - 1]?.focus()
          break
      }
    }

    if (typeof window !== 'undefined') {
      window.document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, onClose])

  const focusNext = useCallback(() => {
    const elements = focusableElementsRef.current
    const currentIndex = elements.findIndex(el => el === window.document.activeElement)
    const nextIndex = (currentIndex + 1) % elements.length
    elements[nextIndex]?.focus()
  }, [])

  const focusPrevious = useCallback(() => {
    const elements = focusableElementsRef.current
    const currentIndex = elements.findIndex(el => el === window.document.activeElement)
    const prevIndex = (currentIndex - 1 + elements.length) % elements.length
    elements[prevIndex]?.focus()
  }, [])

  // Collect focusable elements after render
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      focusableElementsRef.current = Array.from(
        dropdownRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      )
      focusableElementsRef.current[0]?.focus()
    }
  }, [isOpen])

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const defaultTrigger = (
    <button
      ref={triggerRef}
      onClick={toggleDropdown}
      className={cn(
        'p-2 rounded-lg transition-colors',
        'text-notion-textMuted hover:text-notion-text hover:bg-notion-bgSecondary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent'
      )}
      aria-label="More actions"
      aria-expanded={isOpen}
      aria-haspopup="menu"
      aria-controls={isOpen ? 'action-dropdown-menu' : undefined}
    >
      <MoreHorizontal className="w-5 h-5" />
    </button>
  )

  return (
    <div className="relative inline-block">
      {trigger || defaultTrigger}
      {children}

      {isOpen && (
        <div
          ref={dropdownRef}
          id="action-dropdown-menu"
          className="absolute right-0 top-full mt-2 z-50 w-64 bg-notion-bg border border-notion-border rounded-lg shadow-xl overflow-hidden"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" ref={(el) => {
            if (el) {
              focusableElementsRef.current = Array.from(
                el.querySelectorAll<HTMLElement>(
                  'button[role="menuitem"]'
                )
              )
            }
          }}>
            {allActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                disabled={action.disabled}
                role="menuitem"
                tabIndex={-1}
                className={cn(
                  'w-full px-4 py-2.5 text-left text-sm flex items-center gap-3',
                  'transition-colors',
                  'focus-visible:outline-none focus-visible:bg-notion-bgSecondary',
                  action.disabled ? 'opacity-50 cursor-not-allowed' : '',
                  action.variant === 'danger' 
                    ? 'text-red-400 hover:bg-red-400/10' 
                    : action.variant === 'warning'
                    ? 'text-yellow-400 hover:bg-yellow-400/10'
                    : 'text-notion-text hover:bg-notion-bgSecondary'
                )}
              >
                <span className="flex-shrink-0" aria-hidden="true">{action.icon}</span>
                <span className="flex-1">{action.label}</span>
                {action.shortcut && (
                  <kbd className="text-xs text-notion-textMuted px-1.5 py-0.5 rounded bg-notion-border font-mono">
                    {action.shortcut}
                  </kbd>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <MoveToModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        currentDocument={document}
        onMove={handleMove}
      />
    </div>
  )
}

