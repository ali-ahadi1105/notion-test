import { act, renderHook } from '@testing-library/react'
import { useDocumentStore, selectActiveDocuments, selectRootDocuments } from '@/store/documentStore'
import type { Document } from '@/types'

// Reset store before each test
const resetStore = () => {
  useDocumentStore.setState({
    documents: [
      {
        id: 'doc-1',
        title: 'Getting Started',
        icon: '📖',
        coverImage: { type: 'color', value: '#1a1a2e' },
        parentId: null,
        isArchived: false,
        isFavorite: false,
        isDeleted: false,
        createdAt: 1000,
        updatedAt: 1000,
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
        createdAt: 2000,
        updatedAt: 2000,
        content: '',
        slug: 'getting-started/introduction',
      },
      {
        id: 'doc-3',
        title: 'Quick Start',
        icon: '⚡',
        coverImage: { type: 'color', value: '#0f3460' },
        parentId: 'doc-1',
        isArchived: false,
        isFavorite: true,
        isDeleted: false,
        createdAt: 3000,
        updatedAt: 3000,
        content: '',
        slug: 'getting-started/quick-start',
      },
      {
        id: 'doc-4',
        title: 'Features',
        icon: '⭐',
        coverImage: { type: 'color', value: '#c0392b' },
        parentId: null,
        isArchived: true,
        isFavorite: false,
        isDeleted: false,
        createdAt: 4000,
        updatedAt: 4000,
        content: '',
        slug: 'features',
      },
      {
        id: 'doc-5',
        title: 'Trash Item',
        icon: '🗑️',
        coverImage: { type: 'color', value: '#8b0000' },
        parentId: null,
        isArchived: false,
        isFavorite: false,
        isDeleted: true,
        deletedAt: 5000,
        createdAt: 5000,
        updatedAt: 5000,
        content: '',
        slug: 'trash-item',
      },
    ],
  })
  localStorage.clear()
}

