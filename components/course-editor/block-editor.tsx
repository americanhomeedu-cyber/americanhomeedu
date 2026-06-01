'use client'

import { toast } from 'sonner'
import { Video, Play, Image as ImageIcon, FileText, Upload } from 'lucide-react'
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

const CALLOUT_COLORS: Record<string, [string, string]> = {
  tip: ['#F3EEFB', '#7C3AED'],
  info: ['#E9F0FD', '#2563EB'],
  warning: ['#FCF1E2', '#D97706'],
  success: ['#EAF2EC', '#4A7C59'],
}

export function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  switch (block.type) {
    case 'heading': {
      const size = block.level === 1 ? 26 : block.level === 2 ? 21 : 17
      return (
        <div>
          <div className="seg" style={{ marginBottom: 8 }}>
            {([1, 2, 3] as const).map((l) => (
              <button key={l} className={block.level === l ? 'active' : ''} onClick={() => onChange({ ...block, level: l })}>
                H{l}
              </button>
            ))}
          </div>
          <input
            className="blk-edit"
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            placeholder="Заголовок секции"
            style={{
              fontFamily: 'var(--serif)',
              fontWeight: 700,
              fontSize: size,
              border: 'none',
              background: 'transparent',
              width: '100%',
              padding: '2px 4px',
            }}
          />
        </div>
      )
    }
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
            style={{ maxWidth: 'none' }}
          />
        </div>
      )
    case 'callout': {
      const c = CALLOUT_COLORS[block.variant] || CALLOUT_COLORS.tip
      return (
        <div>
          <select
            className="select auto sm"
            value={block.variant}
            onChange={(e) => onChange({ ...block, variant: e.target.value as typeof block.variant })}
            style={{ marginBottom: 8 }}
          >
            <option value="tip">💡 Tip</option>
            <option value="info">ℹ️ Info</option>
            <option value="warning">⚠️ Warning</option>
            <option value="success">✅ Success</option>
          </select>
          <div style={{ background: c[0], borderLeft: `3px solid ${c[1]}`, borderRadius: 8, padding: '12px 14px' }}>
            <textarea
              value={block.text}
              onChange={(e) => onChange({ ...block, text: e.target.value })}
              placeholder="Текст подсказки…"
              rows={2}
              style={{
                border: 'none',
                background: 'transparent',
                width: '100%',
                resize: 'vertical',
                fontSize: 14,
                outline: 'none',
                color: 'var(--ink)',
              }}
            />
          </div>
        </div>
      )
    }
    case 'video':
      return (
        <div>
          <div className="row" style={{ gap: 8, marginBottom: 10 }}>
            <span style={{ color: 'var(--error)', display: 'flex' }}>
              <Video size={17} />
            </span>
            <input
              className="input sm"
              value={block.url}
              onChange={(e) => onChange({ ...block, url: e.target.value })}
              placeholder="youtube.com/watch?v=…"
              style={{ maxWidth: 'none' }}
            />
          </div>
          <input
            className="input sm"
            value={block.label || ''}
            onChange={(e) => onChange({ ...block, label: e.target.value })}
            placeholder="Подпись (опционально)"
            style={{ maxWidth: 'none', marginBottom: block.url ? 10 : 0 }}
          />
          {block.url && (
            <div style={{ aspectRatio: '16 / 9', background: '#1A1A1A', borderRadius: 8, display: 'grid', placeItems: 'center', color: '#fff' }}>
              <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,.15)', display: 'grid', placeItems: 'center' }}>
                <Play size={22} />
              </span>
            </div>
          )}
        </div>
      )
    case 'image':
      return (
        <div>
          {block.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.url} alt="" style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
          ) : (
            <label className="blk-dropzone" style={{ display: 'block', marginBottom: 8 }}>
              <ImageIcon size={26} />
              <div style={{ marginTop: 8, fontSize: 13 }}>Перетащите файл или нажмите для выбора</div>
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
          )}
          <div className="row" style={{ gap: 8 }}>
            <input
              className="input sm"
              value={block.url}
              onChange={(e) => onChange({ ...block, url: e.target.value })}
              placeholder="URL картинки"
              style={{ maxWidth: 'none' }}
            />
            <label className="btn btn-outline btn-sm" style={{ flex: 'none' }}>
              <Upload size={14} />
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
            className="input sm"
            value={block.caption || ''}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Подпись (опционально)"
            style={{ maxWidth: 'none', marginTop: 8 }}
          />
        </div>
      )
    case 'link':
      return (
        <div className="row" style={{ gap: 10 }}>
          <input
            className="input sm"
            value={block.title}
            onChange={(e) => onChange({ ...block, title: e.target.value })}
            placeholder="Текст ссылки"
            style={{ maxWidth: 'none' }}
          />
          <input
            className="input sm"
            value={block.url}
            onChange={(e) => onChange({ ...block, url: e.target.value })}
            placeholder="https://"
            style={{ maxWidth: 'none' }}
          />
        </div>
      )
    case 'button':
      return (
        <div>
          <div className="row" style={{ gap: 10, marginBottom: 10 }}>
            <input
              className="input sm"
              value={block.label}
              onChange={(e) => onChange({ ...block, label: e.target.value })}
              placeholder="Текст кнопки"
              style={{ maxWidth: 'none' }}
            />
            <input
              className="input sm"
              value={block.url}
              onChange={(e) => onChange({ ...block, url: e.target.value })}
              placeholder="URL"
              style={{ maxWidth: 'none' }}
            />
          </div>
          <button className="btn btn-primary btn-sm" type="button">
            {block.label || 'Кнопка'}
          </button>
        </div>
      )
    case 'file':
      return (
        <div>
          {block.url ? (
            <div className="row" style={{ gap: 10 }}>
              <span style={{ color: 'var(--error)', display: 'flex' }}>
                <FileText size={20} />
              </span>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{block.name || 'document.pdf'}</div>
                <div className="cell-sub">{block.size || 'Файл'}</div>
              </div>
            </div>
          ) : (
            <label className="blk-dropzone" style={{ display: 'block' }}>
              <FileText size={24} />
              <div style={{ marginTop: 8, fontSize: 13 }}>Загрузить файл (PDF, docs)</div>
              <input
                type="file"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (f) {
                    const u = await uploadFile(f, 'course-files')
                    if (u) onChange({ ...block, url: u, name: block.name || f.name, size: `${Math.round(f.size / 1024)} KB` })
                  }
                }}
              />
            </label>
          )}
          <input
            className="input sm"
            value={block.name}
            onChange={(e) => onChange({ ...block, name: e.target.value })}
            placeholder="Имя файла"
            style={{ maxWidth: 'none', marginTop: 8 }}
          />
        </div>
      )
    case 'divider':
      return <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />
    default:
      return null
  }
}
