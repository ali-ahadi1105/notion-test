'use client'

import type { Block, Document } from '@/types'

// Export block to Markdown
export function blockToMarkdown(block: Block, indent: number = 0): string {
  const prefix = '  '.repeat(indent)
  
  switch (block.type) {
    case 'paragraph':
      return `${prefix}${block.content || ''}`
    
    case 'heading1':
      return `${prefix}# ${block.content || ''}`
    
    case 'heading2':
      return `${prefix}## ${block.content || ''}`
    
    case 'heading3':
      return `${prefix}### ${block.content || ''}`
    
    case 'todo':
      return `${prefix}- [${block.checked ? 'x' : ' '}] ${block.content || ''}`
    
    case 'bulletedList':
      if (!block.items || block.items.length === 0) return ''
      return block.items
        .map((item, index) => {
          const itemIndent = '  '.repeat(indent + 1)
          const children = item.children && item.children.length > 0
            ? '\n' + item.children.map(child => blockToMarkdown({
                ...child,
                type: 'nestedListItem',
              } as Block, indent + 2)).join('\n')
            : ''
          return `${itemIndent}- ${item.content}${children}`
        })
        .join('\n')
    
    case 'nestedListItem':
      // Handle nested list items (items within a list that have content but not necessarily children arrays)
      const nestedIndent = '  '.repeat(indent)
      const nestedContent = block.content || ''
      const nestedChildren = block.items && block.items.length > 0
        ? '\n' + block.items.map((child, childIndex) => blockToMarkdown({
            ...child,
            type: 'nestedListItem',
          } as Block, indent + 1)).join('\n')
        : ''
      return `${nestedIndent}- ${nestedContent}${nestedChildren}`
    
    case 'numberedList':
      if (!block.items || block.items.length === 0) return ''
      return block.items
        .map((item, index) => {
          const itemIndent = '  '.repeat(indent + 1)
          const children = item.children && item.children.length > 0
            ? '\n' + item.children.map((child, childIndex) => blockToMarkdown({
                ...child,
                type: 'nestedListItem',
              } as Block, indent + 2)).join('\n')
            : ''
          return `${itemIndent}${index + 1}. ${item.content}${children}`
        })
        .join('\n')
    
    case 'code':
      return `${prefix}\`\`\`${block.language || ''}\n${prefix}${block.content || ''}\n${prefix}\`\`\``
    
    case 'callout':
      return `${prefix}> **${block.icon || '💡'} ${block.content || ''}**`
    
    case 'quote':
      return `${prefix}> ${block.content || ''}`
    
    case 'divider':
      return `${prefix}---`
    
    default:
      return ''
  }
}

// Export document to Markdown
export function documentToMarkdown(document: Document): string {
  const lines: string[] = []
  
  // Front matter
  lines.push('---')
  lines.push(`title: "${document.title.replace(/"/g, '\\"')}"`)
  if (document.icon) {
    const iconStr = typeof document.icon === 'string' ? document.icon : 'icon'
    lines.push(`icon: "${iconStr.replace(/"/g, '\\"')}"`)
  }
  if (document.coverImage) {
    lines.push(`coverImage: ${JSON.stringify(document.coverImage)}`)
  }
  lines.push(`createdAt: ${new Date(document.createdAt).toISOString()}`)
  lines.push(`updatedAt: ${new Date(document.updatedAt).toISOString()}`)
  lines.push('---')
  lines.push('')
  
  // Title
  lines.push(`# ${document.title}`)
  lines.push('')
  
  // Blocks
  if (document.blocks && document.blocks.length > 0) {
    for (const block of document.blocks) {
      const markdown = blockToMarkdown(block)
      if (markdown) {
        lines.push(markdown)
        lines.push('')
      }
    }
  }
  
  return lines.join('\n').trim() + '\n'
}

// Export document to JSON
export function documentToJson(document: Document, pretty: boolean = true): string {
  const exportData = {
    ...document,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  }
  return pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData)
}

// Download file helper
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export and download as Markdown
export function exportDocumentAsMarkdown(document: Document): void {
  const markdown = documentToMarkdown(document)
  const filename = `${document.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.md`
  downloadFile(markdown, filename, 'text/markdown')
}

// Export and download as JSON
export function exportDocumentAsJson(document: Document): void {
  const json = documentToJson(document)
  const filename = `${document.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.json`
  downloadFile(json, filename, 'application/json')
}

// Export all documents as a JSON bundle
export function exportAllDocumentsAsJson(documents: Document[]): void {
  const exportData = {
    documents: documents.filter(d => !d.isDeleted),
    exportedAt: new Date().toISOString(),
    version: '1.0',
    count: documents.filter(d => !d.isDeleted).length,
  }
  const json = JSON.stringify(exportData, null, 2)
  downloadFile(json, `notion-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json')
}