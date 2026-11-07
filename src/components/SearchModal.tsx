'use client'

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from 'react'
import { Search, FileText, ChevronRight, X } from 'lucide-react'
import { useDocumentStore } from '@/store/documentStore'
import { useSidebarStore } from '@/store/sidebarStore'
import type { Document, Block } from '@/types'
import { cn } from '@/lib/utils'

// Fuzzy search helper
function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true
  const normalizedText = text.toLowerCase()
  const normalizedQuery = query.toLowerCase()
  
  let textIndex = 0
  for (const char of normalizedQuery) {
    const foundIndex = normalizedText.indexOf(char, textIndex)
    if (foundIndex === -1) return false
    textIndex = foundIndex + 1
  }
  return true
}

function getMatchScore(text: string, query: string): number {
  if (!query) return 1
  const normalizedText = text.toLowerCase()
  const normalizedQuery = query.toLowerCase()
  
  // Exact match gets highest score
  if (normalizedText === normalizedQuery) return 100
  if (normalizedText.startsWith(normalizedQuery)) return 90
  if (normalizedText.includes(normalizedQuery)) return 80
  
  // Fuzzy match
  let score = 0
  let textIndex = 0
  for (const char of normalizedQuery) {
    const foundIndex = normalizedText.indexOf(char, textIndex)
    if (foundIndex === -1) return 0
    // Bonus for consecutive matches
    if (foundIndex === textIndex) score += 10
    else score += 5
    textIndex = foundIndex + 1
  }
  return score
}

interface SearchResult {
  document: Document
  matchedBlocks: Block[]
  titleScore: number
  contentScore: number
}

function searchDocuments(query: string, documents: Document[]): SearchResult[] {
  if (!query.trim()) return []
  
  const results: SearchResult[] = []
  
  for (const doc of documents) {
    if (doc.isDeleted || doc.isArchived) continue
    
    const titleScore = getMatchScore(doc.title, query)
    const matchedBlocks: Block[] = []
    let contentScore = 0
    
    if (doc.blocks) {
      for (const block of doc.blocks) {
        let blockContent = ''
        if ('content' in block && block.content) {
          blockContent = block.content
        } else if ('items' in block && block.items) {
          blockContent = block.items.map(item => item.content).join(' ')
        }
        
        if (blockContent && fuzzyMatch(blockContent, query)) {
          const score = getMatchScore(blockContent, query)
          contentScore = Math.max(contentScore, score)
          matchedBlocks.push(block)
        }
      }
    }
    
    if (titleScore > 0 || contentScore > 0) {
      results.push({ document: doc, matchedBlocks, titleScore, contentScore })
    }
  }
  
  // Sort by best match (title match prioritized)
  return results.sort((a, b) => {
    const aBest = Math.max(a.titleScore, a.contentScore)
    const bBest = Math.max(b.titleScore, b.contentScore)
    return bBest - aBest
  })
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectDocument: (documentId: string) => void
}

