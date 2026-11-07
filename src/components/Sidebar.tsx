'use client'

import { ChevronRight, ChevronDown, ChevronLeft, Plus, Search, Trash2, Settings, FilePlus, Home, Star, Bookmark } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useSidebarStore } from '@/store/sidebarStore'
import { useDocumentStore } from '@/store/documentStore'
import { mockPageTree, mockWorkspace } from '@/lib/mockData'
import type { PageTreeNode, Document } from '@/types'
import { cn } from '@/lib/utils'

interface PageTreeItemProps {
  node: PageTreeNode
  depth: number
  isActive: boolean
  onSelect: (pageId: string) => void
  onToggleExpand: (itemId: string) => void
  isExpanded: boolean
}

function PageTreeItem({ node, depth, isActive, onSelect, onToggleExpand, isExpanded }: PageTreeItemProps) {
  const hasChildren = node.children.length > 0
  const indent = depth * 16

  return (
    <div>
      <button
        onClick={() => onSelect(node.id)}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors',
          'text-sm font-medium',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent',
          isActive
            ? 'bg-notion-bgSecondary text-notion-text'
            : 'text-notion-textSecondary hover:bg-notion-bgSecondary hover:text-notion-text'
        )}
        style={{ paddingLeft: `${12 + indent}px` }}
        aria-current={isActive ? 'page' : undefined}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        {hasChildren && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(node.id)
            }}
            className={cn(
              'flex items-center justify-center w-5 h-5 rounded transition-colors cursor-pointer',
              'hover:bg-notion-border',
              isExpanded ? 'rotate-90' : ''
            )}
            aria-label={isExpanded ? `Collapse ${node.title}` : `Expand ${node.title}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onToggleExpand(node.id)
              }
            }}
          >
            <ChevronRight className="w-4 h-4 text-notion-textMuted" />
          </span>
        )}
        {!hasChildren && <span className="w-5" />}
        {node.icon && (
          <span className="flex-shrink-0" aria-hidden="true">
            <node.icon className="w-4 h-4 text-notion-textMuted" />
          </span>
        )}
        <span className="truncate flex-1">{node.title}</span>
        {!isActive && hasChildren && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              onSelect(node.id)
            }}
            className="opacity-0 transition-opacity hover:opacity-100 flex items-center justify-center w-6 h-6 rounded text-notion-textMuted hover:text-notion-text hover:bg-notion-border cursor-pointer"
            aria-label={`Add subpage to ${node.title}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(node.id)
              }
            }}
          >
            <Plus className="w-3.5 h-3.5" />
          </span>
        )}
      </button>
      {hasChildren && isExpanded && (
        <div role="group" aria-label={`${node.title} subpages`}>
          {node.children.map((child) => (
            <PageTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              isActive={isActive}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              isExpanded={isExpanded}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PageTree({ activePageId, onSelectPage }: { activePageId: string | null; onSelectPage: (pageId: string) => void }) {
  const { expandedItems, toggleItemExpansion, isItemExpanded } = useSidebarStore()

  return (
    <nav className="flex-1 overflow-y-auto px-2 pb-4" aria-label="Page tree navigation">
      <ul className="space-y-1" role="tree">
        {mockPageTree.map((node) => (
          <li key={node.id} role="treeitem">
            <PageTreeItem
              node={node}
              depth={0}
              isActive={activePageId === node.id}
              onSelect={onSelectPage}
              onToggleExpand={toggleItemExpansion}
              isExpanded={isItemExpanded(node.id)}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}

function WorkspaceHeader({ isCollapsed }: { isCollapsed: boolean }) {
  const WorkspaceIcon = mockWorkspace.icon || Home
  return (
    <div className="flex items-center justify-between h-14 px-3 border-b border-notion-border bg-notion-bg">
      {!isCollapsed && (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-notion-accent flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <WorkspaceIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-notion-text truncate">{mockWorkspace.name}</h1>
            <p className="text-xs text-notion-textMuted truncate">Workspace</p>
          </div>
        </div>
      )}
      <button
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
          'text-notion-textMuted hover:text-notion-text hover:bg-notion-bgSecondary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent'
        )}
        aria-label="Workspace settings"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  )
}

function QuickActions({ isCollapsed }: { isCollapsed: boolean }) {
  const actions = [
    { icon: FilePlus, label: 'New page', shortcut: '⌘N' },
    { icon: Search, label: 'Search', shortcut: '⌘P' },
    { icon: Trash2, label: 'Trash', shortcut: '' },
  ]

  return (
    <div className="px-2 py-3 space-y-1 border-b border-notion-border bg-notion-bg">
      {actions.map(({ icon: Icon, label, shortcut }) => (
        <button
          key={label}
          className={cn(
            'w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
            'text-sm font-medium text-notion-textSecondary hover:text-notion-text hover:bg-notion-bgSecondary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent'
          )}
          aria-label={shortcut ? `${label} (${shortcut})` : label}
        >
          <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{label}</span>
              {shortcut && <kbd className="text-xs text-notion-textMuted px-1.5 py-0.5 rounded bg-notion-border font-mono">{shortcut}</kbd>}
            </>
          )}
        </button>
      ))}
    </div>
  )
}

function ResizeHandle({ isCollapsed }: { isCollapsed: boolean }) {
  const { width, setWidth, setCollapsed } = useSidebarStore()
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  useEffect(() => {
    if (isResizing) {
      const handleMouseMove = (e: MouseEvent) => {
        const newWidth = startWidthRef.current + (e.clientX - startXRef.current)
        setWidth(newWidth)
      }

      const handleMouseUp = () => {
        setIsResizing(false)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isResizing, setWidth])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = width
  }

  const handleDoubleClick = () => {
    setCollapsed(!isCollapsed)
  }

  if (isCollapsed) return null

  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:w-2 hover:bg-notion-accent/20 transition-all duration-200"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setCollapsed(!isCollapsed)
        }
      }}
    >
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-notion-border" aria-hidden="true" />
    </div>
  )
}

function FavoritesSection({ isCollapsed, activePageId, onSelectPage }: { 
  isCollapsed: boolean 
  activePageId: string | null
  onSelectPage: (pageId: string) => void
}) {
  const { getFavorites } = useDocumentStore()
  const favorites = getFavorites()

  if (favorites.length === 0) return null

  return (
    <div className="px-2 py-3 space-y-1 border-b border-notion-border bg-notion-bg">
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="text-xs font-semibold text-notion-textMuted uppercase tracking-wider flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" aria-hidden="true" />
          Favorites
        </h3>
      </div>
      <ul className="space-y-1" role="list">
        {favorites.map((doc: Document) => (
          <li key={doc.id} role="listitem">
            <button
              onClick={() => onSelectPage(doc.id)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors',
                'text-sm font-medium',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent',
                activePageId === doc.id
                  ? 'bg-notion-bgSecondary text-notion-text'
                  : 'text-notion-textSecondary hover:bg-notion-bgSecondary hover:text-notion-text'
              )}
              style={{ paddingLeft: '12px' }}
              aria-current={activePageId === doc.id ? 'page' : undefined}
            >
              {doc.icon && (
                <span className="flex-shrink-0" aria-hidden="true">
                  {typeof doc.icon === 'string' ? (
                    <span style={{ fontSize: '16px' }}>{doc.icon}</span>
                  ) : (
                    <doc.icon className="w-4 h-4 text-notion-textMuted" />
                  )}
                </span>
              )}
              <span className="truncate flex-1">{doc.title}</span>
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-current flex-shrink-0" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Sidebar() {
  const { isCollapsed, width, setCollapsed, activePageId, setActivePage } = useSidebarStore()
  const sidebarRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setCollapsed(true)
    }
  }

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        'fixed left-0 top-0 h-screen bg-notion-bg border-r border-notion-border shadow-sidebar',
        'transition-all duration-200 ease-in-out z-40 flex flex-col',
        isCollapsed ? 'w-16' : `w-[${width}px]`
      )}
      role="navigation"
      aria-label="Sidebar navigation"
      onKeyDown={handleKeyDown}
      style={{ width: isCollapsed ? '64px' : `${width}px` }}
    >
      <div className="relative flex flex-col h-full">
        <WorkspaceHeader isCollapsed={isCollapsed} />
        <QuickActions isCollapsed={isCollapsed} />
        {!isCollapsed && <FavoritesSection isCollapsed={isCollapsed} activePageId={activePageId} onSelectPage={setActivePage} />}
        <PageTree activePageId={activePageId} onSelectPage={setActivePage} />
        {!isCollapsed && <ResizeHandle isCollapsed={isCollapsed} />}
      </div>

      {!isCollapsed && (
        <button
          onClick={() => setCollapsed(true)}
          className="absolute -right-2 top-4 w-4 h-4 rounded-full bg-notion-bgSecondary border border-notion-border flex items-center justify-center shadow-sidebar-hover hover:bg-notion-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent"
          aria-label="Collapse sidebar"
          aria-controls="sidebar"
        >
          <ChevronLeft className="w-3 h-3 text-notion-textMuted" />
        </button>
      )}
      {isCollapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute right-[-12px] top-4 w-4 h-4 rounded-full bg-notion-bgSecondary border border-notion-border flex items-center justify-center shadow-sidebar-hover hover:bg-notion-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent"
          aria-label="Expand sidebar"
          aria-controls="sidebar"
        >
          <ChevronRight className="w-3 h-3 text-notion-textMuted" />
        </button>
      )}
    </aside>
  )
}