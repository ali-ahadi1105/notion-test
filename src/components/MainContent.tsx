'use client'

import { ChevronRight, MoreHorizontal, Share2, Star, Bell, HelpCircle, Menu } from 'lucide-react'
import { useSidebarStore } from '@/store/sidebarStore'
import { useDocumentStore } from '@/store/documentStore'
import { mockPageTree, mockWorkspace } from '@/lib/mockData'
import type { PageTreeNode } from '@/types'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { Editor } from '@/components/Editor'
import { useEffect, useState } from 'react'

function findPagePath(nodes: PageTreeNode[], targetId: string, path: PageTreeNode[] = []): PageTreeNode[] | null {
  for (const node of nodes) {
    const newPath = [...path, node]
    if (node.id === targetId) {
      return newPath
    }
    if (node.children.length > 0) {
      const found = findPagePath(node.children, targetId, newPath)
      if (found) return found
    }
  }
  return null
}

function Breadcrumbs({ activePageId }: { activePageId: string | null }) {
  const pathname = usePathname()
  const { isCollapsed } = useSidebarStore()

  if (!activePageId) {
    return (
      <nav className="flex items-center gap-2 px-4 py-3 border-b border-notion-border bg-notion-bg" aria-label="Breadcrumb">
        <span className="text-sm font-medium text-notion-text">{mockWorkspace.name}</span>
        <ChevronRight className="w-4 h-4 text-notion-textMuted flex-shrink-0" aria-hidden="true" />
        <span className="text-sm text-notion-textSecondary">Home</span>
      </nav>
    )
  }

  const path = findPagePath(mockPageTree, activePageId)

  if (!path) {
    return (
      <nav className="flex items-center gap-2 px-4 py-3 border-b border-notion-border bg-notion-bg" aria-label="Breadcrumb">
        <span className="text-sm font-medium text-notion-text">{mockWorkspace.name}</span>
        <ChevronRight className="w-4 h-4 text-notion-textMuted flex-shrink-0" aria-hidden="true" />
        <span className="text-sm text-notion-textSecondary">Unknown Page</span>
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-2 px-4 py-3 border-b border-notion-border bg-notion-bg min-h-[48px]" aria-label="Breadcrumb">
      <span className="text-sm font-medium text-notion-text truncate max-w-[150px]">{mockWorkspace.name}</span>
      {path.map((node, index) => (
        <span key={node.id} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-notion-textMuted flex-shrink-0" aria-hidden="true" />
          <span className={cn(
            'text-sm truncate max-w-[150px]',
            index === path.length - 1 ? 'font-medium text-notion-text' : 'text-notion-textSecondary hover:text-notion-text cursor-pointer'
          )}>
            {node.title}
          </span>
        </span>
      ))}
    </nav>
  )
}

function PageTitle({ activePageId }: { activePageId: string | null }) {
  if (!activePageId) {
    return (
      <div className="px-6 py-6">
        <h1 className="text-3xl font-light text-notion-text">Welcome to {mockWorkspace.name}</h1>
        <p className="mt-2 text-notion-textSecondary">Select a page from the sidebar or create a new one to get started.</p>
      </div>
    )
  }

  const path = findPagePath(mockPageTree, activePageId)
  const currentPage = path?.[path.length - 1]

  return (
    <div className="px-6 py-6">
      <h1 className="text-3xl font-light text-notion-text">{currentPage?.title || 'Untitled'}</h1>
      <p className="mt-2 text-notion-textSecondary">Start typing to add content...</p>
    </div>
  )
}

function TopToolbar({ activePageId }: { activePageId: string | null }) {
  const { isCollapsed, setCollapsed } = useSidebarStore()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b border-notion-border bg-notion-bg/80 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCollapsed(!isCollapsed)}
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
            'text-notion-textMuted hover:text-notion-text hover:bg-notion-bgSecondary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
          aria-controls="sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Breadcrumbs activePageId={activePageId} />
      </div>

      <div className="flex items-center gap-1">
        <button
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
            'text-notion-textMuted hover:text-notion-text hover:bg-notion-bgSecondary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent'
          )}
          aria-label="Add to favorites"
        >
          <Star className="w-5 h-5" />
        </button>
        <button
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
            'text-notion-textMuted hover:text-notion-text hover:bg-notion-bgSecondary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent'
          )}
          aria-label="Share page"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
            'text-notion-textMuted hover:text-notion-text hover:bg-notion-bgSecondary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent'
          )}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        <button
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
            'text-notion-textMuted hover:text-notion-text hover:bg-notion-bgSecondary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent'
          )}
          aria-label="Help and support"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        <button
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
            'text-notion-textMuted hover:text-notion-text hover:bg-notion-bgSecondary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent'
          )}
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}

export function MainContent({ activePageId }: { activePageId: string | null }) {
  const { isCollapsed } = useSidebarStore()
  const { getDocument, updateDocument } = useDocumentStore()
  const [blocks, setBlocks] = useState<import('@/types').Block[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load blocks when activePageId changes
  useEffect(() => {
    if (activePageId) {
      const doc = getDocument(activePageId)
      if (doc) {
        setBlocks(doc.blocks || [])
      } else {
        setBlocks([])
      }
    } else {
      setBlocks([])
    }
    setIsLoading(false)
  }, [activePageId, getDocument])

  // Save blocks when they change
  useEffect(() => {
    if (activePageId && !isLoading) {
      updateDocument(activePageId, { blocks, updatedAt: Date.now() })
    }
  }, [blocks, activePageId, isLoading, updateDocument])

  if (isLoading) {
    return (
      <main
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-200 ease-in-out',
          'bg-notion-bgSecondary',
          isCollapsed ? 'lg:ml-16' : 'lg:ml-[280px]'
        )}
        style={{ marginLeft: isCollapsed ? '64px' : '280px' }}
        role="main"
      >
        <TopToolbar activePageId={activePageId} />
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-notion-textMuted">Loading...</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main
      className={cn(
        'flex-1 flex flex-col min-h-screen transition-all duration-200 ease-in-out',
        'bg-notion-bgSecondary',
        isCollapsed ? 'lg:ml-16' : 'lg:ml-[280px]'
      )}
      style={{ marginLeft: isCollapsed ? '64px' : '280px' }}
      role="main"
    >
      <TopToolbar activePageId={activePageId} />
      <div className="flex-1 overflow-y-auto">
        <PageTitle activePageId={activePageId} />
        <div className="px-6 pb-12">
          <Editor
            blocks={blocks}
            onBlocksChange={setBlocks}
            placeholder="Start typing..."
          />
        </div>
      </div>
    </main>
  )
}