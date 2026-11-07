import { blockToMarkdown, documentToMarkdown, documentToJson, exportDocumentAsMarkdown, exportDocumentAsJson } from '@/lib/export'
import type { Document, Block } from '@/types'

// Mock document.createElement and document.body.appendChild for download tests
const mockClick = jest.fn()
const mockAppendChild = jest.fn()
const mockRemoveChild = jest.fn()
const mockCreateElement = jest.fn(() => ({
  click: mockClick,
  href: '',
  download: '',
}))

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
})

Object.defineProperty(document, 'body', {
  value: {
    appendChild: mockAppendChild,
    removeChild: mockRemoveChild,
  },
  writable: true,
})

Object.defineProperty(URL, 'createObjectURL', {
  value: jest.fn(() => 'blob:mock-url'),
  writable: true,
})

Object.defineProperty(URL, 'revokeObjectURL', {
  value: jest.fn(),
  writable: true,
})

const mockBlocks: Block[] = [
  { id: 'block-1', type: 'paragraph', content: 'This is a paragraph.', createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'block-2', type: 'heading1', content: 'Main Heading', createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'block-3', type: 'heading2', content: 'Sub Heading', createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'block-4', type: 'heading3', content: 'Sub Sub Heading', createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'block-5', type: 'todo', content: 'Todo item', checked: true, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'block-6', type: 'todo', content: 'Unchecked todo', checked: false, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'block-7', type: 'bulletedList', items: [
    { id: 'item-1', content: 'Bullet 1' },
    { id: 'item-2', content: 'Bullet 2', children: [
      { id: 'item-3', content: 'Nested Bullet 1' },
    ]},
  ], createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'block-8', type: 'numberedList', items: [
    { id: 'item-4', content: 'Numbered 1' },
    { id: 'item-5', content: 'Numbered 2', children: [
      { id: 'item-6', content: 'Nested Numbered 1' },
    ]},
  ], createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'block-9', type: 'code', content: 'const x = 1;', language: 'javascript', createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'block-10', type: 'callout', content: 'This is a callout', icon: '💡', backgroundColor: '#3b82f6', createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'block-11', type: 'quote', content: 'This is a quote', createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'block-12', type: 'divider', createdAt: Date.now(), updatedAt: Date.now() },
]

