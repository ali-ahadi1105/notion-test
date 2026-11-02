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

// Document types for Phase 2
export type DocumentIcon = 
  | React.ComponentType<{ className?: string }>
  | string // emoji or image URL

export interface DocumentCoverImage {
  type: 'color' | 'gradient' | 'image' | 'none'
  value: string // color hex, gradient CSS, image URL, or empty
}

export interface Document {
  id: string
  title: string
  icon?: DocumentIcon
  coverImage?: DocumentCoverImage
  parentId: string | null
  isArchived: boolean
  isFavorite: boolean
  isDeleted: boolean // soft delete for trash
  deletedAt?: number // timestamp when deleted
  createdAt: number
  updatedAt: number
  content?: string // page content (blocks)
  slug: string
}

export interface DocumentStoreState {
  documents: Document[]
  // CRUD operations
  createDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'slug'>) => Document
  getDocument: (id: string) => Document | undefined
  updateDocument: (id: string, updates: Partial<Omit<Document, 'id' | 'createdAt' | 'slug'>>) => Document | undefined
  deleteDocument: (id: string, permanent?: boolean) => boolean
  restoreDocument: (id: string) => boolean
  // Hierarchical operations
  getChildren: (parentId: string | null) => Document[]
  getBreadcrumbPath: (docId: string) => Document[]
  getDescendants: (docId: string) => Document[]
  moveDocument: (id: string, newParentId: string | null) => boolean
  // Utility
  generateSlug: (title: string, parentId: string | null) => string
  // Trash operations
  getTrash: () => Document[]
  emptyTrash: () => void
  // Favorites
  toggleFavorite: (id: string) => void
  getFavorites: () => Document[]
  // Archive
  toggleArchive: (id: string) => void
  getArchived: () => Document[]
}