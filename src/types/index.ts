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

// Block types for Phase 3 - Modular Block-Based Content Editor
export type BlockType = 
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'todo'
  | 'bulletedList'
  | 'numberedList'
  | 'code'
  | 'callout'
  | 'quote'
  | 'divider'

export interface BaseBlock {
  id: string
  type: BlockType
  createdAt: number
  updatedAt: number
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph'
  content: string // plain text or rich text
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading1' | 'heading2' | 'heading3'
  content: string
}

export interface TodoBlock extends BaseBlock {
  type: 'todo'
  content: string
  checked: boolean
}

export interface ListItem {
  id: string
  content: string
  checked?: boolean // for nested todos
  children?: ListItem[] // for nested lists
}

export interface ListBlock extends BaseBlock {
  type: 'bulletedList' | 'numberedList'
  items: ListItem[]
}

export interface CodeBlock extends BaseBlock {
  type: 'code'
  content: string
  language: string
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout'
  content: string
  icon: string // emoji or icon name
  backgroundColor: string // hex color
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote'
  content: string
}

export interface DividerBlock extends BaseBlock {
  type: 'divider'
}

export type Block = 
  | ParagraphBlock
  | HeadingBlock
  | TodoBlock
  | ListBlock
  | CodeBlock
  | CalloutBlock
  | QuoteBlock
  | DividerBlock

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
  blocks: Block[] // block-based content
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