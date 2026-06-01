import DOMPurify from 'isomorphic-dompurify'
import {
  Sparkles,
  Info,
  TriangleAlert,
  Check,
  Play,
  FileText,
  Download,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react'
import type { Block } from '@/types/blocks'

function videoEmbed(url: string): string | null {
  const yt = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
  )
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return null
}

const calloutIcon = {
  tip: Sparkles,
  info: Info,
  warning: TriangleAlert,
  success: Check,
}

export function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading':
      return <div className={`blk-read h h${block.level}`}>{block.text}</div>
    case 'text':
      return (
        <div
          className="blk-read p"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.html) }}
        />
      )
    case 'list': {
      const items = block.items.map((it, i) => <li key={i}>{it}</li>)
      return block.ordered ? (
        <ol className="blk-read">{items}</ol>
      ) : (
        <ul className="blk-read">{items}</ul>
      )
    }
    case 'callout': {
      const Icon = calloutIcon[block.variant]
      return (
        <div className="blk-read">
          <div className={`callout ${block.variant}`}>
            <Icon size={20} />
            <p>{block.text}</p>
          </div>
        </div>
      )
    }
    case 'video': {
      const embed = videoEmbed(block.url)
      return (
        <div className="blk-read">
          <div className="video">
            {embed ? (
              <iframe
                src={embed}
                title={block.label || 'Видео'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            ) : (
              <>
                <span className="play">
                  <Play size={26} />
                </span>
                <span className="vlabel">
                  <Play size={15} />
                  {block.label || 'Видео-урок'}
                </span>
              </>
            )}
          </div>
        </div>
      )
    }
    case 'image':
      return (
        <div className="blk-read img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.url} alt={block.caption || ''} />
          {block.caption && <div className="cap">{block.caption}</div>}
        </div>
      )
    case 'file':
      return (
        <div className="blk-read">
          <div className="file-block">
            <span className="fb-ic">
              <FileText size={22} />
            </span>
            <div>
              <div className="fb-name">{block.name}</div>
              <div className="fb-meta">{block.size || 'Файл'}</div>
            </div>
            {block.url && (
              <a
                className="btn btn-outline btn-sm fb-dl"
                href={block.url}
                target="_blank"
                rel="noopener"
              >
                <Download size={15} />
                Скачать
              </a>
            )}
          </div>
        </div>
      )
    case 'link':
      return (
        <div className="blk-read">
          <a className="link-card" href={block.url} target="_blank" rel="noopener">
            <span className="lc-fav">
              <LinkIcon size={18} />
            </span>
            <div>
              <div className="lc-title">{block.title}</div>
              <div className="lc-url">{block.url}</div>
            </div>
            <span className="lc-ext">
              <ExternalLink size={17} />
            </span>
          </a>
        </div>
      )
    case 'button':
      return (
        <div className="blk-read">
          <a className="btn btn-primary" href={block.url} target="_blank" rel="noopener">
            {block.label}
          </a>
        </div>
      )
    case 'divider':
      return <hr className="blk-read div" />
    default:
      return null
  }
}
