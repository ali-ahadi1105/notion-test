'use client'

import { useState, useCallback, useEffect } from 'react'
import { 
  Trash2, 
  RotateCcw, 
  X, 
  Search, 
  Filter,
  ChevronDown,
  Clock,
  Archive,
  Star,
} from 'lucide-react'
import { useDocumentStore } from '@/store/documentStore'
import type { Document } from '@/types'
import { cn } from '@/lib/utils'

interface TrashModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TrashModal({ isOpen, onClose }: TrashModalProps) {
  const { getTrash, restoreDocument, deleteDocument, emptyTrash } = useDocumentStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'old'>('all')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false)

  const trashItems = getTrash()

  // Filter trash items based on search and filter
  const filteredItems = trashItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesFilter = true
    if (filterType === 'recent') {
      // Last 7 days
      matchesFilter = (item.deletedAt || 0) > Date.now() - 7 * 24 * 60 * 60 * 1000
    } else if (filterType === 'old') {
      // Older than 30 days
      matchesFilter = (item.deletedAt || 0) < Date.now() - 30 * 24 * 60 * 60 * 1000
    }
    
    return matchesSearch && matchesFilter
  })

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)))
    }
  }, [filteredItems, selectedItems.size])

  const handleRestoreSelected = useCallback(() => {
    selectedItems.forEach(id => restoreDocument(id))
    setSelectedItems(new Set())
  }, [selectedItems, restoreDocument])

  const handleDeleteSelected = useCallback(() => {
    if (confirm(`Permanently delete ${selectedItems.size} item(s)? This cannot be undone.`)) {
      selectedItems.forEach(id => deleteDocument(id, true))
      setSelectedItems(new Set())
    }
  }, [selectedItems, deleteDocument])

  const handleEmptyTrash = useCallback(async () => {
    if (confirm('Permanently delete all items in trash? This cannot be undone.')) {
      setIsEmptyingTrash(true)
      // Small delay for visual feedback
      setTimeout(() => {
        emptyTrash()
        setIsEmptyingTrash(false)
      }, 300)
    }
  }, [emptyTrash])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      const modal = document.querySelector('[role="dialog"]') as HTMLElement
      if (modal) {
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        firstElement?.focus()

        const handleTab = (e: KeyboardEvent) => {
          if (e.key !== 'Tab') return

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement?.focus()
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement?.focus()
            }
          }
        }

        modal.addEventListener('keydown', handleTab)
        return () => modal.removeEventListener('keydown', handleTab)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="trash-modal-title">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
        data-testid="modal-backdrop"
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl mx-auto mt-20 mb-8 px-4">
        <div className="bg-notion-bg border border-notion-border rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-notion-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h2 id="trash-modal-title" className="text-lg font-semibold text-notion-text">Trash</h2>
              <span className="px-2 py-0.5 text-xs font-medium text-notion-textMuted bg-notion-bgSecondary rounded">
                {trashItems.length} item{trashItems.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {trashItems.length > 0 && (
                <button
                  onClick={handleEmptyTrash}
                  disabled={isEmptyingTrash}
                  className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  {isEmptyingTrash ? 'Emptying...' : 'Empty Trash'}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-notion-textMuted hover:text-notion-text hover:bg-notion-bgSecondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent"
                aria-label="Close trash"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          {trashItems.length > 0 && (
            <div className="p-4 border-b border-notion-border bg-notion-bgSecondary/50">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notion-textMuted" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search trash..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-notion-bgSecondary border border-notion-border rounded-lg text-notion-text placeholder:text-notion-textMuted focus:outline-none focus:ring-2 focus:ring-notion-accent"
                    aria-label="Search trash"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as 'all' | 'recent' | 'old')}
                    className="pl-10 pr-8 py-2 text-sm bg-notion-bgSecondary border border-notion-border rounded-lg text-notion-text focus:outline-none focus:ring-2 focus:ring-notion-accent appearance-none cursor-pointer"
                    aria-label="Filter by date"
                  >
                    <option value="all">All Time</option>
                    <option value="recent">Last 7 Days</option>
                    <option value="old">Older than 30 Days</option>
                  </select>
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notion-textMuted pointer-events-none" aria-hidden="true" />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notion-textMuted pointer-events-none" aria-hidden="true" />
                </div>
              </div>
            </div>
          )}

          {/* Trash List */}
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-notion-bgSecondary flex items-center justify-center mb-4">
                  <Trash2 className="w-8 h-8 text-notion-textMuted" />
                </div>
                <h3 className="text-lg font-medium text-notion-text mb-1">
                  {searchQuery || filterType !== 'all' ? 'No matching items' : 'Trash is empty'}
                </h3>
                <p className="text-notion-textMuted text-sm">
                  {searchQuery || filterType !== 'all' 
                    ? 'Try adjusting your search or filter' 
                    : 'Deleted pages will appear here'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-notion-border" role="list" aria-label="Trash items">
                {filteredItems.map((item) => (
                  <TrashItem
                    key={item.id}
                    item={item}
                    isSelected={selectedItems.has(item.id)}
                    onToggleSelect={() => handleToggleSelect(item.id)}
                    onRestore={() => restoreDocument(item.id)}
                    onDelete={() => deleteDocument(item.id, true)}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* Bulk Actions Bar */}
          {selectedItems.size > 0 && (
            <div className="p-4 border-t border-notion-border bg-notion-bgSecondary/50 sticky bottom-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-sm text-notion-textSecondary">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRestoreSelected}
                    className="px-4 py-2 text-sm bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="px-4 py-2 text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface TrashItemProps {
  item: Document
  isSelected: boolean
  onToggleSelect: () => void
  onRestore: () => void
  onDelete: () => void
}

function TrashItem({ item, isSelected, onToggleSelect, onRestore, onDelete }: TrashItemProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  return (
    <li className={cn(
      'px-4 py-3 transition-colors',
      isSelected ? 'bg-notion-accent/5' : 'hover:bg-notion-bgSecondary/50'
    )}>
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggleSelect}
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
            isSelected
              ? 'bg-notion-accent border-notion-accent text-white'
              : 'border-notion-border text-transparent hover:border-notion-accent'
          )}
          aria-label={isSelected ? 'Deselect' : 'Select'}
          aria-pressed={isSelected}
        >
          {isSelected && <X className="w-3 h-3" />}
        </button>

        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-notion-bgSecondary border border-notion-border flex items-center justify-center flex-shrink-0">
          {item.icon ? (
            typeof item.icon === 'string' ? (
              <span className="text-xl" aria-hidden="true">{item.icon}</span>
            ) : (
              <item.icon className="w-5 h-5 text-notion-textMuted" aria-hidden="true" />
            )
          ) : (
            <span className="text-xl">📄</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-notion-text truncate">{item.title}</h4>
            {item.isFavorite && (
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-label="Favorite" />
            )}
            {item.isArchived && (
              <Archive className="w-3.5 h-3.5 text-blue-400" aria-label="Archived" />
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-notion-textMuted">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              Deleted {formatDate(item.deletedAt || 0)}
            </span>
            {item.parentId && (
              <span className="flex items-center gap-1">
                Original location: {item.slug.split('/').slice(0, -1).join(' / ')}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onRestore}
            className="p-2 rounded-lg text-green-400 hover:bg-green-400/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
            aria-label="Restore"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            aria-label="Delete permanently"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </li>
  )
}