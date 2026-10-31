import { act, renderHook } from '@testing-library/react'
import { useSidebarStore } from '@/store/sidebarStore'

// Reset store before each test
const resetStore = () => {
  useSidebarStore.setState({
    isCollapsed: false,
    width: 280,
    activePageId: null,
    expandedItems: new Set<string>(),
  })
}

describe('SidebarStore', () => {
  beforeEach(() => {
    resetStore()
    // Clear localStorage
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useSidebarStore())
      expect(result.current.isCollapsed).toBe(false)
      expect(result.current.width).toBe(280)
      expect(result.current.activePageId).toBeNull()
      expect(result.current.expandedItems.size).toBe(0)
    })
  })

  describe('setCollapsed', () => {
    it('should toggle collapsed state', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.setCollapsed(true)
      })

      expect(result.current.isCollapsed).toBe(true)

      act(() => {
        result.current.setCollapsed(false)
      })

      expect(result.current.isCollapsed).toBe(false)
    })
  })

  describe('setWidth', () => {
    it('should set width within bounds', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.setWidth(350)
      })

      expect(result.current.width).toBe(350)
    })

    it('should clamp width to minimum 240', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.setWidth(100)
      })

      expect(result.current.width).toBe(240)
    })

    it('should clamp width to maximum 400', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.setWidth(500)
      })

      expect(result.current.width).toBe(400)
    })
  })

  describe('setActivePage', () => {
    it('should set active page id', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.setActivePage('page-1')
      })

      expect(result.current.activePageId).toBe('page-1')
    })

    it('should allow setting active page to null', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.setActivePage('page-1')
      })

      act(() => {
        result.current.setActivePage(null)
      })

      expect(result.current.activePageId).toBeNull()
    })
  })

  describe('toggleItemExpansion', () => {
    it('should add item to expanded items when not expanded', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.toggleItemExpansion('item-1')
      })

      expect(result.current.expandedItems.has('item-1')).toBe(true)
      expect(result.current.isItemExpanded('item-1')).toBe(true)
    })

    it('should remove item from expanded items when already expanded', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.toggleItemExpansion('item-1')
      })

      expect(result.current.expandedItems.has('item-1')).toBe(true)

      act(() => {
        result.current.toggleItemExpansion('item-1')
      })

      expect(result.current.expandedItems.has('item-1')).toBe(false)
      expect(result.current.isItemExpanded('item-1')).toBe(false)
    })

    it('should handle multiple items independently', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.toggleItemExpansion('item-1')
        result.current.toggleItemExpansion('item-2')
      })

      expect(result.current.expandedItems.has('item-1')).toBe(true)
      expect(result.current.expandedItems.has('item-2')).toBe(true)

      act(() => {
        result.current.toggleItemExpansion('item-1')
      })

      expect(result.current.expandedItems.has('item-1')).toBe(false)
      expect(result.current.expandedItems.has('item-2')).toBe(true)
    })
  })

  describe('isItemExpanded', () => {
    it('should return false for non-expanded items', () => {
      const { result } = renderHook(() => useSidebarStore())
      expect(result.current.isItemExpanded('item-1')).toBe(false)
    })

    it('should return true for expanded items', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.toggleItemExpansion('item-1')
      })

      expect(result.current.isItemExpanded('item-1')).toBe(true)
    })
  })

  describe('Persistence', () => {
    it('should persist collapsed state and width to localStorage', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.setCollapsed(true)
        result.current.setWidth(320)
        result.current.toggleItemExpansion('item-1')
      })

      // Check localStorage was updated
      const stored = localStorage.getItem('sidebar-storage')
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.isCollapsed).toBe(true)
      expect(parsed.state.width).toBe(320)
      expect(parsed.state.expandedItems).toContain('item-1')
    })

    it('should not persist activePageId to localStorage', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.setActivePage('page-1')
      })

      // Check localStorage was updated
      const stored = localStorage.getItem('sidebar-storage')
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      // activePageId should not be in the persisted state
      expect(parsed.state).not.toHaveProperty('activePageId')
    })
  })
})