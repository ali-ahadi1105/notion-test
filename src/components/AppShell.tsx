'use client'

import { Sidebar } from '@/components/Sidebar'
import { MainContent } from '@/components/MainContent'
import { useSidebarStore } from '@/store/sidebarStore'

export function AppShell() {
  const { activePageId } = useSidebarStore()

  return (
    <div className="relative min-h-screen bg-notion-bgSecondary">
      <Sidebar />
      <MainContent activePageId={activePageId} />
    </div>
  )
}