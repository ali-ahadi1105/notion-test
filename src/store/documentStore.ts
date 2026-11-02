import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Document, DocumentStoreState, DocumentCoverImage } from '@/types'

// Helper functions
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

const generateSlug = (title: string, parentId: string | null, existingSlugs: Set<string>, getParentSlug: (id: string) => string | undefined): string => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
  
  // If there's a parent, prefix with parent's slug
  let prefix = ''
  if (parentId) {
    const parentSlug = getParentSlug(parentId)
    if (parentSlug) {
      prefix = `${parentSlug}/`
    }
  }
  
  let slug = `${prefix}${baseSlug}`
  let counter = 1
  
  while (existingSlugs.has(slug)) {
    slug = `${prefix}${baseSlug}-${counter}`
    counter++
  }
  
  return slug
}

const getAllSlugs = (documents: Document[]): Set<string> => {
  return new Set(documents.map(d => d.slug))
}

// Default cover images
const DEFAULT_COVERS: DocumentCoverImage[] = [
  { type: 'color', value: '#1a1a2e' },
  { type: 'color', value: '#16213e' },
  { type: 'color', value: '#0f3460' },
  { type: 'color', value: '#e94560' },
  { type: 'color', value: '#8b0000' },
  { type: 'color', value: '#2c3e50' },
  { type: 'color', value: '#27ae60' },
  { type: 'color', value: '#8e44ad' },
  { type: 'color', value: '#f39c12' },
  { type: 'color', value: '#c0392b' },
]

const getRandomCover = (): DocumentCoverImage => {
  return DEFAULT_COVERS[Math.floor(Math.random() * DEFAULT_COVERS.length)]
}

// Initial mock documents for testing
const createInitialDocuments = (): Document[] => {
  const now = Date.now()
  return [
    {
      id: 'doc-1',
      title: 'Getting Started',
      icon: '📖',
      coverImage: { type: 'color', value: '#1a1a2e' },
      parentId: null,
      isArchived: false,
      isFavorite: false,
      isDeleted: false,
      createdAt: now - 86400000 * 7,
      updatedAt: now - 86400000 * 7,
      content: '',
      slug: 'getting-started',
    },
    {
      id: 'doc-2',
      title: 'Introduction',
      icon: '📄',
      coverImage: { type: 'color', value: '#16213e' },
      parentId: 'doc-1',
      isArchived: false,
      isFavorite: false,
      isDeleted: false,
      createdAt: now - 86400000 * 6,
      updatedAt: now - 86400000 * 6,
      content: '',
      slug: 'getting-started/introduction',
    },
    {
      id: 'doc-3',
      title: 'Quick Start Guide',
      icon: '⚡',
      coverImage: { type: 'color', value: '#0f3460' },
      parentId: 'doc-1',
      isArchived: false,
      isFavorite: false,
      isDeleted: false,
      createdAt: now - 86400000 * 5,
      updatedAt: now - 86400000 * 5,
      content: '',
      slug: 'getting-started/quick-start',
    },
    {
      id: 'doc-4',
      title: 'Core Concepts',
      icon: '💡',
      coverImage: { type: 'color', value: '#2c3e50' },
      parentId: 'doc-1',
      isArchived: false,
      isFavorite: false,
      isDeleted: false,
      createdAt: now - 86400000 * 4,
      updatedAt: now - 86400000 * 4,
      content: '',
      slug: 'getting-started/core-concepts',
    },
    {
      id: 'doc-5',
      title: 'Blocks',
      icon: '📦',
      coverImage: { type: 'color', value: '#27ae60' },
      parentId: 'doc-4',
      isArchived: false,
      isFavorite: false,
      isDeleted: false,
      createdAt: now - 86400000 * 3,
      updatedAt: now - 86400000 * 3,
      content: '',
      slug: 'getting-started/core-concepts/blocks',
    },
    {
      id: 'doc-6',
      title: 'Pages',
      icon: '📄',
      coverImage: { type: 'color', value: '#8e44ad' },
      parentId: 'doc-4',
      isArchived: false,
      isFavorite: true,
      isDeleted: false,
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000 * 2,
      content: '',
      slug: 'getting-started/core-concepts/pages',
    },
    {
      id: 'doc-7',
      title: 'Databases',
      icon: '🗄️',
      coverImage: { type: 'color', value: '#f39c12' },
      parentId: 'doc-4',
      isArchived: false,
      isFavorite: false,
      isDeleted: false,
      createdAt: now - 86400000 * 1,
      updatedAt: now - 86400000 * 1,
      content: '',
      slug: 'getting-started/core-concepts/databases',
    },
    {
      id: 'doc-8',
      title: 'Features',
      icon: '⭐',
      coverImage: { type: 'color', value: '#c0392b' },
      parentId: null,
      isArchived: false,
      isFavorite: false,
      isDeleted: false,
      createdAt: now - 86400000 * 10,
      updatedAt: now - 86400000 * 10,
      content: '',
      slug: 'features',
    },
    {
      id: 'doc-9',
      title: 'Editor',
      icon: '✏️',
      coverImage: { type: 'color', value: '#1a1a2e' },
      parentId: 'doc-8',
      isArchived: false,
      isFavorite: false,
      isDeleted: false,
      createdAt: now - 86400000 * 9,
      updatedAt: now - 86400000 * 9,
      content: '',
      slug: 'features/editor',
    },
    {
      id: 'doc-10',
      title: 'Settings',
      icon: '⚙️',
      coverImage: { type: 'color', value: '#16213e' },
      parentId: null,
      isArchived: false,
      isFavorite: false,
      isDeleted: false,
      createdAt: now - 86400000 * 15,
      updatedAt: now - 86400000 * 15,
      content: '',
      slug: 'settings',
    },
  ]
}