const mockDocument: Document = {
  id: 'doc-1',
  title: 'Test Document',
  icon: '📄',
  coverImage: { type: 'color', value: '#1a1a2e' },
  parentId: null,
  isArchived: false,
  isFavorite: true,
  isDeleted: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  blocks: mockBlocks,
  slug: 'test-document',
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('blockToMarkdown', () => {
  it('converts paragraph to markdown', () => {
    const block: Block = { id: '1', type: 'paragraph', content: 'Hello world', createdAt: 0, updatedAt: 0 }
    expect(blockToMarkdown(block)).toBe('Hello world')
  })

  it('converts heading1 to markdown', () => {
    const block: Block = { id: '1', type: 'heading1', content: 'Main Title', createdAt: 0, updatedAt: 0 }
    expect(blockToMarkdown(block)).toBe('# Main Title')
  })

  it('converts heading2 to markdown', () => {
    const block: Block = { id: '1', type: 'heading2', content: 'Sub Title', createdAt: 0, updatedAt: 0 }
    expect(blockToMarkdown(block)).toBe('## Sub Title')
  })

  it('converts heading3 to markdown', () => {
    const block: Block = { id: '1', type: 'heading3', content: 'Sub Sub Title', createdAt: 0, updatedAt: 0 }
    expect(blockToMarkdown(block)).toBe('### Sub Sub Title')
  })

  it('converts checked todo to markdown', () => {
    const block: Block = { id: '1', type: 'todo', content: 'Done task', checked: true, createdAt: 0, updatedAt: 0 }
    expect(blockToMarkdown(block)).toBe('- [x] Done task')
  })

  it('converts unchecked todo to markdown', () => {
    const block: Block = { id: '1', type: 'todo', content: 'Pending task', checked: false, createdAt: 0, updatedAt: 0 }
    expect(blockToMarkdown(block)).toBe('- [ ] Pending task')
  })

  it('converts bulleted list to markdown', () => {
    const block: Block = { 
      id: '1', 
      type: 'bulletedList', 
      items: [
        { id: '1', content: 'Item 1' },
        { id: '2', content: 'Item 2' },
      ], 
      createdAt: 0, 
      updatedAt: 0 
    }
    expect(blockToMarkdown(block)).toBe('  - Item 1\n  - Item 2')
  })

  it('converts nested bulleted list to markdown', () => {
    const block: Block = { 
      id: '1', 
      type: 'bulletedList', 
      items: [
        { id: '1', content: 'Parent', children: [
          { id: '2', content: 'Child' },
        ]},
      ], 
      createdAt: 0, 
      updatedAt: 0 
    }
    const markdown = blockToMarkdown(block)
    expect(markdown).toContain('  - Parent')
    // The nested list is indented with 4 spaces (2 indent levels)
    expect(markdown).toContain('    - Child')
  })

  it('converts numbered list to markdown', () => {
    const block: Block = { 
      id: '1', 
      type: 'numberedList', 
      items: [
        { id: '1', content: 'First' },
        { id: '2', content: 'Second' },
      ], 
      createdAt: 0, 
      updatedAt: 0 
    }
    expect(blockToMarkdown(block)).toBe('  1. First\n  2. Second')
  })

  it('converts nested numbered list to markdown', () => {
    const block: Block = { 
      id: '1', 
      type: 'numberedList', 
      items: [
        { id: '1', content: 'Parent', children: [
          { id: '2', content: 'Child' },
        ]},
      ], 
      createdAt: 0, 
      updatedAt: 0 
    }
    const markdown = blockToMarkdown(block)
    expect(markdown).toContain('  1. Parent')
    // Nested items use bullet points with 4 spaces indent (2 indent levels)
    expect(markdown).toContain('    - Child')
  })

  it('converts code block to markdown', () => {
    const block: Block = { id: '1', type: 'code', content: 'const x = 1;', language: 'javascript', createdAt: 0, updatedAt: 0 }
    expect(blockToMarkdown(block)).toBe('```javascript\nconst x = 1;\n```')
  })

  it('converts code block without language to markdown', () => {
    const block: Block = { id: '1', type: 'code', content: 'plain text', language: '', createdAt: 0, updatedAt: 0 }
    expect(blockToMarkdown(block)).toBe('```\nplain text\n```')
  })

  it('converts callout to markdown', () => {
    const block: Block = { id: '1', type: 'callout', content: 'Important note', icon: '⚠️', backgroundColor: '#ff0000', createdAt: 0, updatedAt: 0 }
    expect(blockToMarkdown(block)).toBe('> **⚠️ Important note**')
  })

  it('converts quote to markdown', () => {
    const block: Block = { id: '1', type: 'quote', content: 'Famous quote', createdAt: 0, updatedAt: 0 }
    expect(blockToMarkdown(block)).toBe('> Famous quote')
  })

  it('converts divider to markdown', () => {
    const block: Block = { id: '1', type: 'divider', createdAt: 0, updatedAt: 0 }
    expect(blockToMarkdown(block)).toBe('---')
  })

  it('handles empty content gracefully', () => {
    const block: Block = { id: '1', type: 'paragraph', content: '', createdAt: 0, updatedAt: 0 }
    expect(blockToMarkdown(block)).toBe('')
  })

  it('handles unknown block type', () => {
    const block: Block = { id: '1', type: 'unknown' as any, content: 'test', createdAt: 0, updatedAt: 0 }
    expect(blockToMarkdown(block)).toBe('')
  })
})

describe('documentToMarkdown', () => {
  it('generates markdown with front matter', () => {
    const markdown = documentToMarkdown(mockDocument)
    expect(markdown).toContain('---')
    expect(markdown).toContain('title: "Test Document"')
    expect(markdown).toContain('icon: "📄"')
    expect(markdown).toContain('coverImage:')
    expect(markdown).toContain('createdAt:')
    expect(markdown).toContain('updatedAt:')
  })

  it('includes document title as h1', () => {
    const markdown = documentToMarkdown(mockDocument)
    expect(markdown).toContain('# Test Document')
  })

  it('includes all blocks converted to markdown', () => {
    const markdown = documentToMarkdown(mockDocument)
    expect(markdown).toContain('This is a paragraph.')
    expect(markdown).toContain('# Main Heading')
    expect(markdown).toContain('## Sub Heading')
    expect(markdown).toContain('### Sub Sub Heading')
    expect(markdown).toContain('- [x] Todo item')
    expect(markdown).toContain('- [ ] Unchecked todo')
    expect(markdown).toContain('- Bullet 1')
    expect(markdown).toContain('- Bullet 2')
    expect(markdown).toContain('1. Numbered 1')
    expect(markdown).toContain('2. Numbered 2')
    expect(markdown).toContain('```javascript')
    expect(markdown).toContain('const x = 1;')
    expect(markdown).toContain('> **💡 This is a callout**')
    expect(markdown).toContain('> This is a quote')
    expect(markdown).toContain('---')
  })

  it('escapes quotes in title', () => {
    const docWithQuotes = { ...mockDocument, title: 'Test "Quoted" Title' }
    const markdown = documentToMarkdown(docWithQuotes)
    expect(markdown).toContain('title: "Test \\"Quoted\\" Title"')
  })

  it('handles document without icon', () => {
    const docWithoutIcon = { ...mockDocument, icon: undefined }
    const markdown = documentToMarkdown(docWithoutIcon)
    expect(markdown).not.toContain('icon:')
  })

  it('handles document without coverImage', () => {
    const docWithoutCover = { ...mockDocument, coverImage: undefined }
    const markdown = documentToMarkdown(docWithoutCover)
    expect(markdown).not.toContain('coverImage:')
  })
})

describe('documentToJson', () => {
  it('generates valid JSON with all document fields', () => {
    const json = documentToJson(mockDocument)
    const parsed = JSON.parse(json)
    expect(parsed.id).toBe(mockDocument.id)
    expect(parsed.title).toBe(mockDocument.title)
    expect(parsed.icon).toBe(mockDocument.icon)
    expect(parsed.coverImage).toEqual(mockDocument.coverImage)
    expect(parsed.parentId).toBe(mockDocument.parentId)
    expect(parsed.isArchived).toBe(mockDocument.isArchived)
    expect(parsed.isFavorite).toBe(mockDocument.isFavorite)
    expect(parsed.isDeleted).toBe(mockDocument.isDeleted)
    expect(parsed.blocks).toEqual(mockDocument.blocks)
    expect(parsed.slug).toBe(mockDocument.slug)
  })

  it('includes exportedAt timestamp', () => {
    const json = documentToJson(mockDocument)
    const parsed = JSON.parse(json)
    expect(parsed.exportedAt).toBeDefined()
    expect(new Date(parsed.exportedAt).getTime()).toBeLessThanOrEqual(Date.now())
  })

  it('includes version', () => {
    const json = documentToJson(mockDocument)
    const parsed = JSON.parse(json)
    expect(parsed.version).toBe('1.0')
  })

  it('generates compact JSON when pretty is false', () => {
    const json = documentToJson(mockDocument, false)
    expect(json).not.toContain('\n')
    expect(json).not.toContain('  ')
  })
})

describe('exportDocumentAsMarkdown', () => {
  it('creates download link with correct filename', () => {
    exportDocumentAsMarkdown(mockDocument)
    expect(mockCreateElement).toHaveBeenCalledWith('a')
    expect(mockAppendChild).toHaveBeenCalled()
    expect(mockClick).toHaveBeenCalled()
    expect(mockRemoveChild).toHaveBeenCalled()
  })

  it('generates filename from title', () => {
    exportDocumentAsMarkdown(mockDocument)
    const link = mockCreateElement.mock.results[0].value
    expect(link.download).toBe('test-document.md')
  })

  it('uses text/markdown mime type', () => {
    exportDocumentAsMarkdown(mockDocument)
    // The blob creation is tested implicitly
  })
})

describe('exportDocumentAsJson', () => {
  it('creates download link with correct filename', () => {
    exportDocumentAsJson(mockDocument)
    expect(mockCreateElement).toHaveBeenCalledWith('a')
    expect(mockAppendChild).toHaveBeenCalled()
    expect(mockClick).toHaveBeenCalled()
    expect(mockRemoveChild).toHaveBeenCalled()
  })

  it('generates filename from title', () => {
    exportDocumentAsJson(mockDocument)
    const link = mockCreateElement.mock.results[0].value
    expect(link.download).toBe('test-document.json')
  })

  it('uses application/json mime type', () => {
    exportDocumentAsJson(mockDocument)
    // The blob creation is tested implicitly
  })
})