export function SearchModal({ isOpen, onClose, onSelectDocument }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [results, setResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement[]>([])
  const { documents } = useDocumentStore()
  const { setActivePage } = useSidebarStore()

  // Update results when query changes
  useEffect(() => {
    const newResults = searchDocuments(query, documents)
    setResults(newResults)
    setSelectedIndex(0)
  }, [query, documents])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  // Track if navigation was via keyboard (for scroll behavior)
  const keyboardNavigationRef = useRef(false)

  // Scroll selected item into view (only on keyboard navigation)
  useEffect(() => {
    if (keyboardNavigationRef.current && itemsRef.current[selectedIndex]) {
      itemsRef.current[selectedIndex].scrollIntoView({ block: 'nearest' })
    }
    keyboardNavigationRef.current = false // Reset after scroll
  }, [selectedIndex])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        keyboardNavigationRef.current = true
        setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length))
        break
      case 'ArrowUp':
        e.preventDefault()
        keyboardNavigationRef.current = true
        setSelectedIndex(prev => (prev - 1 + Math.max(1, results.length)) % Math.max(1, results.length))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          onSelectDocument(results[selectedIndex].document.id)
          onClose()
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }, [results, selectedIndex, onSelectDocument, onClose])

  // Close on click outside (use backdrop for click outside detection instead)
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const activeDocuments = documents.filter(d => !d.isDeleted && !d.isArchived)

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20"
      role="dialog"
      aria-modal="true"
      aria-label="Quick Search"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'w-full max-w-2xl bg-notion-bgSecondary border border-notion-border rounded-xl shadow-2xl',
          'overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150'
        )}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-notion-border bg-notion-bg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-notion-textMuted" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages... (⌘K)"
              className="w-full pl-10 pr-10 py-3 text-lg bg-notion-bgSecondary border border-notion-border rounded-lg text-notion-text placeholder:text-notion-textMuted focus:outline-none focus:ring-2 focus:ring-notion-accent"
              autoComplete="off"
              aria-label="Search documents"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-notion-textMuted hover:text-notion-text transition-colors"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="mt-2 text-xs text-notion-textMuted flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 font-mono bg-notion-bgTertiary rounded">⌘K</kbd>
            <span>to open</span>
            {results.length > 0 && <span>• {results.length} result(s)</span>}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {query.trim() === '' ? (
            // Recent/Empty state
            <div className="p-6 text-center">
              <FileText className="w-12 h-12 text-notion-textMuted mx-auto mb-4" aria-hidden="true" />
              <p className="text-notion-textSecondary">Start typing to search across all pages</p>
              <p className="text-xs text-notion-textMuted mt-2">Searches titles and content</p>
            </div>
          ) : results.length === 0 ? (
            // No results
            <div className="p-6 text-center">
              <FileText className="w-12 h-12 text-notion-textMuted mx-auto mb-4" aria-hidden="true" />
              <p className="text-notion-textSecondary">No results for "{query}"</p>
              <p className="text-xs text-notion-textMuted mt-2">Try a different search term</p>
            </div>
          ) : (
            // Results list
            <ul className="divide-y divide-notion-border" role="listbox" aria-label="Search results">
              {results.map((result, index) => (
                <li
                  key={result.document.id}
                  ref={(el) => { itemsRef.current[index] = el }}
                  className={cn(
                    'px-4 py-3 hover:bg-notion-bgTertiary transition-colors cursor-pointer',
                    index === selectedIndex ? 'bg-notion-bgTertiary' : ''
                  )}
                  role="option"
                  aria-selected={index === selectedIndex}
                  onClick={() => {
                    onSelectDocument(result.document.id)
                    onClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-notion-bgTertiary flex items-center justify-center">
                      {result.document.icon && (
                        <span className="text-lg" aria-hidden="true">
                          {typeof result.document.icon === 'string' ? result.document.icon : '📄'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-notion-text truncate block">
                          {result.document.title}
                        </span>
                        {result.matchedBlocks.length > 0 && (
                          <span className="text-xs px-1.5 py-0.5 bg-notion-accent/20 text-notion-accent rounded">
                            {result.matchedBlocks.length} match{result.matchedBlocks.length > 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-notion-textMuted">
                        {result.document.slug && (
                          <span className="font-mono truncate">{result.document.slug}</span>
                        )}
                        {result.document.isFavorite && (
                          <span className="text-yellow-400" aria-label="Favorite">⭐</span>
                        )}
                      </div>
                      {/* Show matched content preview */}
                      {result.matchedBlocks.length > 0 && result.matchedBlocks[0] && (
                        <div className="mt-2 text-sm text-notion-textMuted truncate line-clamp-2">
                          {(() => {
                            const block = result.matchedBlocks[0]
                            if ('content' in block && block.content) {
                              return block.content.substring(0, 150)
                            }
                            if ('items' in block && block.items) {
                              return block.items.map(i => i.content).join(' ').substring(0, 150)
                            }
                            return ''
                          })()}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-notion-textMuted flex-shrink-0" aria-hidden="true" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-notion-border bg-notion-bg flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-notion-textMuted">
            <kbd className="px-1.5 py-0.5 font-mono bg-notion-bgTertiary rounded">↑</kbd>
            <kbd className="px-1.5 py-0.5 font-mono bg-notion-bgTertiary rounded">↓</kbd>
            <span>Navigate</span>
            <kbd className="px-1.5 py-0.5 font-mono bg-notion-bgTertiary rounded">Enter</kbd>
            <span>Open</span>
            <kbd className="px-1.5 py-0.5 font-mono bg-notion-bgTertiary rounded">Esc</kbd>
            <span>Close</span>
          </div>
          <div className="text-xs text-notion-textMuted">
            {activeDocuments.length} pages indexed
          </div>
        </div>
      </div>
    </div>
  )
}