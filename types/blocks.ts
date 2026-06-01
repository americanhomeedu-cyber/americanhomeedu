/** Course content blocks (stored in course_sections.blocks jsonb). */
export type Block =
  | { id?: string; type: 'heading'; level: 1 | 2 | 3; text: string }
  | { id?: string; type: 'text'; html: string }
  | { id?: string; type: 'list'; ordered: boolean; items: string[] }
  | {
      id?: string
      type: 'callout'
      variant: 'tip' | 'info' | 'warning' | 'success'
      text: string
    }
  | { id?: string; type: 'video'; url: string; label?: string }
  | { id?: string; type: 'image'; url: string; caption?: string }
  | { id?: string; type: 'file'; name: string; size?: string; url?: string }
  | { id?: string; type: 'link'; title: string; url: string }
  | { id?: string; type: 'button'; label: string; url: string }
  | { id?: string; type: 'divider' }

export type BlockType = Block['type']
