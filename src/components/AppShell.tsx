'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { MainContent } from '@/components/MainContent'
import { SearchModal } from '@/components/SearchModal'
import { useSidebarStore } from '@/store/sidebarStore'
import { useDocumentStore } from '@/store/documentStore'

export function AppShell() {
  const { activePageId, setActivePage } = useSidebarStore()
  const { getDocument } = useDocumentStore()
  const [searchOpen, setSearchOpen] = useState(false)

  // Handle Cmd+K / Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelectDocument = useCallback((documentId: string) => {
    const doc = getDocument(documentId)
    if (doc) {
      setActivePage(documentId)
    }
  }, [getDocument, setActivePage])

  return (
    <div className="relative min-h-screen bg-notion-bgSecondary">
      <Sidebar />
      <MainContent activePageId={activePageId} />
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectDocument={handleSelectDocument}
      />
    </div>
  )
}