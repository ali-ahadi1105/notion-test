import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SidebarState } from '@/types'

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      isCollapsed: false,
      width: 280,
      activePageId: null,
      expandedItems: new Set<string>(),

      setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
      setWidth: (width: number) => set({ width: Math.max(240, Math.min(400, width)) }),
      setActivePage: (pageId: string | null) => set({ activePageId: pageId }),
      toggleItemExpansion: (itemId: string) =>
        set((state) => {
          const newExpanded = new Set(state.expandedItems)
          if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId)
          } else {
            newExpanded.add(itemId)
          }
          return { expandedItems: newExpanded }
        }),
      isItemExpanded: (itemId: string) => get().expandedItems.has(itemId),
    }),
    {
      name: 'sidebar-storage',
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        width: state.width,
        expandedItems: Array.from(state.expandedItems),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.expandedItems = new Set(state.expandedItems as unknown as string[])
        }
      },
    }
  )
)