'use client'

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading2,
  Heading3,
  Pilcrow,
} from 'lucide-react'

const CSS = `
.legal-ed { border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; background: #fff; }
.legal-ed-toolbar { display: flex; gap: 2px; flex-wrap: wrap; padding: 6px; border-bottom: 1px solid var(--border-2); background: var(--bg); position: sticky; top: 0; z-index: 1; }
.legal-ed-toolbar button { width: 30px; height: 30px; border: none; background: none; border-radius: 6px; display: grid; place-items: center; color: var(--ink-2); cursor: pointer; }
.legal-ed-toolbar button:hover { background: var(--beige); color: var(--ink); }
.legal-ed-toolbar button.active { background: var(--primary); color: #fff; }
.legal-ed .ProseMirror { padding: 14px 16px; min-height: 200px; max-height: 440px; overflow-y: auto; font-size: 14px; line-height: 1.65; outline: none; color: var(--ink); }
.legal-ed .ProseMirror h2 { font-size: 18px; font-weight: 700; margin: 18px 0 8px; }
.legal-ed .ProseMirror h3 { font-size: 15px; font-weight: 700; margin: 14px 0 6px; }
.legal-ed .ProseMirror p { margin: 0 0 10px; }
.legal-ed .ProseMirror ul, .legal-ed .ProseMirror ol { padding-left: 22px; margin: 0 0 10px; }
.legal-ed .ProseMirror li { margin-bottom: 5px; }
.legal-ed .ProseMirror a { color: var(--primary); text-decoration: underline; }
.legal-ed .ProseMirror:focus { outline: none; }
`

export function LegalEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (html: string) => void
}) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  if (!editor) return null
  const cls = (active: boolean) => (active ? 'active' : '')

  return (
    <div className="legal-ed">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="legal-ed-toolbar">
        <button type="button" className={cls(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Заголовок">
          <Heading2 size={16} />
        </button>
        <button type="button" className={cls(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Подзаголовок">
          <Heading3 size={16} />
        </button>
        <button type="button" className={cls(editor.isActive('paragraph'))} onClick={() => editor.chain().focus().setParagraph().run()} title="Обычный текст">
          <Pilcrow size={15} />
        </button>
        <button type="button" className={cls(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()} title="Жирный">
          <Bold size={15} />
        </button>
        <button type="button" className={cls(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()} title="Курсив">
          <Italic size={15} />
        </button>
        <button type="button" className={cls(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Маркированный список">
          <List size={15} />
        </button>
        <button type="button" className={cls(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Нумерованный список">
          <ListOrdered size={15} />
        </button>
        <button
          type="button"
          className={cls(editor.isActive('link'))}
          onClick={() => {
            const url = window.prompt('URL ссылки')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
          title="Ссылка"
        >
          <LinkIcon size={15} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