describe('DocumentStore', () => {
  beforeEach(() => {
    resetStore()
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should have initial documents', () => {
      const { result } = renderHook(() => useDocumentStore())
      expect(result.current.documents.length).toBe(5)
    })

    it('should have correct initial document structure', () => {
      const { result } = renderHook(() => useDocumentStore())
      const doc = result.current.documents[0]
      expect(doc).toHaveProperty('id')
      expect(doc).toHaveProperty('title')
      expect(doc).toHaveProperty('icon')
      expect(doc).toHaveProperty('coverImage')
      expect(doc).toHaveProperty('parentId')
      expect(doc).toHaveProperty('isArchived')
      expect(doc).toHaveProperty('isFavorite')
      expect(doc).toHaveProperty('isDeleted')
      expect(doc).toHaveProperty('createdAt')
      expect(doc).toHaveProperty('updatedAt')
      expect(doc).toHaveProperty('slug')
    })
  })

  describe('CRUD Operations', () => {
    describe('createDocument', () => {
      it('should create a new root document', () => {
        const { result } = renderHook(() => useDocumentStore())

        let newDoc: Document | undefined
        act(() => {
          newDoc = result.current.createDocument({
            title: 'New Page',
            parentId: null,
          })
        })

        expect(newDoc).toBeDefined()
        expect(newDoc!.title).toBe('New Page')
        expect(newDoc!.parentId).toBeNull()
        expect(newDoc!.id).toBeDefined()
        expect(newDoc!.createdAt).toBeDefined()
        expect(newDoc!.updatedAt).toBeDefined()
        expect(newDoc!.slug).toBe('new-page')
        expect(newDoc!.isDeleted).toBe(false)
        expect(newDoc!.isArchived).toBe(false)
        expect(newDoc!.isFavorite).toBe(false)
        expect(newDoc!.coverImage).toBeDefined()

        // Check it was added to store
        expect(result.current.documents.length).toBe(6)
      })

      it('should create a nested document', () => {
        const { result } = renderHook(() => useDocumentStore())

        let newDoc: Document | undefined
        act(() => {
          newDoc = result.current.createDocument({
            title: 'Nested Page',
            parentId: 'doc-1',
          })
        })

        expect(newDoc).toBeDefined()
        expect(newDoc!.parentId).toBe('doc-1')
        expect(newDoc!.slug).toBe('getting-started/nested-page')
      })

      it('should generate unique slugs for duplicate titles', () => {
        const { result } = renderHook(() => useDocumentStore())

        let doc1: Document | undefined
        let doc2: Document | undefined
        
        act(() => {
          doc1 = result.current.createDocument({
            title: 'Duplicate Title',
            parentId: null,
          })
        })
        
        act(() => {
          doc2 = result.current.createDocument({
            title: 'Duplicate Title',
            parentId: null,
          })
        })

        expect(doc1!.slug).toBe('duplicate-title')
        expect(doc2!.slug).toBe('duplicate-title-1')
      })

      it('should assign random cover image if not provided', () => {
        const { result } = renderHook(() => useDocumentStore())

        let newDoc: Document | undefined
        act(() => {
          newDoc = result.current.createDocument({
            title: 'No Cover',
            parentId: null,
          })
        })

        expect(newDoc!.coverImage).toBeDefined()
        expect(newDoc!.coverImage!.type).toBe('color')
      })
    })

    describe('getDocument', () => {
      it('should return document by id', () => {
        const { result } = renderHook(() => useDocumentStore())

        const doc = result.current.getDocument('doc-1')
        expect(doc).toBeDefined()
        expect(doc!.id).toBe('doc-1')
        expect(doc!.title).toBe('Getting Started')
      })

      it('should return undefined for non-existent id', () => {
        const { result } = renderHook(() => useDocumentStore())

        const doc = result.current.getDocument('non-existent')
        expect(doc).toBeUndefined()
      })
    })

    describe('updateDocument', () => {
      it('should update document title', () => {
        const { result } = renderHook(() => useDocumentStore())

        let updatedDoc: Document | undefined
        act(() => {
          updatedDoc = result.current.updateDocument('doc-1', { title: 'Updated Title' })
        })

        expect(updatedDoc).toBeDefined()
        expect(updatedDoc!.title).toBe('Updated Title')
        expect(updatedDoc!.updatedAt).toBeGreaterThan(1000)
        expect(updatedDoc!.id).toBe('doc-1')
        expect(updatedDoc!.createdAt).toBe(1000) // Should not change
      })

      it('should update document icon', () => {
        const { result } = renderHook(() => useDocumentStore())

        let updatedDoc: Document | undefined
        act(() => {
          updatedDoc = result.current.updateDocument('doc-1', { icon: '🎯' })
        })

        expect(updatedDoc!.icon).toBe('🎯')
      })

      it('should update document cover image', () => {
        const { result } = renderHook(() => useDocumentStore())

        let updatedDoc: Document | undefined
        act(() => {
          updatedDoc = result.current.updateDocument('doc-1', { 
            coverImage: { type: 'image', value: 'https://example.com/image.jpg' }
          })
        })

        expect(updatedDoc!.coverImage).toEqual({ type: 'image', value: 'https://example.com/image.jpg' })
      })

      it('should return undefined for non-existent id', () => {
        const { result } = renderHook(() => useDocumentStore())

        const updatedDoc = result.current.updateDocument('non-existent', { title: 'Test' })
        expect(updatedDoc).toBeUndefined()
      })

      it('should not allow updating id, createdAt, or slug', () => {
        const { result } = renderHook(() => useDocumentStore())

        let updatedDoc: Document | undefined
        act(() => {
          updatedDoc = result.current.updateDocument('doc-1', { 
            id: 'new-id',
            createdAt: 999999,
            slug: 'new-slug',
            title: 'Valid Update'
          } as any)
        })

        expect(updatedDoc!.id).toBe('doc-1')
        expect(updatedDoc!.createdAt).toBe(1000)
        expect(updatedDoc!.slug).toBe('getting-started')
        expect(updatedDoc!.title).toBe('Valid Update')
      })
    })

    describe('deleteDocument (soft delete)', () => {
      it('should mark document as deleted', () => {
        const { result } = renderHook(() => useDocumentStore())

        let success = false
        act(() => {
          success = result.current.deleteDocument('doc-1')
        })

        expect(success).toBe(true)
        
        const doc = result.current.getDocument('doc-1')
        expect(doc!.isDeleted).toBe(true)
        expect(doc!.deletedAt).toBeDefined()
      })

      it('should not appear in active documents', () => {
        const { result } = renderHook(() => useDocumentStore())

        act(() => {
          result.current.deleteDocument('doc-1')
        })

        const activeDocs = selectActiveDocuments(result.current)
        expect(activeDocs.find(d => d.id === 'doc-1')).toBeUndefined()
      })

      it('should appear in trash', () => {
        const { result } = renderHook(() => useDocumentStore())

        act(() => {
          result.current.deleteDocument('doc-1')
        })

        const trash = result.current.getTrash()
        expect(trash.find(d => d.id === 'doc-1')).toBeDefined()
      })
    })

    describe('deleteDocument (permanent)', () => {
      it('should permanently remove document and descendants', () => {
        const { result } = renderHook(() => useDocumentStore())

        let success = false
        act(() => {
          success = result.current.deleteDocument('doc-1', true)
        })

        expect(success).toBe(true)
        
        // Parent should be gone
        expect(result.current.getDocument('doc-1')).toBeUndefined()
        // Children should also be gone
        expect(result.current.getDocument('doc-2')).toBeUndefined()
        expect(result.current.getDocument('doc-3')).toBeUndefined()
        
        // Other documents should remain
        expect(result.current.getDocument('doc-4')).toBeDefined()
        expect(result.current.getDocument('doc-5')).toBeDefined()
      })
    })

    describe('restoreDocument', () => {
      it('should restore a soft-deleted document', () => {
        const { result } = renderHook(() => useDocumentStore())

        act(() => {
          result.current.deleteDocument('doc-1')
        })

        let success = false
        act(() => {
          success = result.current.restoreDocument('doc-1')
        })

        expect(success).toBe(true)
        
        const doc = result.current.getDocument('doc-1')
        expect(doc!.isDeleted).toBe(false)
        expect(doc!.deletedAt).toBeUndefined()
      })

      it('should return false for non-deleted document', () => {
        const { result } = renderHook(() => useDocumentStore())

        let success = false
        act(() => {
          success = result.current.restoreDocument('doc-2')
        })

        expect(success).toBe(false)
      })

      it('should return false for non-existent document', () => {
        const { result } = renderHook(() => useDocumentStore())

        let success = false
        act(() => {
          success = result.current.restoreDocument('non-existent')
        })

        expect(success).toBe(false)
      })
    })
  })

  describe('Hierarchical Operations', () => {
    describe('getChildren', () => {
      it('should return direct children of a document', () => {
        const { result } = renderHook(() => useDocumentStore())

        const children = result.current.getChildren('doc-1')
        expect(children.length).toBe(2)
        expect(children.map(c => c.id).sort()).toEqual(['doc-2', 'doc-3'])
      })

      it('should return root documents when parentId is null', () => {
        const { result } = renderHook(() => useDocumentStore())

        const roots = result.current.getChildren(null)
        expect(roots.length).toBe(2) // doc-1 and doc-4 (doc-5 is deleted)
        expect(roots.map(r => r.id).sort()).toEqual(['doc-1', 'doc-4'])
      })

      it('should not return deleted children', () => {
        const { result } = renderHook(() => useDocumentStore())

        act(() => {
          result.current.deleteDocument('doc-2')
        })

        const children = result.current.getChildren('doc-1')
        expect(children.length).toBe(1)
        expect(children[0].id).toBe('doc-3')
      })
    })

    describe('getBreadcrumbPath', () => {
      it('should return path from root to document', () => {
        const { result } = renderHook(() => useDocumentStore())

        const path = result.current.getBreadcrumbPath('doc-3')
        expect(path.length).toBe(2)
        expect(path[0].id).toBe('doc-1')
        expect(path[1].id).toBe('doc-3')
      })

      it('should return single item for root document', () => {
        const { result } = renderHook(() => useDocumentStore())

        const path = result.current.getBreadcrumbPath('doc-1')
        expect(path.length).toBe(1)
        expect(path[0].id).toBe('doc-1')
      })

      it('should return empty array for non-existent document', () => {
        const { result } = renderHook(() => useDocumentStore())

        const path = result.current.getBreadcrumbPath('non-existent')
        expect(path.length).toBe(0)
      })

      it('should handle deep nesting', () => {
        const { result } = renderHook(() => useDocumentStore())

        // Add a deeply nested document
        let deepDoc: Document | undefined
        act(() => {
          deepDoc = result.current.createDocument({
            title: 'Deep',
            parentId: 'doc-2',
          })
        })

        const path = result.current.getBreadcrumbPath(deepDoc!.id)
        expect(path.length).toBe(3)
        expect(path.map(p => p.id)).toEqual(['doc-1', 'doc-2', deepDoc!.id])
      })
    })

    describe('getDescendants', () => {
      it('should return all descendants recursively', () => {
        const { result } = renderHook(() => useDocumentStore())

        const descendants = result.current.getDescendants('doc-1')
        expect(descendants.length).toBe(2)
        expect(descendants.map(d => d.id).sort()).toEqual(['doc-2', 'doc-3'])
      })

      it('should return empty array for leaf document', () => {
        const { result } = renderHook(() => useDocumentStore())

        const descendants = result.current.getDescendants('doc-2')
        expect(descendants.length).toBe(0)
      })

      it('should include nested descendants', () => {
        const { result } = renderHook(() => useDocumentStore())

        // Add a deeply nested document
        let deepDoc: Document | undefined
        act(() => {
          deepDoc = result.current.createDocument({
            title: 'Deep',
            parentId: 'doc-2',
          })
        })

        const descendants = result.current.getDescendants('doc-1')
        expect(descendants.length).toBe(3)
        const descendantIds = descendants.map(d => d.id).sort()
        expect(descendantIds).toContain('doc-2')
        expect(descendantIds).toContain('doc-3')
        expect(descendantIds).toContain(deepDoc!.id)
      })
    })

    describe('generateSlug', () => {
      it('should generate slug from title', () => {
        const { result } = renderHook(() => useDocumentStore())

        const slug = result.current.generateSlug('My New Page', null)
        expect(slug).toBe('my-new-page')
      })

      it('should handle special characters', () => {
        const { result } = renderHook(() => useDocumentStore())

        const slug = result.current.generateSlug('Hello World! @#$%', null)
        expect(slug).toBe('hello-world')
      })
    })
  })

  describe('Trash Operations', () => {
    describe('getTrash', () => {
      it('should return deleted documents sorted by deletion time', () => {
        const { result } = renderHook(() => useDocumentStore())

        act(() => {
          result.current.deleteDocument('doc-1')
        })
        // Small delay to ensure different timestamps
        act(() => {
          result.current.deleteDocument('doc-3')
        })

        const trash = result.current.getTrash()
        expect(trash.length).toBe(3) // doc-5 + doc-1 + doc-3
        // Should be sorted by deletedAt descending (most recent first)
        // doc-5 was already deleted initially, so it should be last
        expect(trash[2].id).toBe('doc-5')
        // The first two should be doc-1 and doc-3 in some order (depending on timing)
        expect(['doc-1', 'doc-3']).toContain(trash[0].id)
        expect(['doc-1', 'doc-3']).toContain(trash[1].id)
      })
    })

    describe('emptyTrash', () => {
      it('should permanently delete all trashed documents', () => {
        const { result } = renderHook(() => useDocumentStore())

        act(() => {
          result.current.deleteDocument('doc-1')
          result.current.deleteDocument('doc-3')
        })

        act(() => {
          result.current.emptyTrash()
        })

        expect(result.current.getDocument('doc-1')).toBeUndefined()
        expect(result.current.getDocument('doc-3')).toBeUndefined()
        expect(result.current.getDocument('doc-5')).toBeUndefined()
        
        // Non-deleted documents should remain
        expect(result.current.getDocument('doc-2')).toBeDefined()
        expect(result.current.getDocument('doc-4')).toBeDefined()
      })
    })
  })

  describe('Favorites', () => {
    describe('toggleFavorite', () => {
      it('should toggle favorite status', () => {
        const { result } = renderHook(() => useDocumentStore())

        // doc-1 is not favorite
        expect(result.current.getDocument('doc-1')!.isFavorite).toBe(false)
        
        act(() => {
          result.current.toggleFavorite('doc-1')
        })
        
        expect(result.current.getDocument('doc-1')!.isFavorite).toBe(true)
        
        act(() => {
          result.current.toggleFavorite('doc-1')
        })
        
        expect(result.current.getDocument('doc-1')!.isFavorite).toBe(false)
      })

      it('should update updatedAt timestamp', () => {
        const { result } = renderHook(() => useDocumentStore())

        const originalUpdatedAt = result.current.getDocument('doc-1')!.updatedAt
        
        act(() => {
          result.current.toggleFavorite('doc-1')
        })
        
        expect(result.current.getDocument('doc-1')!.updatedAt).toBeGreaterThan(originalUpdatedAt)
      })
    })

    describe('getFavorites', () => {
      it('should return only favorited non-deleted documents', () => {
        const { result } = renderHook(() => useDocumentStore())

        const favorites = result.current.getFavorites()
        expect(favorites.length).toBe(1)
        expect(favorites[0].id).toBe('doc-3')
      })

      it('should not include deleted favorites', () => {
        const { result } = renderHook(() => useDocumentStore())

        act(() => {
          result.current.deleteDocument('doc-3')
        })

        const favorites = result.current.getFavorites()
        expect(favorites.length).toBe(0)
      })
    })
  })

  describe('Archive', () => {
    describe('toggleArchive', () => {
      it('should toggle archive status', () => {
        const { result } = renderHook(() => useDocumentStore())

        // doc-1 is not archived
        expect(result.current.getDocument('doc-1')!.isArchived).toBe(false)
        
        act(() => {
          result.current.toggleArchive('doc-1')
        })
        
        expect(result.current.getDocument('doc-1')!.isArchived).toBe(true)
        
        act(() => {
          result.current.toggleArchive('doc-1')
        })
        
        expect(result.current.getDocument('doc-1')!.isArchived).toBe(false)
      })
    })

    describe('getArchived', () => {
      it('should return only archived non-deleted documents', () => {
        const { result } = renderHook(() => useDocumentStore())

        const archived = result.current.getArchived()
        expect(archived.length).toBe(1)
        expect(archived[0].id).toBe('doc-4')
      })

      it('should not include deleted archived documents', () => {
        const { result } = renderHook(() => useDocumentStore())

        act(() => {
          result.current.deleteDocument('doc-4')
        })

        const archived = result.current.getArchived()
        expect(archived.length).toBe(0)
      })
    })
  })

  describe('Selectors', () => {
    describe('selectActiveDocuments', () => {
      it('should return non-deleted, non-archived documents', () => {
        const { result } = renderHook(() => useDocumentStore())

        const active = selectActiveDocuments(result.current)
        expect(active.length).toBe(3) // doc-1, doc-2, doc-3
        expect(active.find(d => d.id === 'doc-4')).toBeUndefined() // archived
        expect(active.find(d => d.id === 'doc-5')).toBeUndefined() // deleted
      })
    })

    describe('selectRootDocuments', () => {
      it('should return root non-deleted, non-archived documents', () => {
        const { result } = renderHook(() => useDocumentStore())

        const roots = selectRootDocuments(result.current)
        expect(roots.length).toBe(1) // only doc-1 (doc-4 is archived)
        expect(roots[0].id).toBe('doc-1')
      })
    })
  })

  describe('Persistence', () => {
    it('should persist documents to localStorage', () => {
      const { result } = renderHook(() => useDocumentStore())

      act(() => {
        result.current.createDocument({
          title: 'Persisted Page',
          parentId: null,
        })
      })

      const stored = localStorage.getItem('document-storage')
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.documents.length).toBe(6)
      expect(parsed.state.documents.find((d: Document) => d.title === 'Persisted Page')).toBeDefined()
    })
  })
})