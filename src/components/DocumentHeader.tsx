'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Image, 
  Smile, 
  Palette, 
  Trash2, 
  X, 
  ChevronDown,
  MoreHorizontal,
  Star,
  Copy,
  Archive,
  RotateCcw,
  Upload,
  Search,
} from 'lucide-react'
import { useDocumentStore } from '@/store/documentStore'
import type { Document, DocumentCoverImage } from '@/types'
import { cn } from '@/lib/utils'

// Color presets for cover images
const COVER_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#e94560', '#8b0000',
  '#2c3e50', '#27ae60', '#8e44ad', '#f39c12', '#c0392b',
  '#34495e', '#1abc9c', '#9b59b6', '#e67e22', '#e74c3c',
]

// Emoji categories for icon picker
const EMOJI_CATEGORIES = {
  'Frequently Used': ['📄', '📝', '📋', '📁', '📂', '⭐', '🔖', '🏷️', '📌', '🔔'],
  'Objects': ['💡', '🔑', '🔒', '🔓', '📝', '📋', '📊', '📈', '📉', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️'],
  'Nature': ['🌱', '🌿', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌸', '🌹', '🌺'],
  'Food': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥝', '🍅', '🥑', '🥦'],
  'Activities': ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🏒', '🏑', '🏏', '🏹', '🎣'],
  'Travel': ['🚗', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '✈️'],
  'Symbols': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '✨', '⭐', '🌟', '⚡', '💫', '🌈', '☀️'],
  'Flags': ['🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏴‍☠️', '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇯🇵', '🇨🇳', '🇧🇷', '🇮🇳'],
}

interface DocumentHeaderProps {
  document: Document | null
  onClose?: () => void
}

export function DocumentHeader({ document, onClose }: DocumentHeaderProps) {
  const { updateDocument, toggleFavorite, toggleArchive, deleteDocument, restoreDocument } = useDocumentStore()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(document?.title || '')
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [showCoverPicker, setShowCoverPicker] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<string>('Frequently Used')
  const [iconSearch, setIconSearch] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const iconPickerRef = useRef<HTMLDivElement>(null)
  const coverPickerRef = useRef<HTMLDivElement>(null)
  const actionMenuRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Auto-save title with debounce
  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle)
    if (document && debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    if (document) {
      debounceRef.current = setTimeout(() => {
        updateDocument(document.id, { title: newTitle.trim() || 'Untitled' })
      }, 500)
    }
  }, [document, updateDocument])

  // Handle title blur - save immediately
  const handleTitleBlur = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    if (document && title.trim() !== document.title) {
      updateDocument(document.id, { title: title.trim() || 'Untitled' })
    }
    setIsEditingTitle(false)
  }, [document, title, updateDocument])

  // Handle keyboard events for title editing
  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      setTitle(document?.title || '')
      e.currentTarget.blur()
    }
  }, [document])

  // Icon picker handlers
  const handleIconSelect = useCallback((emoji: string) => {
    if (document) {
      updateDocument(document.id, { icon: emoji })
    }
    setShowIconPicker(false)
  }, [document, updateDocument])

  const handleCustomIcon = useCallback(() => {
    const emoji = prompt('Enter an emoji:')
    if (emoji && document) {
      updateDocument(document.id, { icon: emoji })
    }
    setShowIconPicker(false)
  }, [document, updateDocument])

  // Cover image handlers
  const handleColorCoverSelect = useCallback((color: string) => {
    if (document) {
      updateDocument(document.id, { coverImage: { type: 'color', value: color } })
    }
    setShowCoverPicker(false)
  }, [document, updateDocument])

  const handleImageCoverSelect = useCallback(() => {
    if (coverImageUrl && document) {
      updateDocument(document.id, { coverImage: { type: 'image', value: coverImageUrl } })
      setCoverImageUrl('')
      setShowCoverPicker(false)
    }
  }, [document, coverImageUrl, updateDocument])

  const handleRemoveCover = useCallback(() => {
    if (document) {
      updateDocument(document.id, { coverImage: { type: 'none', value: '' } })
    }
    setShowCoverPicker(false)
  }, [document, updateDocument])

  // Action menu handlers
  const handleDuplicate = useCallback(() => {
    if (document) {
      // Create a copy with "Copy of " prefix
      const { createDocument } = useDocumentStore.getState()
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
    }
    setShowActionMenu(false)
  }, [document])

  const handleDelete = useCallback(() => {
    if (document) {
      if (document.isDeleted) {
        // Permanent delete
        if (confirm('Permanently delete this page? This cannot be undone.')) {
          deleteDocument(document.id, true)
        }
      } else {
        // Soft delete
        deleteDocument(document.id, false)
      }
    }
    setShowActionMenu(false)
  }, [document, deleteDocument])

  const handleRestore = useCallback(() => {
    if (document && document.isDeleted) {
      restoreDocument(document.id)
    }
    setShowActionMenu(false)
  }, [document, restoreDocument])

  const handleToggleFavorite = useCallback(() => {
    if (document) {
      toggleFavorite(document.id)
    }
    setShowActionMenu(false)
  }, [document, toggleFavorite])

  const handleToggleArchive = useCallback(() => {
    if (document) {
      toggleArchive(document.id)
    }
    setShowActionMenu(false)
  }, [document, toggleArchive])

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(event.target as Node)) {
        setShowIconPicker(false)
      }
      if (coverPickerRef.current && !coverPickerRef.current.contains(event.target as Node)) {
        setShowCoverPicker(false)
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setShowActionMenu(false)
      }
    }

    if (typeof window !== 'undefined') {
      window.document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [])

  // Focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  if (!document) {
    return null
  }

  const isDeleted = document.isDeleted
  const isFavorite = document.isFavorite
  const isArchived = document.isArchived

  // Filter emojis based on search
  const filteredEmojis = EMOJI_CATEGORIES[activeEmojiCategory]?.filter(emoji => 
    emoji.toLowerCase().includes(iconSearch.toLowerCase())
  ) || []

  return (
    <div className={cn('border-b border-notion-border bg-notion-bg', document.coverImage?.type === 'image' && 'relative')}>
      {/* Cover Image Banner */}
      {document.coverImage && document.coverImage.type !== 'none' && (
        <div 
          data-testid="cover-banner"
          className="w-full h-32 sm:h-40 relative"
          style={{
            backgroundColor: document.coverImage.type === 'color' ? document.coverImage.value : 'transparent',
            backgroundImage: document.coverImage.type === 'image' ? `url(${document.coverImage.value})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {document.coverImage.type === 'image' && (
            <div className="absolute inset-0 bg-black/30" />
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="max-w-4xl mx-auto flex items-end justify-between">
              <div>
                <span className="text-xs text-white/80 uppercase tracking-wider">
                  {isDeleted ? 'Trash' : isArchived ? 'Archive' : 'Page'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCoverPicker(true)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    'bg-white/10 hover:bg-white/20 text-white',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
                  )}
                  aria-label="Change cover"
                >
                  <Image className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title Bar */}
      <div className="max-w-4xl mx-auto px-6 py-4 sm:py-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowIconPicker(true)}
              className={cn(
                'w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all',
                'bg-notion-bgSecondary border border-notion-border',
                'hover:bg-notion-border hover:scale-105',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent'
              )}
              aria-label="Change icon"
            >
              {document.icon ? (
                typeof document.icon === 'string' ? (
                  <span className="text-3xl sm:text-4xl" aria-hidden="true">{document.icon}</span>
                ) : (
                  <document.icon className="w-7 h-7 sm:w-8 sm:h-8 text-notion-text" aria-hidden="true" />
                )
              ) : (
                <span className="text-3xl sm:text-4xl">📄</span>
              )}
            </button>
            
            {/* Icon Picker Popover */}
            {showIconPicker && (
              <div
                ref={iconPickerRef}
                className="absolute top-full left-0 mt-2 z-50 w-80 bg-notion-bg border border-notion-border rounded-xl shadow-lg overflow-hidden"
                role="dialog"
                aria-label="Select icon"
              >
                <div className="p-3 border-b border-notion-border flex items-center justify-between">
                  <h3 className="text-sm font-medium text-notion-text">Choose Icon</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search emojis..."
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm bg-notion-bgSecondary border border-notion-border rounded-lg text-notion-text placeholder:text-notion-textMuted focus:outline-none focus:ring-2 focus:ring-notion-accent"
                    />
                    <button
                      onClick={handleCustomIcon}
                      className="px-3 py-1.5 text-sm bg-notion-accent text-white rounded-lg hover:bg-notion-accent/90 transition-colors"
                    >
                      Custom
                    </button>
                  </div>
                </div>
                
                {/* Category tabs */}
                <div className="px-2 py-2 border-b border-notion-border overflow-x-auto flex gap-1">
                  {Object.keys(EMOJI_CATEGORIES).map((category) => (
                    <button
                      key={category}
                      onClick={() => { setActiveEmojiCategory(category); setIconSearch(''); }}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
                        activeEmojiCategory === category
                          ? 'bg-notion-accent text-white'
                          : 'text-notion-textMuted hover:text-notion-text hover:bg-notion-bgSecondary'
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                {/* Emoji grid */}
                <div className="p-2 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-8 gap-1">
                    {filteredEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleIconSelect(emoji)}
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition-colors',
                          'hover:bg-notion-bgSecondary hover:scale-110',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent'
                        )}
                        aria-label={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                    {filteredEmojis.length === 0 && (
                      <div className="col-span-8 py-8 text-center text-notion-textMuted text-sm">
                        No emojis found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className={cn(
                  'w-full bg-transparent border-none outline-none',
                  'text-3xl sm:text-4xl font-light text-notion-text',
                  'placeholder:text-notion-textMuted',
                  'px-1 py-0.5 rounded',
                  'focus:ring-2 focus:ring-notion-accent focus:ring-offset-2 focus:ring-offset-notion-bg'
                )}
                placeholder="Untitled"
                autoComplete="off"
                spellCheck={false}
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className={cn(
                  'text-3xl sm:text-4xl font-light text-notion-text',
                  'hover:bg-notion-bgSecondary rounded px-1 py-0.5',
                  'cursor-text transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent focus-visible:ring-offset-2'
                )}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setIsEditingTitle(true)
                  }
                }}
              >
                {title || 'Untitled'}
              </h1>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm text-notion-textMuted">
              <span>Last edited {new Date(document.updatedAt).toLocaleDateString()}</span>
              {document.createdAt !== document.updatedAt && (
                <>
                  <span>•</span>
                  <span>Created {new Date(document.createdAt).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Favorite */}
            <button
              onClick={handleToggleFavorite}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isFavorite
                  ? 'text-yellow-400 bg-yellow-400/10'
                  : 'text-notion-textMuted hover:text-notion-text hover:bg-notion-bgSecondary'
              )}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={isFavorite}
            >
              <Star className={cn('w-5 h-5', isFavorite ? 'fill-current' : '')} />
            </button>

            {/* More Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowActionMenu(!showActionMenu)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'text-notion-textMuted hover:text-notion-text hover:bg-notion-bgSecondary',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent'
                )}
                aria-label="More actions"
                aria-expanded={showActionMenu}
                aria-haspopup="menu"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {showActionMenu && (
                <div
                  ref={actionMenuRef}
                  className="absolute right-0 top-full mt-2 z-50 w-56 bg-notion-bg border border-notion-border rounded-lg shadow-lg overflow-hidden"
                  role="menu"
                >
                  <div className="py-1">
                    <button
                      onClick={handleDuplicate}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm flex items-center gap-2',
                        'text-notion-text hover:bg-notion-bgSecondary',
                        'focus-visible:outline-none focus-visible:bg-notion-bgSecondary'
                      )}
                      role="menuitem"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    
                    {isDeleted ? (
                      <button
                        onClick={handleRestore}
                        className={cn(
                          'w-full px-4 py-2 text-left text-sm flex items-center gap-2',
                          'text-green-400 hover:bg-green-400/10',
                          'focus-visible:outline-none focus-visible:bg-green-400/10'
                        )}
                        role="menuitem"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restore
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleToggleFavorite}
                          className={cn(
                            'w-full px-4 py-2 text-left text-sm flex items-center gap-2',
                            isFavorite ? 'text-yellow-400' : 'text-notion-text',
                            'hover:bg-notion-bgSecondary',
                            'focus-visible:outline-none focus-visible:bg-notion-bgSecondary'
                          )}
                          role="menuitem"
                        >
                          <Star className={cn('w-4 h-4', isFavorite ? 'fill-current' : '')} />
                          {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        </button>
                        
                        <button
                          onClick={handleToggleArchive}
                          className={cn(
                            'w-full px-4 py-2 text-left text-sm flex items-center gap-2',
                            isArchived ? 'text-blue-400' : 'text-notion-text',
                            'hover:bg-notion-bgSecondary',
                            'focus-visible:outline-none focus-visible:bg-notion-bgSecondary'
                          )}
                          role="menuitem"
                        >
                          <Archive className="w-4 h-4" />
                          {isArchived ? 'Restore from archive' : 'Move to archive'}
                        </button>
                        
                        <hr className="my-1 border-notion-border" />
                        
                        <button
                          onClick={handleDelete}
                          className={cn(
                            'w-full px-4 py-2 text-left text-sm flex items-center gap-2',
                            isDeleted ? 'text-red-400' : 'text-red-400',
                            'hover:bg-red-400/10',
                            'focus-visible:outline-none focus-visible:bg-red-400/10'
                          )}
                          role="menuitem"
                        >
                          <Trash2 className="w-4 h-4" />
                          {isDeleted ? 'Delete permanently' : 'Move to trash'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cover Picker Popover */}
      {showCoverPicker && (
        <div
          ref={coverPickerRef}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-96 bg-notion-bg border border-notion-border rounded-xl shadow-lg overflow-hidden"
          role="dialog"
          aria-label="Change cover"
        >
          <div className="p-4">
            <h3 className="text-sm font-medium text-notion-text mb-4">Change Cover</h3>
            
            {/* Color Presets */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-notion-textMuted uppercase tracking-wider mb-2">Colors</h4>
              <div className="grid grid-cols-5 gap-2">
                {COVER_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorCoverSelect(color)}
                    className={cn(
                      'w-full aspect-square rounded-lg border-2 transition-all',
                      document.coverImage?.type === 'color' && document.coverImage.value === color
                        ? 'border-notion-accent scale-105'
                        : 'border-transparent hover:border-notion-border'
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${color}`}
                    aria-pressed={document.coverImage?.type === 'color' && document.coverImage.value === color}
                  >
                    {document.coverImage?.type === 'color' && document.coverImage.value === color && (
                      <span className="w-5 h-5 flex items-center justify-center text-white">
                        <X className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-notion-textMuted uppercase tracking-wider mb-2">Image</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste image URL..."
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-notion-bgSecondary border border-notion-border rounded-lg text-notion-text placeholder:text-notion-textMuted focus:outline-none focus:ring-2 focus:ring-notion-accent"
                />
                <button
                  onClick={handleImageCoverSelect}
                  disabled={!coverImageUrl}
                  className="px-4 py-2 text-sm bg-notion-accent text-white rounded-lg hover:bg-notion-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Apply
                </button>
              </div>
              <p className="text-xs text-notion-textMuted mt-1">Paste a direct image URL (jpg, png, gif, webp)</p>
            </div>

            {/* Remove Cover */}
            {document.coverImage && document.coverImage.type !== 'none' && (
              <button
                onClick={handleRemoveCover}
                className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove Cover
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}