'use client'

import { toast } from 'sonner'
import { TiptapEditor } from './tiptap-editor'
import type { Block } from '@/types/blocks'

async function uploadFile(file: File, bucket = 'course-images'): Promise<string | null> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('bucket', bucket)
  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  const d = await res.json()
  if (!res.ok) {
    toast.error(d.error || 'Ошибка загрузки')
    return null
  }
  return d.url
}

export function BlockEditor({
  block,
  onChange,
}: {
  block: Block
  onChange: (b: Block) => void
}) {
  switch (block.type) {
    case 'heading':
      return (
        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
          <select
            className="select auto"
            value={block.level}
            onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 1 | 2 | 3 })}
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <input
            className="input"
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            placeholder="Заголовок"
          />
        </div>
      )
    case 'text':
      return <TiptapEditor value={block.html} onChange={(html) => onChange({ ...block, html })} />
    case 'list':
      return (
        <div>
          <label className="switch-row" style={{ padding: '0 0 10px' }}>
            <span className="sr-text">Нумерованный список</span>
            <span className="switch">
              <input
                type="checkbox"
                checked={block.ordered}
                onChange={(e) => onChange({ ...block, ordered: e.target.checked })}
              />
              <span className="track" />
            </span>
          </label>
          <textarea
            className="textarea"
            value={block.items.join('\n')}
            onChange={(e) => onChange({ ...block, items: e.target.value.split('\n') })}
            placeholder="Один пункт на строку"
          />
        </div>
      )
    case 'callout':
      return (
        <div>
          <select
            className="select auto"
            value={block.variant}
            onChange={(e) =>
              onChange({ ...block, variant: e.target.value as typeof block.variant })
            }
            style={{ marginBottom: 8 }}
          >
            <option value="info">Info</option>
            <option value="tip">Tip</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
          </select>
          <textarea
            className="textarea"
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
          />
        </div>
      )
    case 'video':
      return (
        <div>
          <input
            className="input"
            value={block.url}
            onChange={(e) => onChange({ ...block, url: e.target.value })}
            placeholder="URL YouTube / Vimeo"
            style={{ marginBottom: 8 }}
          />
          <input
            className="input"
            value={block.label || ''}
            onChange={(e) => onChange({ ...block, label: e.target.value })}
            placeholder="Подпись (опционально)"
          />
        </div>
      )
    case 'image':
      return (
        <div>
          {block.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.url} alt="" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 8 }} />
          )}
          <div className="row" style={{ gap: 8 }}>
            <input
              className="input"
              value={block.url}
              onChange={(e) => onChange({ ...block, url: e.target.value })}
              placeholder="URL картинки"
            />
            <label className="btn btn-outline" style={{ flex: 'none' }}>
              Загрузить
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (f) {
                    const u = await uploadFile(f, 'course-images')
                    if (u) onChange({ ...block, url: u })
                  }
                }}
              />
            </label>
          </div>
          <input
            className="input"
            value={block.caption || ''}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Подпись (опционально)"
            style={{ marginTop: 8 }}
          />
        </div>
      )
    case 'link':
      return (
        <div className="row" style={{ gap: 8 }}>
          <input
            className="input"
            value={block.title}
            onChange={(e) => onChange({ ...block, title: e.target.value })}
            placeholder="Название"
          />
          <input
            className="input"
            value={block.url}
            onChange={(e) => onChange({ ...block, url: e.target.value })}
            placeholder="URL"
          />
        </div>
      )
    case 'button':
      return (
        <div className="row" style={{ gap: 8 }}>
          <input
            className="input"
            value={block.label}
            onChange={(e) => onChange({ ...block, label: e.target.value })}
            placeholder="Текст кнопки"
          />
          <input
            className="input"
            value={block.url}
            onChange={(e) => onChange({ ...block, url: e.target.value })}
            placeholder="URL"
          />
        </div>
      )
    case 'file':
      return (
        <div>
          <div className="row" style={{ gap: 8 }}>
            <input
              className="input"
              value={block.name}
              onChange={(e) => onChange({ ...block, name: e.target.value })}
              placeholder="Имя файла"
            />
            <label className="btn btn-outline" style={{ flex: 'none' }}>
              Загрузить
              <input
                type="file"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (f) {
                    const u = await uploadFile(f, 'course-images')
                    if (u)
                      onChange({
                        ...block,
                        url: u,
                        name: block.name || f.name,
                        size: `${Math.round(f.size / 1024)} KB`,
                      })
                  }
                }}
              />
            </label>
          </div>
          {block.url && <div className="cell-sub" style={{ marginTop: 6 }}>{block.url}</div>}
        </div>
      )
    case 'divider':
      return <div className="cell-muted" style={{ fontSize: 13 }}>Горизонтальный разделитель</div>
    default:
      return null
  }
}
