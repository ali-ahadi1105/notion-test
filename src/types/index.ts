export interface PageTreeNode {
  id: string
  title: string
  icon?: React.ComponentType<{ className?: string }>
  children: PageTreeNode[]
  isExpanded?: boolean
  parentId?: string | null
  slug: string
}

export interface Workspace {
  id: string
  name: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface SidebarState {
  isCollapsed: boolean
  width: number
  activePageId: string | null
  expandedItems: Set<string>
  setCollapsed: (collapsed: boolean) => void
  setWidth: (width: number) => void
  setActivePage: (pageId: string | null) => void
  toggleItemExpansion: (itemId: string) => void
  isItemExpanded: (itemId: string) => boolean
}