export const useDocumentStore = create<DocumentStoreState>()(
  persist(
    (set, get) => ({
      documents: createInitialDocuments(),

      // CRUD Operations
      createDocument: (docData) => {
        const now = Date.now()
        const existingSlugs = getAllSlugs(get().documents)
        const getParentSlug = (id: string) => get().documents.find(d => d.id === id)?.slug
        const slug = generateSlug(docData.title, docData.parentId, existingSlugs, getParentSlug)
        
        const newDoc: Document = {
          ...docData,
          id: generateId(),
          slug,
          createdAt: now,
          updatedAt: now,
          isArchived: docData.isArchived ?? false,
          isFavorite: docData.isFavorite ?? false,
          isDeleted: docData.isDeleted ?? false,
          coverImage: docData.coverImage ?? getRandomCover(),
        }

        set((state) => ({
          documents: [...state.documents, newDoc],
        }))

        return newDoc
      },

      getDocument: (id: string) => {
        return get().documents.find((doc) => doc.id === id)
      },

      updateDocument: (id, updates) => {
        let updatedDoc: Document | undefined
        
        set((state) => {
          const index = state.documents.findIndex((doc) => doc.id === id)
          if (index === -1) return state

          updatedDoc = {
            ...state.documents[index],
            ...updates,
            updatedAt: Date.now(),
            // Prevent id and createdAt from being updated
            id: state.documents[index].id,
            createdAt: state.documents[index].createdAt,
            slug: state.documents[index].slug,
          }

          const newDocuments = [...state.documents]
          newDocuments[index] = updatedDoc!

          return { documents: newDocuments }
        })

        return updatedDoc
      },

      deleteDocument: (id, permanent = false) => {
        let success = false
        
        set((state) => {
          const index = state.documents.findIndex((doc) => doc.id === id)
          if (index === -1) return state

          const doc = state.documents[index]
          
          if (permanent) {
            // Permanent delete - remove from array
            const newDocuments = state.documents.filter((d) => d.id !== id)
            // Also delete all descendants
            const descendantIds = get().getDescendants(id).map(d => d.id)
            const finalDocuments = newDocuments.filter((d) => !descendantIds.includes(d.id))
            success = true
            return { documents: finalDocuments }
          } else {
            // Soft delete - mark as deleted
            const newDocuments = [...state.documents]
            newDocuments[index] = {
              ...doc,
              isDeleted: true,
              deletedAt: Date.now(),
              updatedAt: Date.now(),
            }
            success = true
            return { documents: newDocuments }
          }
        })

        return success
      },

      restoreDocument: (id) => {
        let success = false
        
        set((state) => {
          const index = state.documents.findIndex((doc) => doc.id === id)
          if (index === -1) return state

          const doc = state.documents[index]
          if (!doc.isDeleted) return state

          const newDocuments = [...state.documents]
          newDocuments[index] = {
            ...doc,
            isDeleted: false,
            deletedAt: undefined,
            updatedAt: Date.now(),
          }
          success = true
          return { documents: newDocuments }
        })

        return success
      },

      // Hierarchical Operations
      getChildren: (parentId: string | null) => {
        return get().documents.filter((doc) => doc.parentId === parentId && !doc.isDeleted)
      },

      getBreadcrumbPath: (docId: string) => {
        const path: Document[] = []
        let currentDoc = get().getDocument(docId)
        
        while (currentDoc) {
          path.unshift(currentDoc)
          if (currentDoc.parentId) {
            currentDoc = get().getDocument(currentDoc.parentId)
          } else {
            break
          }
        }
        
        return path
      },

      getDescendants: (docId: string) => {
        const descendants: Document[] = []
        const children = get().getChildren(docId)
        
        for (const child of children) {
          descendants.push(child)
          descendants.push(...get().getDescendants(child.id))
        }
        
        return descendants
      },

      // Utility
      generateSlug: (title: string, parentId: string | null) => {
        const existingSlugs = getAllSlugs(get().documents)
        const getParentSlug = (id: string) => get().documents.find(d => d.id === id)?.slug
        return generateSlug(title, parentId, existingSlugs, getParentSlug)
      },

      // Trash Operations
      getTrash: () => {
        return get().documents.filter((doc) => doc.isDeleted).sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0))
      },

      emptyTrash: () => {
        set((state) => ({
          documents: state.documents.filter((doc) => !doc.isDeleted),
        }))
      },

      // Favorites
      toggleFavorite: (id) => {
        set((state) => {
          const index = state.documents.findIndex((doc) => doc.id === id)
          if (index === -1) return state

          const newDocuments = [...state.documents]
          newDocuments[index] = {
            ...newDocuments[index],
            isFavorite: !newDocuments[index].isFavorite,
            updatedAt: Date.now(),
          }

          return { documents: newDocuments }
        })
      },

      getFavorites: () => {
        return get().documents.filter((doc) => doc.isFavorite && !doc.isDeleted)
      },

      // Archive
      toggleArchive: (id) => {
        set((state) => {
          const index = state.documents.findIndex((doc) => doc.id === id)
          if (index === -1) return state

          const newDocuments = [...state.documents]
          newDocuments[index] = {
            ...newDocuments[index],
            isArchived: !newDocuments[index].isArchived,
            updatedAt: Date.now(),
          }

          return { documents: newDocuments }
        })
      },

      getArchived: () => {
        return get().documents.filter((doc) => doc.isArchived && !doc.isDeleted)
      },
    }),
    {
      name: 'document-storage',
      partialize: (state) => ({
        documents: state.documents,
      }),
      onRehydrateStorage: () => (state) => {
        // Migration: ensure all documents have required fields
        if (state) {
          state.documents = state.documents.map((doc) => ({
            ...doc,
            isDeleted: doc.isDeleted ?? false,
            isArchived: doc.isArchived ?? false,
            isFavorite: doc.isFavorite ?? false,
            coverImage: doc.coverImage ?? getRandomCover(),
          }))
        }
      },
    }
  )
)

// Selectors for common queries
export const selectActiveDocuments = (state: DocumentStoreState) => 
  state.documents.filter((doc) => !doc.isDeleted && !doc.isArchived)

export const selectRootDocuments = (state: DocumentStoreState) => 
  state.documents.filter((doc) => doc.parentId === null && !doc.isDeleted && !doc.isArchived)

export const selectDocumentTree = (state: DocumentStoreState) => {
  const buildTree = (parentId: string | null): Document[] => {
    return state.documents
      .filter((doc) => doc.parentId === parentId && !doc.isDeleted && !doc.isArchived)
      .sort((a, b) => a.createdAt - b.createdAt)
  }
  return buildTree(null)
}